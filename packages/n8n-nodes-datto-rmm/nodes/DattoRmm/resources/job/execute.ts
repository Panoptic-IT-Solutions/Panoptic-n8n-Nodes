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
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;

							// Validate required deviceUid parameter
							if (!deviceUid?.trim()) {
								throw new NodeOperationError(
									this.getNode(),
									'Device UID is required for getting job results',
									{ itemIndex: i },
								);
							}

							const endpoint = `/api/v2/job/${jobUid}/results/${deviceUid.trim()}`;
							responseData = await dattoRmmApiRequest.call(this, 'GET', endpoint);
						}
						break;

					case 'getStdOut':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;

							// Validate required deviceUid parameter
							if (!deviceUid?.trim()) {
								throw new NodeOperationError(
									this.getNode(),
									'Device UID is required for getting job standard output',
									{ itemIndex: i },
								);
							}

							const endpoint = `/api/v2/job/${jobUid}/results/${deviceUid.trim()}/stdout`;
							responseData = await dattoRmmApiRequest.call(this, 'GET', endpoint);
						}
						break;

					case 'getStdErr':
						{
							const jobUid = this.getNodeParameter('jobUid', i) as string;
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;

							// Validate required deviceUid parameter
							if (!deviceUid?.trim()) {
								throw new NodeOperationError(
									this.getNode(),
									'Device UID is required for getting job standard error',
									{ itemIndex: i },
								);
							}

							const endpoint = `/api/v2/job/${jobUid}/results/${deviceUid.trim()}/stderr`;
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

					case 'runOnSite':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const componentUid = this.getNodeParameter('componentUid', i) as string;
							const jobName = this.getNodeParameter('jobName', i) as string;
							const deviceFilters = this.getNodeParameter('deviceFilters', i, {}) as any;
							const executionOptions = this.getNodeParameter('executionOptions', i, {}) as any;

							// Validate required parameters
							if (!siteUid?.trim()) {
								throw new NodeOperationError(
									this.getNode(),
									'Site UID is required for running jobs on site',
									{ itemIndex: i },
								);
							}
							if (!componentUid?.trim()) {
								throw new NodeOperationError(
									this.getNode(),
									'Component UID is required for running jobs on site',
									{ itemIndex: i },
								);
							}

							// Get execution options with defaults
							const batchSize = executionOptions.batchSize || 10;
							const continueOnFail = executionOptions.continueOnFail !== false; // Default true
							const includeSkipped = executionOptions.includeSkipped === true; // Default false

							// Get device filters with defaults
							const operatingSystem = deviceFilters.operatingSystem || '';
							const deviceType = deviceFilters.deviceType || '';
							const onlineOnly = deviceFilters.onlineOnly !== false; // Default true

							try {
								// Get all devices for the site
								const siteDevicesResponse = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/devices`,
								);

								let devices = siteDevicesResponse.data || [];

								// Apply filters
								if (operatingSystem) {
									devices = devices.filter((device: any) =>
										device.operatingSystem?.toLowerCase().includes(operatingSystem.toLowerCase()),
									);
								}

								if (deviceType) {
									devices = devices.filter((device: any) => device.deviceType === deviceType);
								}

								if (onlineOnly) {
									devices = devices.filter(
										(device: any) => device.status === 'online' || device.online === true,
									);
								}

								const totalDevices = devices.length;
								const results: any[] = [];
								const errors: any[] = [];
								const skipped: any[] = [];

								if (totalDevices === 0) {
									responseData = {
										summary: {
											totalDevices: 0,
											processed: 0,
											successful: 0,
											failed: 0,
											skipped: 0,
											siteName: siteUid,
											jobName: jobName,
											componentUid: componentUid,
										},
										message: 'No devices found matching the specified criteria',
										results: [],
										errors: [],
										skipped: includeSkipped ? [] : undefined,
									};
									break;
								}

								// Process devices in batches
								for (let batchStart = 0; batchStart < devices.length; batchStart += batchSize) {
									const batchDevices = devices.slice(batchStart, batchStart + batchSize);

									for (const device of batchDevices) {
										try {
											const jobBody = {
												jobName: `${jobName} - ${device.hostname || device.displayName || device.uid}`,
												jobComponent: {
													componentUid,
													variables: [], // Could be extended to support job variables
												},
											};

											const jobResult = await dattoRmmApiRequest.call(
												this,
												'PUT',
												`/api/v2/device/${device.uid}/quickjob`,
												jobBody,
											);

											results.push({
												deviceUid: device.uid,
												deviceName: device.hostname || device.displayName || device.uid,
												deviceType: device.deviceType || 'Unknown',
												operatingSystem: device.operatingSystem || 'Unknown',
												status: 'success',
												jobResponse: jobResult,
											});
										} catch (error: any) {
											const errorInfo = {
												deviceUid: device.uid,
												deviceName: device.hostname || device.displayName || device.uid,
												deviceType: device.deviceType || 'Unknown',
												operatingSystem: device.operatingSystem || 'Unknown',
												status: 'error',
												error: error.message || 'Unknown error occurred',
												statusCode: error.statusCode || 0,
											};

											errors.push(errorInfo);

											if (!continueOnFail) {
												throw new NodeOperationError(
													this.getNode(),
													`Job execution failed on device ${device.hostname || device.uid}: ${error.message}`,
													{ itemIndex: i },
												);
											}
										}
									}

									// Add a small delay between batches to avoid overwhelming the API
									if (batchStart + batchSize < devices.length) {
										await new Promise((resolve) => setTimeout(resolve, 1000));
									}
								}

								// Prepare summary response
								responseData = {
									summary: {
										totalDevices: totalDevices,
										processed: results.length + errors.length,
										successful: results.length,
										failed: errors.length,
										skipped: skipped.length,
										siteName: siteUid,
										jobName: jobName,
										componentUid: componentUid,
										filters: {
											operatingSystem: operatingSystem || null,
											deviceType: deviceType || null,
											onlineOnly: onlineOnly,
										},
									},
									results: results,
									errors: errors.length > 0 ? errors : undefined,
									skipped: includeSkipped && skipped.length > 0 ? skipped : undefined,
								};
							} catch (error: any) {
								if (error.statusCode === 404) {
									throw new NodeOperationError(
										this.getNode(),
										`Site with UID "${siteUid}" was not found`,
										{ itemIndex: i },
									);
								}
								throw error;
							}
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for job resource`,
							{
								description: `Available operations: get, getComponents, getResults, getStdOut, getStdErr, getHistory, runOnSite`,
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
						case 'runOnSite':
							// Handle runOnSite operation - return summary and individual device results
							// Add the summary as the first item
							returnData.push({
								json: {
									...responseData.summary,
									operation: 'runOnSite',
									type: 'summary',
								},
								pairedItem: { item: i },
							});

							// Add each successful device result
							if (responseData.results && responseData.results.length > 0) {
								responseData.results.forEach((result: any) => {
									returnData.push({
										json: {
											...result,
											type: 'device_result',
											operation: 'runOnSite',
										},
										pairedItem: { item: i },
									});
								});
							}

							// Add error results if any
							if (responseData.errors && responseData.errors.length > 0) {
								responseData.errors.forEach((error: any) => {
									returnData.push({
										json: {
											...error,
											type: 'device_error',
											operation: 'runOnSite',
										},
										pairedItem: { item: i },
									});
								});
							}

							// Add skipped devices if included
							if (responseData.skipped && responseData.skipped.length > 0) {
								responseData.skipped.forEach((skippedDevice: any) => {
									returnData.push({
										json: {
											...skippedDevice,
											type: 'device_skipped',
											operation: 'runOnSite',
										},
										pairedItem: { item: i },
									});
								});
							}
							continue; // Skip the normal array processing
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
