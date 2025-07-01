import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { dattoRmmApiRequest, dattoRmmApiRequestAllItems } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';

export async function executeSiteOperation(
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
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							responseData = await dattoRmmApiRequest.call(this, 'GET', `/api/v2/site/${siteUid}`);
						}
						break;

					case 'getMany':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const siteName = this.getNodeParameter('siteName', i, '') as string;

							const qs: Record<string, any> = {};
							if (siteName) {
								qs.siteName = siteName;
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allSites = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/sites',
									{},
									qs,
								);
								responseData = { sites: allSites };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 0) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								qs.page = page;
								qs.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/sites',
									{},
									qs,
								);
							}
						}
						break;

					case 'create':
						{
							const name = this.getNodeParameter('name', i) as string;
							const description = this.getNodeParameter('description', i, '') as string;
							const notes = this.getNodeParameter('notes', i, '') as string;
							const onDemand = this.getNodeParameter('onDemand', i, false) as boolean;
							const splashtopAutoInstall = this.getNodeParameter(
								'splashtopAutoInstall',
								i,
								false,
							) as boolean;

							const body: Record<string, any> = {
								name,
								onDemand,
								splashtopAutoInstall,
							};

							if (description) body.description = description;
							if (notes) body.notes = notes;

							responseData = await dattoRmmApiRequest.call(this, 'PUT', '/api/v2/site', body);
						}
						break;

					case 'update':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const name = this.getNodeParameter('name', i) as string;
							const description = this.getNodeParameter('description', i, '') as string;
							const notes = this.getNodeParameter('notes', i, '') as string;
							const onDemand = this.getNodeParameter('onDemand', i, false) as boolean;
							const splashtopAutoInstall = this.getNodeParameter(
								'splashtopAutoInstall',
								i,
								false,
							) as boolean;

							const body: Record<string, any> = {
								name,
								onDemand,
								splashtopAutoInstall,
							};

							if (description) body.description = description;
							if (notes) body.notes = notes;

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								`/api/v2/site/${siteUid}`,
								body,
							);
						}
						break;

					case 'getDevices':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const filterId = this.getNodeParameter('filterId', i, 0) as number;
							const hostname = this.getNodeParameter('hostname', i, '') as string;
							const deviceType = this.getNodeParameter('deviceType', i, '') as string;
							const operatingSystem = this.getNodeParameter('operatingSystem', i, '') as string;

							const qs: Record<string, any> = {};
							if (filterId) qs.filterId = filterId;
							if (hostname) qs.hostname = hostname;
							if (deviceType) qs.deviceType = deviceType;
							if (operatingSystem) qs.operatingSystem = operatingSystem;

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allDevices = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/devices`,
									{},
									qs,
								);
								responseData = { devices: allDevices };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 0) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								qs.page = page;
								qs.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/devices`,
									{},
									qs,
								);
							}
						}
						break;

					case 'getOpenAlerts':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const muted = this.getNodeParameter('muted', i, false) as boolean;

							const qs: Record<string, any> = { muted };

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allAlerts = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/alerts/open`,
									{},
									qs,
								);
								responseData = { alerts: allAlerts };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 0) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								qs.page = page;
								qs.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/alerts/open`,
									{},
									qs,
								);
							}
						}
						break;

					case 'getResolvedAlerts':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const muted = this.getNodeParameter('muted', i, false) as boolean;

							const qs: Record<string, any> = { muted };

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allAlerts = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/alerts/resolved`,
									{},
									qs,
								);
								responseData = { alerts: allAlerts };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 0) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								qs.page = page;
								qs.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/alerts/resolved`,
									{},
									qs,
								);
							}
						}
						break;

					case 'getVariables':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allVariables = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/variables`,
									{},
									{},
								);
								responseData = { variables: allVariables };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 0) as number;
								const max = this.getNodeParameter('max', i, 100) as number;

								const qs = { page, max };
								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									`/api/v2/site/${siteUid}/variables`,
									{},
									qs,
								);
							}
						}
						break;

					case 'getSettings':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/site/${siteUid}/settings`,
							);
						}
						break;

					case 'getFilters':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/site/${siteUid}/filters`,
							);
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for site resource`,
							{
								description: `Available operations: get, getMany, create, update, getDevices, getOpenAlerts, getResolvedAlerts, getVariables, getSettings, getFilters`,
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
							resource: 'site',
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
