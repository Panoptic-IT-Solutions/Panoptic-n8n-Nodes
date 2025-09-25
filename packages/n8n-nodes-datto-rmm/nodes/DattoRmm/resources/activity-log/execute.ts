import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

interface IDeviceActivity {
	id: string;
	activityTime: string;
	activityType: string;
	deviceName?: string;
	deviceId?: string;
	siteName?: string;
	siteId?: string;
	message: string;
	severity: string;
	status: string;
	activityResult: string;
	priority: string;
	data?: any;
	[key: string]: any;
}

import { NodeOperationError } from 'n8n-workflow';

/**
 * Execute activity monitoring operations using available Datto RMM API endpoints
 * Since dedicated Activity Log endpoints may not be available, this implementation
 * uses existing audit, alert, and device endpoints to monitor computer status changes.
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
					responseData = await handleGetAllDeviceStatus.call(this, i);
					break;

				case 'search':
					responseData = await handleSearchDeviceEvents.call(this, i);
					break;

				case 'getByDevice':
					responseData = await handleGetDeviceActivity.call(this, i);
					break;

				case 'getBySite':
					responseData = await handleGetSiteActivity.call(this, i);
					break;

				case 'getByUser':
					responseData = await handleGetUserActivity.call(this, i);
					break;

				default:
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for Activity monitoring!`,
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
 * Get device status information using available endpoints
 * This combines device data with recent alerts to simulate activity monitoring
 */
async function handleGetAllDeviceStatus(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	try {
		// Get all devices first
		let devices = await dattoRmmApiRequestAllItems.call(this, 'GET', '/api/v2/account/devices');

		// Filter by site if specified
		if (additionalFields.siteId) {
			devices = devices.filter((device: any) => device.siteUid === additionalFields.siteId);
		}

		// Filter by device if specified
		if (additionalFields.deviceId) {
			devices = devices.filter((device: any) => device.uid === additionalFields.deviceId);
		}

		// Get recent alerts for status change detection
		const alerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/account/alerts/open',
		);

		// Combine device data with alert information to create activity-like records
		const deviceActivities = devices.map((device: any) => {
			const deviceAlerts = alerts.filter((alert: any) => alert.deviceUid === device.uid);

			return {
				id: device.uid,
				activityTime: device.lastSeen || new Date().toISOString(),
				activityType: 'device_status',
				deviceName: device.hostname || device.displayName,
				deviceId: device.uid,
				siteName: device.siteName,
				siteId: device.siteUid,
				message: `Device ${device.hostname || device.displayName} - Status: ${device.online ? 'Online' : 'Offline'}`,
				severity: device.online ? 'low' : 'high',
				status: device.online ? 'online' : 'offline',
				activityResult: device.online ? 'success' : 'pending',
				priority: deviceAlerts.length > 0 ? 'high' : 'low',
				lastSeen: device.lastSeen,
				deviceType: device.deviceType,
				operatingSystem: device.operatingSystem,
				intIpAddress: device.intIpAddress,
				extIpAddress: device.extIpAddress,
				openAlerts: deviceAlerts.length,
				recentAlerts: deviceAlerts.slice(0, 3), // Include up to 3 recent alerts
				// Additional device status information
				patchStatus: device.patchManagement?.patchStatus,
				antivirusStatus: device.antivirus?.antivirusProductState,
				domain: device.domain,
				workgroup: device.workgroup,
				serialNumber: device.serialNumber,
				warranty: device.warranty,
				description: device.description,
			};
		});

		// Apply date filtering if specified
		let filteredActivities = deviceActivities;
		if (additionalFields.dateFrom) {
			const fromDate = new Date(additionalFields.dateFrom as string);
			filteredActivities = filteredActivities.filter(
				(activity) => new Date(activity.lastSeen || activity.activityTime) >= fromDate,
			);
		}

		if (additionalFields.dateTo) {
			const toDate = new Date(additionalFields.dateTo as string);
			filteredActivities = filteredActivities.filter(
				(activity) => new Date(activity.lastSeen || activity.activityTime) <= toDate,
			);
		}

		// Apply severity filtering
		if (additionalFields.severity) {
			filteredActivities = filteredActivities.filter(
				(activity) => activity.severity === additionalFields.severity,
			);
		}

		// Apply sorting
		const sortBy = options.sortBy || 'activityTime';
		const sortOrder = options.sortOrder || 'desc';

		filteredActivities.sort((a, b) => {
			let aValue = a[sortBy as keyof typeof a];
			let bValue = b[sortBy as keyof typeof b];

			// Handle date sorting
			if (sortBy === 'activityTime' || sortBy === 'lastSeen') {
				aValue = new Date(aValue || 0).getTime();
				bValue = new Date(bValue || 0).getTime();
			}

			if (sortOrder === 'desc') {
				return bValue > aValue ? 1 : -1;
			} else {
				return aValue > bValue ? 1 : -1;
			}
		});

		// Apply limit if not returning all
		if (!returnAll) {
			const limit = this.getNodeParameter('limit', itemIndex, 100) as number;
			filteredActivities = filteredActivities.slice(0, limit);
		}

		return filteredActivities;
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to get device status information: ${error.message}`,
			{ itemIndex },
		);
	}
}

/**
 * Search for device events using alerts and device status
 */
async function handleSearchDeviceEvents(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const searchQuery = this.getNodeParameter('searchQuery', itemIndex) as string;
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const searchOptions = this.getNodeParameter('searchOptions', itemIndex, {}) as IDataObject;

	try {
		// Get open alerts that might contain the search query
		const openAlerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/account/alerts/open',
		);

		// Get resolved alerts for more comprehensive search
		const resolvedAlerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/account/alerts/resolved',
		);

		const allAlerts = [...openAlerts, ...resolvedAlerts];

		// Filter alerts based on search query
		const caseSensitive = searchOptions.caseSensitive || false;
		const searchRegex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi');

		let matchingAlerts = allAlerts.filter((alert: any) => {
			return (
				searchRegex.test(alert.alertMessage || '') ||
				searchRegex.test(alert.deviceName || '') ||
				searchRegex.test(alert.siteName || '') ||
				searchRegex.test(alert.alertType || '')
			);
		});

		// Apply date filtering
		if (searchOptions.dateFrom) {
			const fromDate = new Date(searchOptions.dateFrom as string);
			matchingAlerts = matchingAlerts.filter(
				(alert) => new Date(alert.alertSourceTime || alert.alertDate) >= fromDate,
			);
		}

		if (searchOptions.dateTo) {
			const toDate = new Date(searchOptions.dateTo as string);
			matchingAlerts = matchingAlerts.filter(
				(alert) => new Date(alert.alertSourceTime || alert.alertDate) <= toDate,
			);
		}

		// Convert alerts to activity-like format
		const searchResults = matchingAlerts.map((alert: any) => ({
			id: alert.alertUid,
			activityTime: alert.alertSourceTime || alert.alertDate,
			activityType: 'alert',
			deviceName: alert.deviceName,
			deviceId: alert.deviceUid,
			siteName: alert.siteName,
			siteId: alert.siteUid,
			message: alert.alertMessage,
			severity: alert.priority?.toLowerCase() || 'medium',
			status: alert.alertStatus || 'active',
			activityResult: alert.alertStatus === 'resolved' ? 'success' : 'pending',
			priority: alert.priority?.toLowerCase() || 'medium',
			alertType: alert.alertType,
			alertCategory: alert.alertCategory,
			diagnostics: alert.diagnostics,
			resolution: alert.resolution,
			ticketNumber: alert.ticketNumber,
			muted: alert.muted,
		}));

		// Apply limit if not returning all
		if (!returnAll) {
			const limit = this.getNodeParameter('limit', itemIndex, 100) as number;
			return searchResults.slice(0, limit);
		}

		return searchResults;
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to search device events: ${error.message}`,
			{ itemIndex },
		);
	}
}

/**
 * Get activity for a specific device using available endpoints
 */
async function handleGetDeviceActivity(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const deviceUid = this.getNodeParameter('deviceUid', itemIndex) as string;
	const deviceOptions = this.getNodeParameter('deviceOptions', itemIndex, {}) as IDataObject;

	try {
		// Get device information
		const device = await dattoRmmApiRequest.call(this, 'GET', `/api/v2/device/${deviceUid}`);

		// Get device audit information for recent changes
		const auditData = await dattoRmmApiRequest.call(
			this,
			'GET',
			`/api/v2/audit/device/${deviceUid}`,
		);

		// Get device alerts
		const deviceAlerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/device/${deviceUid}/alerts/open`,
		);

		const resolvedAlerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/device/${deviceUid}/alerts/resolved`,
		);

		// Combine all data sources to create activity timeline
		const activities = [];

		// Add device status as activity
		activities.push({
			id: `${deviceUid}-status`,
			activityTime: device.lastSeen || new Date().toISOString(),
			activityType: 'device_status',
			deviceName: device.hostname || device.displayName,
			deviceId: deviceUid,
			siteName: device.siteName,
			siteId: device.siteUid,
			message: `Device ${device.hostname || device.displayName} is ${device.online ? 'online' : 'offline'}`,
			severity: device.online ? 'low' : 'high',
			status: device.online ? 'online' : 'offline',
			activityResult: 'success',
			priority: device.online ? 'low' : 'high',
			data: {
				deviceType: device.deviceType,
				operatingSystem: device.operatingSystem,
				lastSeen: device.lastSeen,
				ipAddress: device.intIpAddress,
			},
		});

		// Add audit changes as activities
		if (auditData && auditData.changeLog) {
			auditData.changeLog.forEach((change: any) => {
				activities.push({
					id: `audit-${change.id || Math.random()}`,
					activityTime: change.changeDate || change.auditDate,
					activityType: 'audit_change',
					deviceName: device.hostname || device.displayName,
					deviceId: deviceUid,
					siteName: device.siteName,
					siteId: device.siteUid,
					message: `Audit change: ${change.changeType} - ${change.description || change.item}`,
					severity: 'low',
					status: 'completed',
					activityResult: 'success',
					priority: 'low',
					data: change,
				});
			});
		}

		// Add alerts as activities
		[...deviceAlerts, ...resolvedAlerts].forEach((alert: any) => {
			activities.push({
				id: alert.alertUid,
				activityTime: alert.alertSourceTime || alert.alertDate,
				activityType: 'alert',
				deviceName: device.hostname || device.displayName,
				deviceId: deviceUid,
				siteName: device.siteName,
				siteId: device.siteUid,
				message: alert.alertMessage,
				severity: alert.priority?.toLowerCase() || 'medium',
				status: alert.alertStatus || 'active',
				activityResult: alert.alertStatus === 'resolved' ? 'success' : 'pending',
				priority: alert.priority?.toLowerCase() || 'medium',
				data: {
					alertType: alert.alertType,
					alertCategory: alert.alertCategory,
					diagnostics: alert.diagnostics,
					resolution: alert.resolution,
					ticketNumber: alert.ticketNumber,
					muted: alert.muted,
				},
			});
		});

		// Apply date filtering
		let filteredActivities: IDeviceActivity[] = activities;
		if (deviceOptions.dateFrom) {
			const fromDate = new Date(deviceOptions.dateFrom as string);
			filteredActivities = filteredActivities.filter(
				(activity) => new Date(activity.activityTime) >= fromDate,
			);
		}

		if (deviceOptions.dateTo) {
			const toDate = new Date(deviceOptions.dateTo as string);
			filteredActivities = filteredActivities.filter(
				(activity) => new Date(activity.activityTime) <= toDate,
			);
		}

		// Filter by activity type if specified
		if (deviceOptions.activityType && Array.isArray(deviceOptions.activityType)) {
			filteredActivities = filteredActivities.filter((activity) =>
				(deviceOptions.activityType as string[]).includes(activity.activityType),
			);
		}

		// Sort by activity time (newest first)
		filteredActivities.sort(
			(a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime(),
		);

		// Apply limit if not returning all
		const returnAll = deviceOptions.returnAll as boolean;
		if (!returnAll) {
			const limit = (deviceOptions.limit as number) || 100;
			filteredActivities = filteredActivities.slice(0, limit);
		}

		return filteredActivities;
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to get device activity: ${error.message}`,
			{ itemIndex },
		);
	}
}

/**
 * Get activity for all devices in a specific site
 */
async function handleGetSiteActivity(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const { dattoRmmApiRequest, dattoRmmApiRequestAllItems } = await import(
		'../../helpers/api.helper'
	);

	const siteUid = this.getNodeParameter('siteUid', itemIndex) as string;
	const siteOptions = this.getNodeParameter('siteOptions', itemIndex, {}) as IDataObject;

	try {
		// Get site information
		const site = await dattoRmmApiRequest.call(this, 'GET', `/api/v2/site/${siteUid}`);

		// Get all devices in the site
		const siteDevices = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/site/${siteUid}/devices`,
		);

		// Get site alerts
		const siteAlerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/site/${siteUid}/alerts/open`,
		);

		const resolvedSiteAlerts = await dattoRmmApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/site/${siteUid}/alerts/resolved`,
		);

		const activities: IDeviceActivity[] = [];

		// Add device status activities if includeDevices is true
		if (siteOptions.includeDevices !== false) {
			siteDevices.forEach((device: any) => {
				activities.push({
					id: `${device.uid}-status`,
					activityTime: device.lastSeen || new Date().toISOString(),
					activityType: 'device_status',
					deviceName: device.hostname || device.displayName,
					deviceId: device.uid,
					siteName: site.name,
					siteId: siteUid,
					message: `Device ${device.hostname || device.displayName} is ${device.online ? 'online' : 'offline'}`,
					severity: device.online ? 'low' : 'high',
					status: device.online ? 'online' : 'offline',
					activityResult: 'success',
					priority: device.online ? 'low' : 'high',
					data: {
						deviceType: device.deviceType,
						operatingSystem: device.operatingSystem,
						lastSeen: device.lastSeen,
						ipAddress: device.intIpAddress,
					},
				});
			});
		}

		// Add alerts as activities
		[...siteAlerts, ...resolvedSiteAlerts].forEach((alert: any) => {
			activities.push({
				id: alert.alertUid,
				activityTime: alert.alertSourceTime || alert.alertDate,
				activityType: 'alert',
				deviceName: alert.deviceName,
				deviceId: alert.deviceUid,
				siteName: site.name,
				siteId: siteUid,
				message: alert.alertMessage,
				severity: alert.priority?.toLowerCase() || 'medium',
				status: alert.alertStatus || 'active',
				activityResult: alert.alertStatus === 'resolved' ? 'success' : 'pending',
				priority: alert.priority?.toLowerCase() || 'medium',
				data: {
					alertType: alert.alertType,
					alertCategory: alert.alertCategory,
					diagnostics: alert.diagnostics,
					resolution: alert.resolution,
					ticketNumber: alert.ticketNumber,
					muted: alert.muted,
				},
			});
		});

		// Apply filtering and sorting similar to other operations
		let filteredActivities: IDeviceActivity[] = activities;

		// Date filtering
		if (siteOptions.dateFrom) {
			const fromDate = new Date(siteOptions.dateFrom as string);
			filteredActivities = filteredActivities.filter(
				(activity) => new Date(activity.activityTime) >= fromDate,
			);
		}

		if (siteOptions.dateTo) {
			const toDate = new Date(siteOptions.dateTo as string);
			filteredActivities = filteredActivities.filter(
				(activity) => new Date(activity.activityTime) <= toDate,
			);
		}

		// Activity type filtering
		if (siteOptions.activityType && Array.isArray(siteOptions.activityType)) {
			filteredActivities = filteredActivities.filter((activity) =>
				(siteOptions.activityType as string[]).includes(activity.activityType),
			);
		}

		// Sort by activity time (newest first)
		filteredActivities.sort(
			(a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime(),
		);

		// Apply limit
		const returnAll = siteOptions.returnAll as boolean;
		if (!returnAll) {
			const limit = (siteOptions.limit as number) || 100;
			filteredActivities = filteredActivities.slice(0, limit);
		}

		return filteredActivities;
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to get site activity: ${error.message}`, {
			itemIndex,
		});
	}
}

/**
 * Get user-related activities (limited to what's available via existing endpoints)
 */
async function handleGetUserActivity(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const userId = this.getNodeParameter('userId', itemIndex) as string;
	const userOptions = this.getNodeParameter('userOptions', itemIndex, {}) as IDataObject;

	// Note: Since there are limited user activity endpoints in Datto RMM API,
	// this operation returns a placeholder response with guidance
	const userActivities = [
		{
			id: `user-${userId}-note`,
			activityTime: new Date().toISOString(),
			activityType: 'info',
			userId: userId,
			message:
				'User activity monitoring is limited in Datto RMM API. Consider using alerts and audit logs to track user-related changes.',
			severity: 'low',
			status: 'info',
			activityResult: 'success',
			priority: 'low',
			data: {
				note: 'For comprehensive user activity tracking, monitor device activities, alerts, and audit logs where user actions may be recorded.',
				suggestions: [
					'Monitor alerts for user-related activities',
					'Check audit logs on devices for user login/logout events',
					'Use device status monitoring to track when users are active',
					'Implement webhook monitoring for real-time user activity notifications',
				],
			},
		},
	];

	return userActivities;
}
