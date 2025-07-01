import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleErrors } from '../../helpers/errorHandler';
import { dattoRmmApiRequest, dattoRmmApiRequestAllItems } from '../../helpers/oauth2.helper';

export async function executeDeviceOperation(
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
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/device/${deviceUid}`,
							);
						}
						break;

					case 'getById':
						{
							const deviceId = this.getNodeParameter('deviceId', i) as number;
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/device/id/${deviceId}`,
							);
						}
						break;

					case 'getByMacAddress':
						{
							const macAddress = this.getNodeParameter('macAddress', i) as string;
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/device/macAddress/${macAddress}`,
							);
						}
						break;

					case 'getOpenAlerts':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const muted = this.getNodeParameter('muted', i, false) as boolean;

							const qs: Record<string, any> = { muted };

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allAlerts = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/device/${deviceUid}/alerts/open`,
									{},
									qs,
								);
								responseData = { alerts: allAlerts };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 1) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								qs.page = page;
								qs.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/device/${deviceUid}/alerts/open`,
									{},
									qs,
								);
							}
						}
						break;

					case 'getResolvedAlerts':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const muted = this.getNodeParameter('muted', i, false) as boolean;

							const qs: Record<string, any> = { muted };

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allAlerts = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/device/${deviceUid}/alerts/resolved`,
									{},
									qs,
								);
								responseData = { alerts: allAlerts };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 1) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								qs.page = page;
								qs.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/device/${deviceUid}/alerts/resolved`,
									{},
									qs,
								);
							}
						}
						break;

					case 'moveDevice':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							responseData = await dattoRmmApiRequest.call(
								this,
								'PUT',
								`/api/v2/device/${deviceUid}/site/${siteUid}`,
							);
						}
						break;

					case 'createQuickJob':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const jobName = this.getNodeParameter('jobName', i) as string;
							const componentUid = this.getNodeParameter('componentUid', i) as string;

							const body = {
								jobName,
								jobComponent: {
									componentUid,
									variables: [], // Could be extended to support job variables
								},
							};

							responseData = await dattoRmmApiRequest.call(
								this,
								'PUT',
								`/api/v2/device/${deviceUid}/quickjob`,
								body,
							);
						}
						break;

					case 'setWarranty':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const warrantyDate = this.getNodeParameter('warrantyDate', i, '') as string;

							const body = {
								warrantyDate: warrantyDate || null,
							};

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								`/api/v2/device/${deviceUid}/warranty`,
								body,
							);
						}
						break;

					case 'setUdfFields':
						{
							const deviceUid = this.getNodeParameter('deviceUid', i) as string;
							const udfFields = this.getNodeParameter('udfFields', i, {}) as any;

							// Convert the field collection to a UDF object
							const udfData: Record<string, string> = {};
							if (udfFields.field && Array.isArray(udfFields.field)) {
								for (const field of udfFields.field) {
									udfData[field.name] = field.value;
								}
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								`/api/v2/device/${deviceUid}/udf`,
								udfData,
							);
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for device resource`,
							{
								description: `Available operations: get, getById, getByMacAddress, getOpenAlerts, getResolvedAlerts, moveDevice, createQuickJob, setWarranty, setUdfFields`,
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
							resource: 'device',
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
