import type { INodeProperties } from 'n8n-workflow';

export const activityLogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['activityLog'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description:
					'Monitor device status and activities across all devices using device and alert data',
				action: 'Get all device activities',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search device events and alerts using text queries and filters',
				action: 'Search device events',
			},
			{
				name: 'Get by Device',
				value: 'getByDevice',
				description:
					'Monitor activities for a specific device using device status, alerts, and audit data',
				action: 'Get device activities',
			},
			{
				name: 'Get by Site',
				value: 'getBySite',
				description:
					'Monitor activities for all devices in a specific site using device and alert data',
				action: 'Get site activities',
			},
			{
				name: 'Get by User',
				value: 'getByUser',
				description: 'Limited user activity information with guidance for comprehensive monitoring',
				action: 'Get user activity guidance',
			},
		],
		default: 'getAll',
	},
];

export const activityLogFields: INodeProperties[] = [
	// Operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['activityLog'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Retrieve all activity logs with optional filtering',
				action: 'Get all activity logs',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search activity logs using text queries and filters',
				action: 'Search activity logs',
			},
			{
				name: 'Get by Device',
				value: 'getByDevice',
				description: 'Get activity logs for a specific device',
				action: 'Get activity logs by device',
			},
			{
				name: 'Get by Site',
				value: 'getBySite',
				description: 'Get activity logs for a specific site',
				action: 'Get activity logs by site',
			},
			{
				name: 'Get by User',
				value: 'getByUser',
				description: 'Get activity logs for a specific user',
				action: 'Get activity logs by user',
			},
		],
		default: 'getAll',
	},
	// ====================
	// Get All Operation
	// ====================
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getAll', 'search'],
			},
		},
		default: false,
		description: 'Whether to return all device activities or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getAll', 'search'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 100,
		description: 'Max number of device activities to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description:
					'Start date for device activity monitoring (activities from this date onwards)',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for device activity monitoring (activities up to this date)',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Device Status',
						value: 'device_status',
					},
					{
						name: 'Device Online',
						value: 'device_online',
					},
					{
						name: 'Device Offline',
						value: 'device_offline',
					},
					{
						name: 'User Login',
						value: 'user_login',
					},
					{
						name: 'User Logout',
						value: 'user_logout',
					},
					{
						name: 'Failed Login',
						value: 'failed_login',
					},
					{
						name: 'User Account Changes',
						value: 'user_account_change',
					},
					{
						name: 'Alerts',
						value: 'alert',
					},
					{
						name: 'Audit Changes',
						value: 'audit_change',
					},
				],
				default: [],
				description: 'Filter by activity types available through device monitoring',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter activities by specific user ID',
			},
			{
				displayName: 'Device ID',
				name: 'deviceId',
				type: 'string',
				default: '',
				description: 'Filter activities by specific device UID',
			},
			{
				displayName: 'Site ID',
				name: 'siteId',
				type: 'string',
				default: '',
				description: 'Filter activities by specific site UID',
			},
			{
				displayName: 'Severity',
				name: 'severity',
				type: 'options',
				options: [
					{
						name: 'All',
						value: '',
					},
					{
						name: 'Low',
						value: 'low',
					},
					{
						name: 'Medium',
						value: 'medium',
					},
					{
						name: 'High',
						value: 'high',
					},
					{
						name: 'Critical',
						value: 'critical',
					},
				],
				default: '',
				description: 'Filter activities by severity level',
			},
		],
	},

	// ====================
	// Search Operation
	// ====================
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['search'],
			},
		},
		default: '',
		description:
			'Text to search for in device events and alerts (searches across alert messages, device names, etc.)',
	},
	{
		displayName: 'Search Options',
		name: 'searchOptions',
		type: 'collection',
		placeholder: 'Add Search Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['search'],
			},
		},
		options: [
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date for device event search',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for device event search',
			},
			{
				displayName: 'Case Sensitive',
				name: 'caseSensitive',
				type: 'boolean',
				default: false,
				description: 'Whether the search should be case sensitive',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Device Status',
						value: 'device_status',
					},
					{
						name: 'Device Online',
						value: 'device_online',
					},
					{
						name: 'Device Offline',
						value: 'device_offline',
					},
					{
						name: 'User Login',
						value: 'user_login',
					},
					{
						name: 'User Logout',
						value: 'user_logout',
					},
					{
						name: 'Failed Login',
						value: 'failed_login',
					},
					{
						name: 'User Account Changes',
						value: 'user_account_change',
					},
					{
						name: 'Alerts',
						value: 'alert',
					},
					{
						name: 'Audit Changes',
						value: 'audit_change',
					},
				],
				default: [],
				description: 'Limit search to specific event types',
			},
		],
	},

	// ====================
	// Get by Device Operation
	// ====================
	{
		displayName: 'Device',
		name: 'deviceUid',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getDevices',
		},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getByDevice'],
			},
		},
		default: '',
		description: 'Device to monitor activities for',
	},
	{
		displayName: 'Device Options',
		name: 'deviceOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getByDevice'],
			},
		},
		options: [
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all device activities or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 100,
				description: 'Max number of device activities to return',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date for device activity monitoring',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for device activity monitoring',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Device Status',
						value: 'device_status',
					},
					{
						name: 'Device Online',
						value: 'device_online',
					},
					{
						name: 'Device Offline',
						value: 'device_offline',
					},
					{
						name: 'User Login',
						value: 'user_login',
					},
					{
						name: 'User Logout',
						value: 'user_logout',
					},
					{
						name: 'Failed Login',
						value: 'failed_login',
					},
					{
						name: 'User Account Changes',
						value: 'user_account_change',
					},
					{
						name: 'Alerts',
						value: 'alert',
					},
					{
						name: 'Audit Changes',
						value: 'audit_change',
					},
				],
				default: [],
				description: 'Filter by available device activity types',
			},
		],
	},

	// ====================
	// Get by Site Operation
	// ====================
	{
		displayName: 'Site',
		name: 'siteUid',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getSites',
		},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getBySite'],
			},
		},
		default: '',
		description: 'Site to monitor activities for',
	},
	{
		displayName: 'Site Options',
		name: 'siteOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getBySite'],
			},
		},
		options: [
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all site activities or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 100,
				description: 'Max number of site activities to return',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date for site activity monitoring',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for site activity monitoring',
			},
			{
				displayName: 'Include Device Activities',
				name: 'includeDevices',
				type: 'boolean',
				default: true,
				description: 'Include activities from all devices in this site',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Device Status',
						value: 'device_status',
					},
					{
						name: 'Device Online',
						value: 'device_online',
					},
					{
						name: 'Device Offline',
						value: 'device_offline',
					},
					{
						name: 'User Login',
						value: 'user_login',
					},
					{
						name: 'User Logout',
						value: 'user_logout',
					},
					{
						name: 'Failed Login',
						value: 'failed_login',
					},
					{
						name: 'User Account Changes',
						value: 'user_account_change',
					},
					{
						name: 'Alerts',
						value: 'alert',
					},
					{
						name: 'Audit Changes',
						value: 'audit_change',
					},
				],
				default: [],
				description: 'Filter by available site activity types',
			},
		],
	},

	// ====================
	// Get by User Operation
	// ====================
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getByUser'],
			},
		},
		default: '',
		description: 'User ID for activity guidance (limited functionality)',
	},
	{
		displayName: 'User Options',
		name: 'userOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
				operation: ['getByUser'],
			},
		},
		options: [
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all guidance information',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 100,
				description: 'Max number of guidance items to return',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Date parameter (informational only)',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Date parameter (informational only)',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Guidance',
						value: 'info',
					},
				],
				default: [],
				description: 'Activity type (informational only)',
			},
		],
	},

	// ====================
	// Common Select Columns
	// ====================
	{
		displayName: 'Select Columns',
		name: 'selectColumns',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getSelectColumns',
		},
		displayOptions: {
			show: {
				resource: ['activityLog'],
			},
		},
		default: [],
		description:
			'Select specific columns to include in the response. Choose from available device activity fields.',
		hint: 'Leave empty to return all columns',
	},

	// ====================
	// Output Options
	// ====================
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['activityLog'],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{
						name: 'Activity Time (Default)',
						value: 'activityTime',
					},
					{
						name: 'Activity Type',
						value: 'activityType',
					},
					{
						name: 'User Name',
						value: 'userName',
					},
					{
						name: 'Device Name',
						value: 'deviceName',
					},
					{
						name: 'Site Name',
						value: 'siteName',
					},
					{
						name: 'Severity',
						value: 'severity',
					},
				],
				default: 'activityTime',
				description: 'Field to sort results by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: 'Descending (Newest First)',
						value: 'desc',
					},
					{
						name: 'Ascending (Oldest First)',
						value: 'asc',
					},
				],
				default: 'desc',
				description: 'Sort order for results',
			},
			{
				displayName: 'Include User Details',
				name: 'includeUserDetails',
				type: 'boolean',
				default: true,
				description: 'Include detailed user information in the response',
			},
			{
				displayName: 'Include Device Details',
				name: 'includeDeviceDetails',
				type: 'boolean',
				default: true,
				description: 'Include detailed device information in the response',
			},
			{
				displayName: 'Include Site Details',
				name: 'includeSiteDetails',
				type: 'boolean',
				default: true,
				description: 'Include detailed site information in the response',
			},
		],
	},
];
