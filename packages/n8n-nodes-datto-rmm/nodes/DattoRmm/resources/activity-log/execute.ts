import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodePropertyOptions,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

/**
 * Execute activity log operations
 */
export async function executeActivityLogOperation(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0);

	// Import API helper functions
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	for (let i = 0; i < items.length; i++) {
		try {
			let responseData: any;

			switch (operation) {
				case 'getAll':
					responseData = await handleGetAllActivities.call(this, i);
					break;

				case 'search':
					responseData = await handleSearchActivities.call(this, i);
					break;

				case 'getByDevice':
					responseData = await handleGetActivitiesByDevice.call(this, i);
					break;

				case 'getBySite':
					responseData = await handleGetActivitiesBySite.call(this, i);
					break;

				case 'getByUser':
					responseData = await handleGetActivitiesByUser.call(this, i);
					break;

				default:
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for Activity Log resource!`,
						{ itemIndex: i },
					);
			}

			// Handle response data
			if (Array.isArray(responseData)) {
				returnData.push(...responseData.map((item) => ({ json: item })));
			} else {
				returnData.push({ json: responseData });
			}
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					error,
				});
				continue;
			}
			throw error;
		}
	}

	return [returnData];
}

/**
 * Get all activity logs with optional filtering
 */
async function handleGetAllActivities(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const selectColumns = this.getNodeParameter('selectColumns', itemIndex, []) as string[];
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	// Build query parameters
	const queryParams: IDataObject = {};

	// Handle date filtering
	if (additionalFields.dateFrom) {
		queryParams.dateFrom = new Date(additionalFields.dateFrom as string).toISOString();
	}
	if (additionalFields.dateTo) {
		queryParams.dateTo = new Date(additionalFields.dateTo as string).toISOString();
	}

	// Handle activity type filtering
	if (additionalFields.activityType && Array.isArray(additionalFields.activityType)) {
		queryParams.activityTypes = (additionalFields.activityType as string[]).join(',');
	}

	// Handle user, device, site filtering
	if (additionalFields.userId) {
		queryParams.userId = additionalFields.userId;
	}
	if (additionalFields.deviceId) {
		queryParams.deviceId = additionalFields.deviceId;
	}
	if (additionalFields.siteId) {
		queryParams.siteId = additionalFields.siteId;
	}
	if (additionalFields.severity) {
		queryParams.severity = additionalFields.severity;
	}

	// Handle sorting
	if (options.sortBy) {
		queryParams.sortBy = options.sortBy;
	}
	if (options.sortOrder) {
		queryParams.sortOrder = options.sortOrder;
	}

	// Handle column selection
	if (selectColumns.length > 0) {
		queryParams.fields = selectColumns.join(',');
	}

	// Handle detailed information includes
	if (options.includeUserDetails !== undefined) {
		queryParams.includeUserDetails = options.includeUserDetails;
	}
	if (options.includeDeviceDetails !== undefined) {
		queryParams.includeDeviceDetails = options.includeDeviceDetails;
	}
	if (options.includeSiteDetails !== undefined) {
		queryParams.includeSiteDetails = options.includeSiteDetails;
	}

	let responseData;

	if (returnAll) {
		responseData = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/account/activity-logs',
			{},
			queryParams,
		);
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 100) as number;
		queryParams.limit = limit;

		const response = await dattoRmmApiRequest.call(
			this,
			'GET',
			'/api/v2/account/activity-logs',
			{},
			queryParams,
		);

		responseData = response.data || response;
	}

	return Array.isArray(responseData) ? responseData : [responseData];
}

/**
 * Search activity logs using text queries
 */
async function handleSearchActivities(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const searchQuery = this.getNodeParameter('searchQuery', itemIndex) as string;
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const searchOptions = this.getNodeParameter('searchOptions', itemIndex, {}) as IDataObject;
	const selectColumns = this.getNodeParameter('selectColumns', itemIndex, []) as string[];
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	// Build query parameters
	const queryParams: IDataObject = {
		search: searchQuery,
	};

	// Handle search options
	if (searchOptions.dateFrom) {
		queryParams.dateFrom = new Date(searchOptions.dateFrom as string).toISOString();
	}
	if (searchOptions.dateTo) {
		queryParams.dateTo = new Date(searchOptions.dateTo as string).toISOString();
	}
	if (searchOptions.caseSensitive) {
		queryParams.caseSensitive = searchOptions.caseSensitive;
	}
	if (searchOptions.activityType && Array.isArray(searchOptions.activityType)) {
		queryParams.activityTypes = (searchOptions.activityType as string[]).join(',');
	}

	// Handle sorting
	if (options.sortBy) {
		queryParams.sortBy = options.sortBy;
	}
	if (options.sortOrder) {
		queryParams.sortOrder = options.sortOrder;
	}

	// Handle column selection
	if (selectColumns.length > 0) {
		queryParams.fields = selectColumns.join(',');
	}

	// Handle detailed information includes
	if (options.includeUserDetails !== undefined) {
		queryParams.includeUserDetails = options.includeUserDetails;
	}
	if (options.includeDeviceDetails !== undefined) {
		queryParams.includeDeviceDetails = options.includeDeviceDetails;
	}
	if (options.includeSiteDetails !== undefined) {
		queryParams.includeSiteDetails = options.includeSiteDetails;
	}

	let responseData;

	if (returnAll) {
		responseData = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/account/activity-logs/search',
			{},
			queryParams,
		);
	} else {
		const limit = this.getNodeParameter('limit', itemIndex, 100) as number;
		queryParams.limit = limit;

		const response = await dattoRmmApiRequest.call(
			this,
			'GET',
			'/api/v2/account/activity-logs/search',
			{},
			queryParams,
		);

		responseData = response.data || response;
	}

	return Array.isArray(responseData) ? responseData : [responseData];
}

/**
 * Get activity logs for a specific device
 */
async function handleGetActivitiesByDevice(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const deviceUid = this.getNodeParameter('deviceUid', itemIndex) as string;
	const deviceOptions = this.getNodeParameter('deviceOptions', itemIndex, {}) as IDataObject;
	const selectColumns = this.getNodeParameter('selectColumns', itemIndex, []) as string[];
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	// Build query parameters
	const queryParams: IDataObject = {};

	// Handle date filtering
	if (deviceOptions.dateFrom) {
		queryParams.dateFrom = new Date(deviceOptions.dateFrom as string).toISOString();
	}
	if (deviceOptions.dateTo) {
		queryParams.dateTo = new Date(deviceOptions.dateTo as string).toISOString();
	}

	// Handle activity type filtering
	if (deviceOptions.activityType && Array.isArray(deviceOptions.activityType)) {
		queryParams.activityTypes = (deviceOptions.activityType as string[]).join(',');
	}

	// Handle sorting
	if (options.sortBy) {
		queryParams.sortBy = options.sortBy;
	}
	if (options.sortOrder) {
		queryParams.sortOrder = options.sortOrder;
	}

	// Handle column selection
	if (selectColumns.length > 0) {
		queryParams.fields = selectColumns.join(',');
	}

	// Handle detailed information includes
	if (options.includeUserDetails !== undefined) {
		queryParams.includeUserDetails = options.includeUserDetails;
	}
	if (options.includeDeviceDetails !== undefined) {
		queryParams.includeDeviceDetails = options.includeDeviceDetails;
	}
	if (options.includeSiteDetails !== undefined) {
		queryParams.includeSiteDetails = options.includeSiteDetails;
	}

	const returnAll = deviceOptions.returnAll as boolean;
	let responseData;

	if (returnAll) {
		responseData = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/device/${deviceUid}/activity-logs`,
			{},
			queryParams,
		);
	} else {
		const limit = (deviceOptions.limit as number) || 100;
		queryParams.limit = limit;

		const response = await dattoRmmApiRequest.call(
			this,
			'GET',
			`/api/v2/device/${deviceUid}/activity-logs`,
			{},
			queryParams,
		);

		responseData = response.data || response;
	}

	return Array.isArray(responseData) ? responseData : [responseData];
}

/**
 * Get activity logs for a specific site
 */
async function handleGetActivitiesBySite(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const siteUid = this.getNodeParameter('siteUid', itemIndex) as string;
	const siteOptions = this.getNodeParameter('siteOptions', itemIndex, {}) as IDataObject;
	const selectColumns = this.getNodeParameter('selectColumns', itemIndex, []) as string[];
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	// Build query parameters
	const queryParams: IDataObject = {};

	// Handle date filtering
	if (siteOptions.dateFrom) {
		queryParams.dateFrom = new Date(siteOptions.dateFrom as string).toISOString();
	}
	if (siteOptions.dateTo) {
		queryParams.dateTo = new Date(siteOptions.dateTo as string).toISOString();
	}

	// Handle activity type filtering
	if (siteOptions.activityType && Array.isArray(siteOptions.activityType)) {
		queryParams.activityTypes = (siteOptions.activityType as string[]).join(',');
	}

	// Handle device inclusion
	if (siteOptions.includeDevices !== undefined) {
		queryParams.includeDevices = siteOptions.includeDevices;
	}

	// Handle sorting
	if (options.sortBy) {
		queryParams.sortBy = options.sortBy;
	}
	if (options.sortOrder) {
		queryParams.sortOrder = options.sortOrder;
	}

	// Handle column selection
	if (selectColumns.length > 0) {
		queryParams.fields = selectColumns.join(',');
	}

	// Handle detailed information includes
	if (options.includeUserDetails !== undefined) {
		queryParams.includeUserDetails = options.includeUserDetails;
	}
	if (options.includeDeviceDetails !== undefined) {
		queryParams.includeDeviceDetails = options.includeDeviceDetails;
	}
	if (options.includeSiteDetails !== undefined) {
		queryParams.includeSiteDetails = options.includeSiteDetails;
	}

	const returnAll = siteOptions.returnAll as boolean;
	let responseData;

	if (returnAll) {
		responseData = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/site/${siteUid}/activity-logs`,
			{},
			queryParams,
		);
	} else {
		const limit = (siteOptions.limit as number) || 100;
		queryParams.limit = limit;

		const response = await dattoRmmApiRequest.call(
			this,
			'GET',
			`/api/v2/site/${siteUid}/activity-logs`,
			{},
			queryParams,
		);

		responseData = response.data || response;
	}

	return Array.isArray(responseData) ? responseData : [responseData];
}

/**
 * Get activity logs for a specific user
 */
async function handleGetActivitiesByUser(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const userId = this.getNodeParameter('userId', itemIndex) as string;
	const userOptions = this.getNodeParameter('userOptions', itemIndex, {}) as IDataObject;
	const selectColumns = this.getNodeParameter('selectColumns', itemIndex, []) as string[];
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	// Build query parameters
	const queryParams: IDataObject = {};

	// Handle date filtering
	if (userOptions.dateFrom) {
		queryParams.dateFrom = new Date(userOptions.dateFrom as string).toISOString();
	}
	if (userOptions.dateTo) {
		queryParams.dateTo = new Date(userOptions.dateTo as string).toISOString();
	}

	// Handle activity type filtering
	if (userOptions.activityType && Array.isArray(userOptions.activityType)) {
		queryParams.activityTypes = (userOptions.activityType as string[]).join(',');
	}

	// Handle sorting
	if (options.sortBy) {
		queryParams.sortBy = options.sortBy;
	}
	if (options.sortOrder) {
		queryParams.sortOrder = options.sortOrder;
	}

	// Handle column selection
	if (selectColumns.length > 0) {
		queryParams.fields = selectColumns.join(',');
	}

	// Handle detailed information includes
	if (options.includeUserDetails !== undefined) {
		queryParams.includeUserDetails = options.includeUserDetails;
	}
	if (options.includeDeviceDetails !== undefined) {
		queryParams.includeDeviceDetails = options.includeDeviceDetails;
	}
	if (options.includeSiteDetails !== undefined) {
		queryParams.includeSiteDetails = options.includeSiteDetails;
	}

	const returnAll = userOptions.returnAll as boolean;
	let responseData;

	if (returnAll) {
		responseData = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/user/${userId}/activity-logs`,
			{},
			queryParams,
		);
	} else {
		const limit = (userOptions.limit as number) || 100;
		queryParams.limit = limit;

		const response = await dattoRmmApiRequest.call(
			this,
			'GET',
			`/api/v2/user/${userId}/activity-logs`,
			{},
			queryParams,
		);

		responseData = response.data || response;
	}

	return Array.isArray(responseData) ? responseData : [responseData];
}
