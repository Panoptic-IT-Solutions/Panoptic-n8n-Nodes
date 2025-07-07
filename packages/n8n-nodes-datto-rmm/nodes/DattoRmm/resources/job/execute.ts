import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { dattoRmmApiRequest, dattoRmmApiRequestAllItems } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';

export async function executeJobOperation(
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
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							responseData = await dattoRmmApiRequest.call(this, 'GET', `/api/v2/job/${jobUid}`);
						}
						break;

					case 'getComponents':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/job/${jobUid}/components`,
							);
						}
						break;

					case 'getResults':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							const deviceUid = this.getNodeParameter('deviceUid', i, '') as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const includeOutput = this.getNodeParameter('includeOutput', i, true) as boolean;

							const queryParams: Record<string, string | number | boolean> = {};

							// Add device filter if specified
							if (deviceUid?.trim()) {
								queryParams.deviceUid = deviceUid.trim();
							}

							// Add output inclusion flag
							if (includeOutput !== undefined) {
								queryParams.includeOutput = includeOutput;
							}

							let endpoint = `/api/v2/job/${jobUid}/results`;

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allResults = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									endpoint,
									{},
									queryParams,
								);
								responseData = { results: allResults };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 1) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									endpoint,
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getStdOut':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							const deviceUid = this.getNodeParameter('deviceUid', i, '') as string;

							let endpoint = `/api/v2/job/${jobUid}/stdout`;

							// If device UID is specified, get output for specific device
							if (deviceUid?.trim()) {
								endpoint = `/api/v2/job/${jobUid}/device/${deviceUid.trim()}/stdout`;
							}

							responseData = await dattoRmmApiRequest.call(this, 'GET', endpoint);
						}
						break;

					case 'getStdErr':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							const deviceUid = this.getNodeParameter('deviceUid', i, '') as string;

							let endpoint = `/api/v2/job/${jobUid}/stderr`;

							// If device UID is specified, get error output for specific device
							if (deviceUid?.trim()) {
								endpoint = `/api/v2/job/${jobUid}/device/${deviceUid.trim()}/stderr`;
							}

							responseData = await dattoRmmApiRequest.call(this, 'GET', endpoint);
						}
						break;

					case 'getHistory':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const startDate = this.getNodeParameter('startDate', i, '') as string;
							const endDate = this.getNodeParameter('endDate', i, '') as string;
							const status = this.getNodeParameter('status', i, '') as string;

							const queryParams: Record<string, string | number> = {};

							// Add date range filters if specified
							if (startDate?.trim()) {
								queryParams.startDate = startDate.trim();
							}
							if (endDate?.trim()) {
								queryParams.endDate = endDate.trim();
							}
							if (status?.trim()) {
								queryParams.status = status.trim();
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allHistory = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/job/${jobUid}/history`,
									{},
									queryParams,
								);
								responseData = { history: allHistory };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 1) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/job/${jobUid}/history`,
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getBulkResults':
						{
							const jobUids = this.getNodeParameter('jobUids', i) as string[];
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const status = this.getNodeParameter('status', i, '') as string;
							const includeOutput = this.getNodeParameter('includeOutput', i, true) as boolean;

							// Validate that job UIDs were selected
							if (!Array.isArray(jobUids) || jobUids.length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									'At least one Job must be selected for bulk results',
									{ itemIndex: i },
								);
							}

							const allResults: any[] = [];

							// Process each job UID and collect results
							for (const jobUid of jobUids) {
								try {
									const queryParams: Record<string, string | number | boolean> = {};

									if (status?.trim()) {
										queryParams.status = status.trim();
									}
									if (includeOutput !== undefined) {
										queryParams.includeOutput = includeOutput;
									}

									if (retrieveAll) {
										// Use automatic pagination to get all results for this job
										const jobResults = await dattoRmmApiRequestAllItems.call(
											this,
											'GET',
											`/api/v2/job/${jobUid}/results`,
											{},
											queryParams,
										);

										// Add job context to each result
										jobResults.forEach((result: any) => {
											allResults.push({
												...result,
												jobUid: jobUid,
											});
										});
									} else {
										// Use manual pagination
										const page = this.getNodeParameter('page', i, 1) as number;
										const max = this.getNodeParameter('max', i, 100) as number;
										queryParams.page = page;
										queryParams.max = max;

										const jobResultsResponse = await dattoRmmApiRequest.call(
											this,
											'GET',
											`/api/v2/job/${jobUid}/results`,
											{},
											queryParams,
										);

										const jobResults = jobResultsResponse.results || [];
										jobResults.forEach((result: any) => {
											allResults.push({
												...result,
												jobUid: jobUid,
											});
										});
									}
								} catch (error) {
									// If continueOnFail is enabled, add error info and continue
									if (this.continueOnFail()) {
										allResults.push({
											error: error.message,
											jobUid: jobUid,
											failed: true,
										});
									} else {
										throw error;
									}
								}
							}

							responseData = {
								bulkResults: allResults,
								processedJobs: jobUids,
								totalResults: allResults.length,
							};
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for job resource`,
							{
								description: `Available operations: get, getComponents, getResults, getStdOut, getStdErr, getHistory, getBulkResults`,
							},
						);
				}

				// Handle response data based on operation
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

					switch (operation) {
						case 'getResults':
							dataArray = responseData.results || [];
							break;
						case 'getHistory':
							dataArray = responseData.history || [];
							break;
						case 'getBulkResults':
							dataArray = responseData.bulkResults || [];
							break;
						default:
							// Handle single object responses or structured data
							if (responseData.data && Array.isArray(responseData.data)) {
								dataArray = responseData.data;
							} else {
								// Single object response
								returnData.push({
									json: responseData,
									pairedItem: { item: i },
								});
								continue;
							}
					}

					// Add each item from the data array
					if (dataArray.length > 0) {
						dataArray.forEach((item: any) => {
							returnData.push({
								json: item,
								pairedItem: { item: i },
							});
						});
					} else {
						// Include pagination info when no data is returned
						returnData.push({
							json: {
								message: `No data found for ${operation}`,
								pageDetails: responseData.pageDetails || null,
								operation: operation,
								jobContext: operation === 'getBulkResults' ? responseData.processedJobs : undefined,
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
							resource: 'job',
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
