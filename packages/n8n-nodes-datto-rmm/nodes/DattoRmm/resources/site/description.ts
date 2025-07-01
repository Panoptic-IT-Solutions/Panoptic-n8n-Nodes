import type { INodeProperties } from 'n8n-workflow';

export const siteFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['site'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get site information by UID',
				action: 'Get site information',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get all sites for the account',
				action: 'Get many sites',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new site',
				action: 'Create site',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing site',
				action: 'Update site',
			},
			{
				name: 'Get Devices',
				value: 'getDevices',
				description: 'Get devices for a site',
				action: 'Get site devices',
			},
			{
				name: 'Get Open Alerts',
				value: 'getOpenAlerts',
				description: 'Get open alerts for a site',
				action: 'Get site open alerts',
			},
			{
				name: 'Get Resolved Alerts',
				value: 'getResolvedAlerts',
				description: 'Get resolved alerts for a site',
				action: 'Get site resolved alerts',
			},
			{
				name: 'Get Variables',
				value: 'getVariables',
				description: 'Get site variables',
				action: 'Get site variables',
			},
			{
				name: 'Get Settings',
				value: 'getSettings',
				description: 'Get site settings',
				action: 'Get site settings',
			},
			{
				name: 'Get Filters',
				value: 'getFilters',
				description: 'Get site device filters',
				action: 'Get site device filters',
			},
		],
		default: 'get',
	},
	// Site UID parameter
	{
		displayName: 'Site UID',
		name: 'siteUid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: [
					'get',
					'update',
					'getDevices',
					'getOpenAlerts',
					'getResolvedAlerts',
					'getVariables',
					'getSettings',
					'getFilters',
				],
			},
		},
		default: '',
		description: 'The UID of the site',
	},
	// Site creation fields
	{
		displayName: 'Site Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['create', 'update'],
			},
		},
		description: 'Name of the site',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['create', 'update'],
			},
		},
		description: 'Site description',
	},
	{
		displayName: 'Notes',
		name: 'notes',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['create', 'update'],
			},
		},
		description: 'Site notes',
	},
	{
		displayName: 'On Demand',
		name: 'onDemand',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['create', 'update'],
			},
		},
		description: 'Enable on-demand deployment',
	},
	{
		displayName: 'Splashtop Auto Install',
		name: 'splashtopAutoInstall',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['create', 'update'],
			},
		},
		description: 'Enable automatic Splashtop installation',
	},
	// Retrieve All option for list operations
	{
		displayName: 'Retrieve All',
		name: 'retrieveAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getMany', 'getDevices', 'getOpenAlerts', 'getResolvedAlerts', 'getVariables'],
			},
		},
		description:
			'Whether to retrieve all results automatically using pagination, or manually specify page and max results',
	},
	// Pagination parameters
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getMany', 'getDevices', 'getOpenAlerts', 'getResolvedAlerts', 'getVariables'],
				retrieveAll: [false],
			},
		},
		description: 'Page number for pagination',
	},
	{
		displayName: 'Max Results',
		name: 'max',
		type: 'number',
		default: 100,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getMany', 'getDevices', 'getOpenAlerts', 'getResolvedAlerts', 'getVariables'],
				retrieveAll: [false],
			},
		},
		description: 'Maximum number of results to return',
	},
	// Filter parameters
	{
		displayName: 'Site Name Filter',
		name: 'siteName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getMany'],
			},
		},
		description: 'Filter sites by name (partial matches allowed)',
	},
	{
		displayName: 'Muted',
		name: 'muted',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getOpenAlerts', 'getResolvedAlerts'],
			},
		},
		description: 'Include muted alerts',
	},
	// Device filters for getDevices operation
	{
		displayName: 'Filter ID',
		name: 'filterId',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getDevices'],
			},
		},
		description: 'Device filter ID to apply (overrides other filters)',
	},
	{
		displayName: 'Hostname Filter',
		name: 'hostname',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getDevices'],
			},
		},
		description: 'Filter devices by hostname (partial matches allowed)',
	},
	{
		displayName: 'Device Type Filter',
		name: 'deviceType',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getDevices'],
			},
		},
		description: 'Filter devices by type (partial matches allowed)',
	},
	{
		displayName: 'Operating System Filter',
		name: 'operatingSystem',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['getDevices'],
			},
		},
		description: 'Filter devices by operating system (partial matches allowed)',
	},
	// ResourceMapper field for dynamic field selection
	{
		displayName: 'Fields to Return',
		name: 'resourceMapper',
		type: 'resourceMapper',
		default: {},
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['site'],
			},
		},
		description: 'Select which fields to include in the response',
	},
];
