import type { INodeProperties } from 'n8n-workflow';

export const accountFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get account information',
				action: 'Get account information',
			},
			{
				name: 'Get Variables',
				value: 'getVariables',
				description: 'Get account variables',
				action: 'Get account variables',
			},
			{
				name: 'Get All Devices',
				value: 'getDevices',
				description: 'Get all devices across all sites in the account',
				action: 'Get all account devices',
			},
			{
				name: 'Get Users',
				value: 'getUsers',
				description: 'Get all users in the account',
				action: 'Get account users',
			},
			{
				name: 'Get Components',
				value: 'getComponents',
				description: 'Get automation components available in the account',
				action: 'Get account components',
			},
			{
				name: 'Get Open Alerts',
				value: 'getOpenAlerts',
				description: 'Get all open alerts across the account',
				action: 'Get account open alerts',
			},
			{
				name: 'Get Resolved Alerts',
				value: 'getResolvedAlerts',
				description: 'Get all resolved alerts across the account',
				action: 'Get account resolved alerts',
			},
			{
				name: 'Get Sites',
				value: 'getSites',
				description: 'Get all sites in the account with enhanced filtering',
				action: 'Get account sites',
			},
		],
		default: 'get',
	},

	// Retrieve All option for list operations
	{
		displayName: 'Retrieve All',
		name: 'retrieveAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getVariables',
					'getDevices',
					'getUsers',
					'getComponents',
					'getOpenAlerts',
					'getResolvedAlerts',
					'getSites',
				],
			},
		},
		description:
			'Whether to retrieve all results automatically using pagination, or manually specify page and max results',
	},

	// Pagination parameters for list operations
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getVariables',
					'getDevices',
					'getUsers',
					'getComponents',
					'getOpenAlerts',
					'getResolvedAlerts',
					'getSites',
				],
				retrieveAll: [false],
			},
		},
		description: 'Page number (1-based)',
	},
	{
		displayName: 'Max Results',
		name: 'max',
		type: 'number',
		default: 100,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getVariables',
					'getDevices',
					'getUsers',
					'getComponents',
					'getOpenAlerts',
					'getResolvedAlerts',
					'getSites',
				],
				retrieveAll: [false],
			},
		},
		description: 'Maximum number of results to return per page',
	},

	// Device filtering parameters
	{
		displayName: 'Filter ID',
		name: 'filterId',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		description: 'Apply a specific device filter (overrides other device filters)',
	},
	{
		displayName: 'Hostname Filter',
		name: 'hostname',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		description: 'Filter devices by hostname (partial matches supported)',
	},
	{
		displayName: 'Device Type Filter',
		name: 'deviceType',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		description: 'Filter devices by device type (partial matches supported)',
	},
	{
		displayName: 'Operating System Filter',
		name: 'operatingSystem',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		description: 'Filter devices by operating system (partial matches supported)',
	},
	{
		displayName: 'Site Name Filter',
		name: 'siteName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices', 'getSites'],
			},
		},
		description: 'Filter by site name (partial matches supported)',
	},

	// Alert filtering parameters
	{
		displayName: 'Include Muted Alerts',
		name: 'muted',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getOpenAlerts', 'getResolvedAlerts'],
			},
		},
		description: 'Whether to include muted alerts in results',
	},

	// Resource Mapper for dynamic field selection
	{
		displayName: 'Fields to Include',
		name: 'resourceMapper',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getDevices',
					'getUsers',
					'getComponents',
					'getOpenAlerts',
					'getResolvedAlerts',
					'getSites',
				],
			},
		},
		typeOptions: {
			resourceMapper: {
				resourceMapperMethod: 'getDattoRmmFields',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: true,
				multiKeyMatch: false,
			},
		},
		description: 'Select which fields to include in the response',
	},
];
