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

	// Validate credentials
	if (!apiUrl || !apiKey || !apiSecret) {
		throw new NodeOperationError(
			context.getNode(),
			'Missing required credentials: API URL, API Key, and API Secret are all required',
			{
				description: 'Please check your Datto RMM API credentials configuration',
			},
		);
	}

	// Validate and normalize API URL
	let normalizedUrl = apiUrl.trim();
	if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
		throw new NodeOperationError(
			context.getNode(),
			'Invalid API URL format: URL must start with http:// or https://',
			{
				description:
					'Please ensure your API URL is properly formatted (e.g., https://pinotage-api.centrastage.net)',
			},
		);
	}

	// Remove trailing slashes and /api suffixes
	normalizedUrl = normalizedUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '');

	// Create a cache key based on the credentials
	const cacheKey = `${normalizedUrl}:${apiKey}`;

	// Check if we have a valid cached token
	const cached = tokenCache.get(cacheKey);
	if (cached && Date.now() < cached.expiresAt) {
		return cached.token;
	}

	// Request new token
	const tokenUrl = `${normalizedUrl}/auth/oauth/token`;

	console.log(`Attempting OAuth2 token request to: ${tokenUrl}`);
	console.log(`API Key: ${apiKey.substring(0, 8)}...`);

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

		// Log the response for debugging
		console.log('OAuth2 Response:', JSON.stringify(response, null, 2));

		if (!response.access_token) {
			// Enhanced error handling with response details
			const errorMsg = response.error || response.error_description || 'No access token received';
			const responseDetails = JSON.stringify(response, null, 2);

			throw new Error(`OAuth2 token request failed: ${errorMsg}. Response: ${responseDetails}`);
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
		// Enhanced error handling with more context
		let errorMessage = error.message;
		let description = 'Please check your API credentials and URL configuration';

		// Handle specific OAuth2 error responses
		if (error.response?.data) {
			const errorData = error.response.data;
			if (errorData.error === 'invalid_grant') {
				errorMessage = 'Invalid API credentials';
				description =
					'The API key or secret provided is incorrect. Please verify your Datto RMM API credentials.';
			} else if (errorData.error === 'invalid_client') {
				errorMessage = 'Invalid OAuth2 client configuration';
				description = 'There may be an issue with the OAuth2 client setup. Please contact support.';
			} else if (errorData.error_description) {
				errorMessage = `OAuth2 Error: ${errorData.error_description}`;
				description = 'Please check the error details and your API configuration.';
			}
		}

		throw new NodeOperationError(
			context.getNode(),
			`Failed to obtain OAuth2 access token: ${errorMessage}`,
			{
				description,
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

	// Normalize API URL (same logic as in getAccessToken)
	let normalizedUrl = apiUrl
		.trim()
		.replace(/\/+$/, '')
		.replace(/\/api\/?$/, '');

	const accessToken = await getAccessToken(context);

	return context.helpers.request({
		method,
		url: endpoint,
		baseURL: normalizedUrl,
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
