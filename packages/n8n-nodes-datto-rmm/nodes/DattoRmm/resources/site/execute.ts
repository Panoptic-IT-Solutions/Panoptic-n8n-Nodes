import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleErrors } from '../../helpers/errorHandler';
import { dattoRmmApiRequest } from '../../helpers/oauth2.helper';

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
							const page = this.getNodeParameter('page', i, 1) as number;
							const max = this.getNodeParameter('max', i, 100) as number;
							const siteName = this.getNodeParameter('siteName', i, '') as string;

							const qs: Record<string, any> = { page, max };
							if (siteName) {
								qs.siteName = siteName;
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								'/api/v2/account/sites',
								{},
								qs,
							);
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
							const page = this.getNodeParameter('page', i, 1) as number;
							const max = this.getNodeParameter('max', i, 100) as number;
							const filterId = this.getNodeParameter('filterId', i, 0) as number;
							const hostname = this.getNodeParameter('hostname', i, '') as string;
							const deviceType = this.getNodeParameter('deviceType', i, '') as string;
							const operatingSystem = this.getNodeParameter('operatingSystem', i, '') as string;

							const qs: Record<string, any> = { page, max };
							if (filterId) qs.filterId = filterId;
							if (hostname) qs.hostname = hostname;
							if (deviceType) qs.deviceType = deviceType;
							if (operatingSystem) qs.operatingSystem = operatingSystem;

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/site/${siteUid}/devices`,
								{},
								qs,
							);
						}
						break;

					case 'getOpenAlerts':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const page = this.getNodeParameter('page', i, 1) as number;
							const max = this.getNodeParameter('max', i, 100) as number;
							const muted = this.getNodeParameter('muted', i, false) as boolean;

							const qs = { page, max, muted };
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/site/${siteUid}/alerts/open`,
								{},
								qs,
							);
						}
						break;

					case 'getResolvedAlerts':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const page = this.getNodeParameter('page', i, 1) as number;
							const max = this.getNodeParameter('max', i, 100) as number;
							const muted = this.getNodeParameter('muted', i, false) as boolean;

							const qs = { page, max, muted };
							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/site/${siteUid}/alerts/resolved`,
								{},
								qs,
							);
						}
						break;

					case 'getVariables':
						{
							const siteUid = this.getNodeParameter('siteUid', i) as string;
							const page = this.getNodeParameter('page', i, 1) as number;
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
