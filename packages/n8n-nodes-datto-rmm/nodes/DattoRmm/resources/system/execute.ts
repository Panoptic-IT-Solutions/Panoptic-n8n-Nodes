import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { dattoRmmApiRequest } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';

export async function executeSystemOperation(
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
					case 'getStatus':
						{
							const includeMetrics = this.getNodeParameter('includeMetrics', i, false) as boolean;

							const queryParams: Record<string, string | boolean> = {};

							if (includeMetrics) {
								queryParams.includeMetrics = true;
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								'/api/v2/system/status',
								{},
								queryParams,
							);
						}
						break;

					case 'getRateLimit':
						{
							const timePeriod = this.getNodeParameter('timePeriod', i, 'current') as string;
							const includeHistory = this.getNodeParameter('includeHistory', i, false) as boolean;

							const queryParams: Record<string, string | boolean> = {};

							if (timePeriod !== 'current') {
								queryParams.period = timePeriod;
							}

							if (includeHistory) {
								queryParams.includeHistory = true;
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								'/api/v2/system/ratelimit',
								{},
								queryParams,
							);
						}
						break;

					case 'getPagination':
						{
							const detailLevel = this.getNodeParameter('detailLevel', i, 'basic') as string;

							const queryParams: Record<string, string> = {};

							if (detailLevel !== 'basic') {
								queryParams.detail = detailLevel;
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								'/api/v2/system/pagination',
								{},
								queryParams,
							);
						}
						break;

					case 'getHealth':
						{
							const includeMetrics = this.getNodeParameter('includeMetrics', i, false) as boolean;

							const queryParams: Record<string, string | boolean> = {};

							if (includeMetrics) {
								queryParams.includeMetrics = true;
								queryParams.detailed = true;
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								'/api/v2/system/health',
								{},
								queryParams,
							);
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for system resource`,
							{
								description: `Available operations: getStatus, getRateLimit, getPagination, getHealth`,
							},
						);
				}

				// Handle response data
				if (Array.isArray(responseData)) {
					// Direct array response
					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else if (responseData && typeof responseData === 'object') {
					// Handle different response structures
					let dataArray: any[] = [];

					// Check for common data array patterns
					if (responseData.data && Array.isArray(responseData.data)) {
						dataArray = responseData.data;
					} else if (responseData.status && typeof responseData.status === 'object') {
						// System status specific response
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
						continue;
					} else if (responseData.rateLimit && typeof responseData.rateLimit === 'object') {
						// Rate limit specific response
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
						continue;
					} else if (responseData.pagination && typeof responseData.pagination === 'object') {
						// Pagination specific response
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
						continue;
					} else if (responseData.health && typeof responseData.health === 'object') {
						// Health specific response
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
						continue;
					} else {
						// Single object response - add directly
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
						continue;
					}

					// Add each item from the data array (if any)
					if (dataArray.length > 0) {
						dataArray.forEach((item: any) => {
							returnData.push({
								json: item,
								pairedItem: { item: i },
							});
						});
					} else {
						// Include empty result with metadata
						returnData.push({
							json: {
								message: `No data found for ${operation}`,
								operation: operation,
								systemContext: {
									timestamp: new Date().toISOString(),
									operation: operation,
								},
							},
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				// Handle individual item errors when continueOnFail is enabled
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message || 'Unknown error occurred',
							itemIndex: i,
							operation: operation,
							resource: 'system',
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

		return [returnData];
	});
}
