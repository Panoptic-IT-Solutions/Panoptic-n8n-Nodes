import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { dattoRmmApiRequest } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';

export async function executeAuditOperation(
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
					case 'getDeviceAudit':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const includeArchived = this.getNodeParameter('includeArchived', i, false) as boolean;
							const startDate = this.getNodeParameter('startDate', i, '') as string;
							const endDate = this.getNodeParameter('endDate', i, '') as string;

							const queryParams: Record<string, string | boolean> = {};

							if (includeArchived) {
								queryParams.includeArchived = true;
								if (startDate?.trim()) {
									queryParams.startDate = startDate.trim();
								}
								if (endDate?.trim()) {
									queryParams.endDate = endDate.trim();
								}
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/audit/device/${deviceUid}`,
								{},
								queryParams,
							);
						}
						break;

					case 'getSoftwareAudit':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const includeArchived = this.getNodeParameter('includeArchived', i, false) as boolean;
							const startDate = this.getNodeParameter('startDate', i, '') as string;
							const endDate = this.getNodeParameter('endDate', i, '') as string;
							const softwareName = this.getNodeParameter('softwareName', i, '') as string;
							const includeSystemSoftware = this.getNodeParameter(
								'includeSystemSoftware',
								i,
								true,
							) as boolean;

							const queryParams: Record<string, string | boolean> = {};

							if (includeArchived) {
								queryParams.includeArchived = true;
								if (startDate?.trim()) {
									queryParams.startDate = startDate.trim();
								}
								if (endDate?.trim()) {
									queryParams.endDate = endDate.trim();
								}
							}

							if (softwareName?.trim()) {
								queryParams.softwareName = softwareName.trim();
							}

							if (!includeSystemSoftware) {
								queryParams.includeSystemSoftware = false;
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/audit/device/${deviceUid}/software`,
								{},
								queryParams,
							);
						}
						break;

					case 'getHardwareAudit':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const includeArchived = this.getNodeParameter('includeArchived', i, false) as boolean;
							const startDate = this.getNodeParameter('startDate', i, '') as string;
							const endDate = this.getNodeParameter('endDate', i, '') as string;
							const hardwareCategory = this.getNodeParameter('hardwareCategory', i, '') as string;

							const queryParams: Record<string, string | boolean> = {};

							if (includeArchived) {
								queryParams.includeArchived = true;
								if (startDate?.trim()) {
									queryParams.startDate = startDate.trim();
								}
								if (endDate?.trim()) {
									queryParams.endDate = endDate.trim();
								}
							}

							if (hardwareCategory?.trim()) {
								queryParams.category = hardwareCategory.trim();
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/audit/device/${deviceUid}/hardware`,
								{},
								queryParams,
							);
						}
						break;

					case 'getPrinterAudit':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/audit/device/${deviceUid}/printer`,
							);
						}
						break;

					case 'getEsxiAudit':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/audit/device/${deviceUid}/esxi`,
							);
						}
						break;

					case 'getAuditByMac':
						{
							const macAddress = this.getNodeParameter('macAddress', i) as string;
							const auditType = this.getNodeParameter('auditType', i, 'device') as string;
							const includeArchived = this.getNodeParameter('includeArchived', i, false) as boolean;

							// Validate MAC address format (12 characters, no separators)
							const cleanMac = macAddress.replace(/[^a-fA-F0-9]/g, '');
							if (cleanMac.length !== 12) {
								throw new NodeOperationError(
									this.getNode(),
									'MAC address must be 12 characters (XXXXXXXXXXXX format, no separators)',
									{ itemIndex: i },
								);
							}

							const queryParams: Record<string, string | boolean> = {};

							if (includeArchived) {
								queryParams.includeArchived = true;
							}

							// Build endpoint based on audit type
							let endpoint = `/api/v2/audit/mac/${cleanMac}`;
							if (auditType !== 'device') {
								endpoint += `/${auditType}`;
							}

							responseData = await dattoRmmApiRequest.call(this, 'GET', endpoint, {}, queryParams);
						}
						break;

					case 'runSiteAudit':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const auditType = this.getNodeParameter('siteAuditType', i, 'device') as string;
							const includeArchived = this.getNodeParameter('includeArchived', i, false) as boolean;
							const deviceFilters = this.getNodeParameter('deviceFilters', i, {}) as any;
							const executionOptions = this.getNodeParameter('executionOptions', i, {}) as any;

							// Extract execution options with defaults
							const continueOnError = executionOptions.continueOnError ?? true;
							const maxConcurrent = Math.min(Math.max(executionOptions.maxConcurrent ?? 5, 1), 10);
							const includeSummary = executionOptions.includeSummary ?? true;

							// Get all devices in the site
							const siteDevicesResponse = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/site/${siteUid}/devices`,
							);

							let devices = siteDevicesResponse?.data || [];
							if (!Array.isArray(devices) || devices.length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									`No devices found in site ${siteUid}`,
									{ itemIndex: i },
								);
							}

							// Apply device filters if provided
							if (deviceFilters.deviceTypes && deviceFilters.deviceTypes.length > 0) {
								devices = devices.filter((device: any) =>
									deviceFilters.deviceTypes.includes(device.deviceType?.toLowerCase()),
								);
							}

							if (deviceFilters.operatingSystems && deviceFilters.operatingSystems.length > 0) {
								devices = devices.filter((device: any) => {
									const osName = device.operatingSystem?.toLowerCase() || '';
									return deviceFilters.operatingSystems.some((os: string) =>
										osName.includes(os.toLowerCase()),
									);
								});
							}

							if (deviceFilters.onlineStatus && deviceFilters.onlineStatus !== 'all') {
								const isOnlineFilter = deviceFilters.onlineStatus === 'online';
								devices = devices.filter(
									(device: any) => Boolean(device.online) === isOnlineFilter,
								);
							}

							if (devices.length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									'No devices match the specified filters in the selected site',
									{ itemIndex: i },
								);
							}

							// Prepare audit results
							const auditResults: any[] = [];
							const errors: any[] = [];

							// Process devices in batches for concurrent execution
							for (let batchStart = 0; batchStart < devices.length; batchStart += maxConcurrent) {
								const batch = devices.slice(batchStart, batchStart + maxConcurrent);
								const batchPromises = batch.map(async (device: any) => {
									try {
										const queryParams: Record<string, string | boolean> = {};
										if (includeArchived) {
											queryParams.includeArchived = true;
										}

										// Build endpoint based on audit type
										let endpoint = `/api/v2/audit/device/${device.uid}`;
										if (auditType !== 'device') {
											endpoint += `/${auditType}`;
										}

										const deviceAuditData = await dattoRmmApiRequest.call(
											this,
											'GET',
											endpoint,
											{},
											queryParams,
										);

										return {
											success: true,
											deviceUid: device.uid,
											deviceName: device.hostname || device.displayName || device.uid,
											auditType,
											auditData: deviceAuditData,
										};
									} catch (error) {
										const errorInfo = {
											success: false,
											deviceUid: device.uid,
											deviceName: device.hostname || device.displayName || device.uid,
											auditType,
											error: error.message || 'Unknown error occurred',
										};

										if (!continueOnError) {
											throw new NodeOperationError(
												this.getNode(),
												`Audit failed for device ${device.hostname || device.uid}: ${error.message}`,
												{ itemIndex: i },
											);
										}

										return errorInfo;
									}
								});

								// Wait for current batch to complete
								const batchResults = await Promise.all(batchPromises);
								batchResults.forEach((result) => {
									if (result.success) {
										auditResults.push(result);
									} else {
										errors.push(result);
									}
								});
							}

							// Build response data
							const summaryData = {
								siteUid,
								auditType,
								totalDevices: devices.length,
								successfulAudits: auditResults.length,
								failedAudits: errors.length,
								executionOptions: {
									continueOnError,
									maxConcurrent,
									includeArchived,
								},
								timestamp: new Date().toISOString(),
							};

							// Prepare response based on includeSummary option
							responseData = {
								auditResults,
								errors: errors.length > 0 ? errors : undefined,
								summary: includeSummary ? summaryData : undefined,
							};
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for audit resource`,
							{
								description: `Available operations: getDeviceAudit, getSoftwareAudit, getHardwareAudit, getPrinterAudit, getEsxiAudit, getAuditByMac, runSiteAudit`,
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
					// Handle special case for runSiteAudit operation
					if (operation === 'runSiteAudit' && responseData.auditResults) {
						// Process each audit result from the site audit
						responseData.auditResults.forEach((auditResult: any) => {
							returnData.push({
								json: auditResult,
								pairedItem: { item: i },
							});
						});

						// Add error results if any exist
						if (
							responseData.errors &&
							Array.isArray(responseData.errors) &&
							responseData.errors.length > 0
						) {
							responseData.errors.forEach((errorResult: any) => {
								returnData.push({
									json: errorResult,
									pairedItem: { item: i },
								});
							});
						}

						// Add summary as the last item if included
						if (responseData.summary) {
							returnData.push({
								json: {
									...responseData.summary,
									itemType: 'site-audit-summary',
								},
								pairedItem: { item: i },
							});
						}
						continue;
					}

					// Handle different response structures
					let dataArray: any[] = [];

					// Check for common data array patterns
					if (responseData.data && Array.isArray(responseData.data)) {
						dataArray = responseData.data;
					} else if (responseData.auditData && Array.isArray(responseData.auditData)) {
						dataArray = responseData.auditData;
					} else if (responseData.software && Array.isArray(responseData.software)) {
						// Software audit specific response
						dataArray = responseData.software;
					} else if (responseData.hardware && Array.isArray(responseData.hardware)) {
						// Hardware audit specific response
						dataArray = responseData.hardware;
					} else {
						// Single object response - add directly
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
						continue;
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
						// Include empty result with metadata
						returnData.push({
							json: {
								message: `No audit data found for ${operation}`,
								operation: operation,
								auditContext: {
									deviceUid:
										operation === 'getAuditByMac'
											? undefined
											: this.getNodeParameter('deviceUid', i, ''),
									macAddress:
										operation === 'getAuditByMac'
											? this.getNodeParameter('macAddress', i, '')
											: undefined,
									auditType:
										operation === 'getAuditByMac'
											? this.getNodeParameter('auditType', i, 'device')
											: undefined,
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
							resource: 'audit',
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
