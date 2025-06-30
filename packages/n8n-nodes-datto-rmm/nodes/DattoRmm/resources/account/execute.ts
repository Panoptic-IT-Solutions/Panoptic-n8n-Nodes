import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleErrors, validateRequiredParams } from '../../helpers/errorHandler';

/**
 * Make authenticated API request to Datto RMM using n8n's OAuth2 system
 */
async function makeApiRequest(
	context: IExecuteFunctions,
	endpoint: string,
	method: IHttpRequestMethods = 'GET',
) {
	// Get credentials to access the API URL
	const credentials = await context.getCredentials('dattoRmmApi');
	const apiUrl = credentials.apiUrl as string;

	// Normalize API URL
	const normalizedUrl = apiUrl
		.trim()
		.replace(/\/+$/, '')
		.replace(/\/api\/?$/, '');

	// Use n8n's built-in OAuth2 request helper
	const response = await context.helpers.requestWithAuthentication.call(context, 'dattoRmmApi', {
		method,
		url: endpoint,
		baseURL: normalizedUrl,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		json: true, // Ensure response is parsed as JSON
	});

	// Handle the case where n8n sometimes returns JSON as a string
	if (typeof response === 'string') {
		try {
			return JSON.parse(response);
		} catch (error) {
			console.warn('Failed to parse string response as JSON:', response);
			return response;
		}
	}

	return response;
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
