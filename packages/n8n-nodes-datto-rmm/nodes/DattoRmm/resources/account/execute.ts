import { dattoRmmApiRequest, dattoRmmApiRequestAllItems } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function executeAccountOperation(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const operation = this.getNodeParameter('operation', 0) as string;
	const returnData: INodeExecutionData[] = [];

	return handleErrors(this, async () => {
		// For operations that retrieve lists or account info,
		// execute only once regardless of input count to avoid duplicates
		const listOperations = [
			'get',
			'getDevices',
			'getUsers',
			'getComponents',
			'getOpenAlerts',
			'getResolvedAlerts',
			'getSites',
			'getVariables',
		];
		const executeOnce = listOperations.includes(operation);
		const itemsToProcess = executeOnce ? [items[0]] : items;

		for (let i = 0; i < itemsToProcess.length; i++) {
			const itemIndex = executeOnce ? 0 : i;
			try {
				let responseData;

				switch (operation) {
					case 'get':
						{
							responseData = await dattoRmmApiRequest.call(this, 'GET', '/api/v2/account');
						}
						break;

					case 'getVariables':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allVariables = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/variables',
									{},
									{},
								);
								responseData = { variables: allVariables };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;

								const queryParams: Record<string, string | number> = {
									page,
									max,
								};

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/variables',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getDevices':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;
							const filterId = this.getNodeParameter('filterId', itemIndex, 0) as number;
							const hostname = this.getNodeParameter('hostname', itemIndex, '') as string;
							const deviceType = this.getNodeParameter('deviceType', itemIndex, '') as string;
							const operatingSystem = this.getNodeParameter(
								'operatingSystem',
								itemIndex,
								'',
							) as string;
							const siteName = this.getNodeParameter('siteName', itemIndex, '') as string;

							const queryParams: Record<string, string | number> = {};

							// Add filters if provided - safe string handling
							if (filterId > 0) {
								queryParams.filterId = filterId;
							}

							// Safe string conversion and trimming
							const safeHostname = hostname?.toString?.()?.trim?.() || '';
							if (safeHostname !== '') {
								queryParams.hostname = safeHostname;
							}

							const safeDeviceType = deviceType?.toString?.()?.trim?.() || '';
							if (safeDeviceType !== '') {
								queryParams.deviceType = safeDeviceType;
							}

							const safeOperatingSystem = operatingSystem?.toString?.()?.trim?.() || '';
							if (safeOperatingSystem !== '') {
								queryParams.operatingSystem = safeOperatingSystem;
							}

							const safeSiteName = siteName?.toString?.()?.trim?.() || '';
							if (safeSiteName !== '') {
								queryParams.siteName = safeSiteName;
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allDevices = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/devices',
									{},
									queryParams,
								);
								responseData = { devices: allDevices };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/devices',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getUsers':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allUsers = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/users',
									{},
									{},
								);
								responseData = { users: allUsers };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;

								const queryParams: Record<string, string | number> = {
									page,
									max,
								};

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/users',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getComponents':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allComponents = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/components',
									{},
									{},
								);
								responseData = { components: allComponents };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;

								const queryParams: Record<string, string | number> = {
									page,
									max,
								};

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/components',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getOpenAlerts':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;
							const muted = this.getNodeParameter('muted', itemIndex, false) as boolean;

							const queryParams: Record<string, string | number | boolean> = {};

							if (muted !== undefined) {
								queryParams.muted = muted;
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allAlerts = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/alerts/open',
									{},
									queryParams,
								);
								responseData = { alerts: allAlerts };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/alerts/open',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getResolvedAlerts':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;
							const muted = this.getNodeParameter('muted', itemIndex, false) as boolean;

							const queryParams: Record<string, string | number | boolean> = {};

							if (muted !== undefined) {
								queryParams.muted = muted;
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allAlerts = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/alerts/resolved',
									{},
									queryParams,
								);
								responseData = { alerts: allAlerts };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/alerts/resolved',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getSites':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', itemIndex, true) as boolean;
							const siteName = this.getNodeParameter('siteName', itemIndex, '') as string;

							const queryParams: Record<string, string | number> = {};

							// Safe string conversion and trimming
							const safeSiteName = siteName?.toString?.()?.trim?.() || '';
							if (safeSiteName !== '') {
								queryParams.siteName = safeSiteName;
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allSites = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/account/sites',
									{},
									queryParams,
								);
								responseData = { sites: allSites };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', itemIndex, 0) as number;
								const max = this.getNodeParameter('max', itemIndex, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/account/sites',
									{},
									queryParams,
								);
							}
						}
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: itemIndex,
						});
				}

				// Handle different response structures from Datto RMM API
				if (Array.isArray(responseData)) {
					// Direct array response
					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: itemIndex },
						});
					});
				} else if (responseData && typeof responseData === 'object') {
					// Handle Datto RMM API response structures
					let dataArray: any[] = [];

					switch (operation) {
						case 'getSites':
							dataArray = responseData.sites || [];
							break;
						case 'getDevices':
							dataArray = responseData.devices || [];
							break;
						case 'getUsers':
							dataArray = responseData.users || [];
							break;
						case 'getComponents':
							dataArray = responseData.components || [];
							break;
						case 'getOpenAlerts':
						case 'getResolvedAlerts':
							dataArray = responseData.alerts || [];
							break;
						default:
							// Handle generic responses or single objects
							if (responseData.data && Array.isArray(responseData.data)) {
								dataArray = responseData.data;
							} else {
								// Single object response
								returnData.push({
									json: responseData,
									pairedItem: { item: itemIndex },
								});
								continue;
							}
					}

					// Add each item from the data array
					if (dataArray.length > 0) {
						dataArray.forEach((item: any) => {
							returnData.push({
								json: item,
								pairedItem: { item: itemIndex },
							});
						});
					} else {
						// Include pagination info when no data is returned
						returnData.push({
							json: {
								message: 'No data found',
								pageDetails: responseData.pageDetails || null,
								operation: operation,
							},
							pairedItem: { item: itemIndex },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	});
}
