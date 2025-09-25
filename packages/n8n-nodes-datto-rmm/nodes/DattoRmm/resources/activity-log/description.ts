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
];

export const activityLogFields: INodeProperties[] = [
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
		description: 'Whether to return all results or only up to a given limit',
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
		description: 'Max number of results to return',
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
				description: 'Start date for activity log search (activities from this date onwards)',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for activity log search (activities up to this date)',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Login Activity',
						value: 'login',
					},
					{
						name: 'Licensing Activity',
						value: 'licensing',
					},
					{
						name: 'Password Reset',
						value: 'password_reset',
					},
					{
						name: '2FA Reset',
						value: 'two_factor_reset',
					},
					{
						name: 'Support Access',
						value: 'support_access',
					},
					{
						name: 'User Management',
						value: 'user_management',
					},
					{
						name: 'Device Management',
						value: 'device_management',
					},
					{
						name: 'Site Management',
						value: 'site_management',
					},
					{
						name: 'Policy Deployment',
						value: 'policy_deployment',
					},
					{
						name: 'Monitor Management',
						value: 'monitor_management',
					},
					{
						name: 'Component Activity',
						value: 'component_activity',
					},
					{
						name: 'Job Execution',
						value: 'job_execution',
					},
					{
						name: 'Report Activity',
						value: 'report_activity',
					},
				],
				default: [],
				description: 'Filter by specific activity types',
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
				description: 'Filter activities by specific device ID',
			},
			{
				displayName: 'Site ID',
				name: 'siteId',
				type: 'string',
				default: '',
				description: 'Filter activities by specific site ID',
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
		description: 'Text to search for in activity logs (searches across activity messages, user names, device names, etc.)',
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
				description: 'Start date for activity log search',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for activity log search',
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
						name: 'Login Activity',
						value: 'login',
					},
					{
						name: 'Licensing Activity',
						value: 'licensing',
					},
					{
						name: 'Password Reset',
						value: 'password_reset',
					},
					{
						name: '2FA Reset',
						value: 'two_factor_reset',
					},
					{
						name: 'Support Access',
						value: 'support_access',
					},
					{
						name: 'User Management',
						value: 'user_management',
					},
					{
						name: 'Device Management',
						value: 'device_management',
					},
					{
						name: 'Site Management',
						value: 'site_management',
					},
					{
						name: 'Policy Deployment',
						value: 'policy_deployment',
					},
					{
						name: 'Monitor Management',
						value: 'monitor_management',
					},
					{
						name: 'Component Activity',
						value: 'component_activity',
					},
					{
						name: 'Job Execution',
						value: 'job_execution',
					},
					{
						name: 'Report Activity',
						value: 'report_activity',
					},
				],
				default: [],
				description: 'Limit search to specific activity types',
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
		description: 'Device to get activity logs for',
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
				description: 'Whether to return all results or only up to a given limit',
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
				description: 'Max number of results to return',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date for activity log search',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for activity log search',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Device Connection',
						value: 'device_connection',
					},
					{
						name: 'Device Configuration',
						value: 'device_configuration',
					},
					{
						name: 'Monitor Activity',
						value: 'monitor_activity',
					},
					{
						name: 'Component Execution',
						value: 'component_execution',
					},
					{
						name: 'Job Execution',
						value: 'job_execution',
					},
					{
						name: 'Policy Changes',
						value: 'policy_changes',
					},
					{
						name: 'Software Changes',
						value: 'software_changes',
					},
					{
						name: 'Hardware Changes',
						value: 'hardware_changes',
					},
				],
				default: [],
				description: 'Filter by device-specific activity types',
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
		description: 'Site to get activity logs for',
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
				description: 'Whether to return all results or only up to a given limit',
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
				description: 'Max number of results to return',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date for activity log search',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for activity log search',
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
						name: 'Site Management',
						value: 'site_management',
					},
					{
						name: 'Device Management',
						value: 'device_management',
					},
					{
						name: 'Policy Deployment',
						value: 'policy_deployment',
					},
					{
						name: 'User Access',
						value: 'user_access',
					},
					{
						name: 'Monitor Activity',
						value: 'monitor_activity',
					},
					{
						name: 'Component Activity',
						value: 'component_activity',
					},
					{
						name: 'Job Execution',
						value: 'job_execution',
					},
				],
				default: [],
				description: 'Filter by site-specific activity types',
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
		description: 'User ID to get activity logs for',
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
				description: 'Whether to return all results or only up to a given limit',
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
				description: 'Max number of results to return',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date for activity log search',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'End date for activity log search',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'multiOptions',
				options: [
					{
						name: 'Login Activity',
						value: 'login',
					},
					{
						name: 'Password Changes',
						value: 'password_changes',
					},
					{
						name: '2FA Activity',
						value: 'two_factor_activity',
					},
					{
						name: 'User Management',
						value: 'user_management',
					},
					{
						name: 'Device Access',
						value: 'device_access',
					},
					{
						name: 'Site Access',
						value: 'site_access',
					},
					{
						name: 'Configuration Changes',
						value: 'configuration_changes',
					},
					{
						name: 'Report Activity',
						value: 'report_activity',
					},
				],
				default: [],
				description: 'Filter by user-specific activity types',
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
		description: 'Select specific columns to include in the response. Choose from available activity log fields.',
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
