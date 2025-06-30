import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleErrors, validateRequiredParams } from '../../helpers/errorHandler';

// Token cache to store access tokens during workflow execution
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Get OAuth2 access token for Datto RMM API
 */
async function getAccessToken(context: IExecuteFunctions): Promise<string> {
	const credentials = await context.getCredentials('dattoRmmApi');
	const apiUrl = credentials.apiUrl as string;
	const apiKey = credentials.apiKey as string;
	const apiSecret = credentials.apiSecret as string;

	// Create a cache key based on the credentials
	const cacheKey = `${apiUrl}:${apiKey}`;

	// Check if we have a valid cached token
	const cached = tokenCache.get(cacheKey);
	if (cached && Date.now() < cached.expiresAt) {
		return cached.token;
	}

	// Request new token
	const tokenUrl = `${apiUrl}/auth/oauth/token`;

	try {
		const response = await context.helpers.request({
			method: 'POST',
			url: tokenUrl,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from('public-client:public').toString('base64')}`,
			},
			body: `grant_type=password&username=${encodeURIComponent(apiKey)}&password=${encodeURIComponent(apiSecret)}`,
		});

		if (!response.access_token) {
			throw new Error('No access token received from OAuth2 response');
		}

		// Cache the token (default to 100 hours as per Datto documentation)
		const expiresIn = response.expires_in || 360000; // 100 hours in seconds
		const expiresAt = Date.now() + expiresIn * 1000;

		tokenCache.set(cacheKey, {
			token: response.access_token,
			expiresAt,
		});

		return response.access_token;
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`Failed to obtain OAuth2 access token: ${error.message}`,
			{
				description: 'Please check your API credentials and URL configuration',
			},
		);
	}
}

/**
 * Make authenticated API request to Datto RMM
 */
async function makeApiRequest(
	context: IExecuteFunctions,
	endpoint: string,
	method: IHttpRequestMethods = 'GET',
) {
	const credentials = await context.getCredentials('dattoRmmApi');
	const apiUrl = credentials.apiUrl as string;
	const accessToken = await getAccessToken(context);

	return context.helpers.request({
		method,
		url: endpoint,
		baseURL: apiUrl,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	});
}

export async function executeAccountOperation(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const operation = this.getNodeParameter('operation', 0) as string;
	const returnData: INodeExecutionData[] = [];

	return handleErrors(this, async () => {
		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				switch (operation) {
					case 'get':
						responseData = await makeApiRequest(this, '/api/v2/account');
						break;

					case 'getVariables':
						responseData = await makeApiRequest(this, '/api/v2/account/variables');
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for account resource`,
							{
								description: `Available operations: get, getVariables`,
							},
						);
				}

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				// Handle individual item errors when continueOnFail is enabled
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message || 'Unknown error occurred',
							itemIndex: i,
							operation: operation,
							resource: 'account',
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}

				// Re-throw the error to be handled by the outer handleErrors wrapper
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	});
}
