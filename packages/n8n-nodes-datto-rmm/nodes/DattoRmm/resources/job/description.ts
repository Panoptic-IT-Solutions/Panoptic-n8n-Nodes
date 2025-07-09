import type { INodeProperties } from 'n8n-workflow';

export const jobFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['job'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get job details and status by UID',
				action: 'Get job information',
			},
			{
				name: 'Get Components',
				value: 'getComponents',
				description: 'Get job component configuration',
				action: 'Get job components',
			},
			{
				name: 'Get Results',
				value: 'getResults',
				description: 'Get job execution results by device',
				action: 'Get job results',
			},
			{
				name: 'Get Standard Output',
				value: 'getStdOut',
				description: 'Get job standard output',
				action: 'Get job standard output',
			},
			{
				name: 'Get Standard Error',
				value: 'getStdErr',
				description: 'Get job error output',
				action: 'Get job standard error',
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get job execution history',
				action: 'Get job history',
			},
			{
				name: 'Run on Site',
				value: 'runOnSite',
				description: 'Execute a quick job on all devices in a site',
				action: 'Run job on all site devices',
			},
		],
		default: 'get',
	},

	// Job UID parameter (required for most operations)
	{
		displayName: 'Job',
		name: 'jobUid',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['get', 'getComponents', 'getResults', 'getStdOut', 'getStdErr', 'getHistory'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getJobs',
		},
		default: '',
		description: 'Select the job from the list of available jobs',
	},

	// Site UID parameter (required for runOnSite operation)
	{
		displayName: 'Site',
		name: 'siteUid',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['runOnSite'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getSites',
		},
		default: '',
		description: 'Select the site where the job should be executed on all devices',
	},

	// Component UID parameter (required for runOnSite operation)
	{
		displayName: 'Component',
		name: 'componentUid',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['runOnSite'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getComponents',
		},
		default: '',
		description: 'Select the component/script to execute on all devices in the site',
	},

	// Job name for runOnSite operation
	{
		displayName: 'Job Name',
		name: 'jobName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['runOnSite'],
			},
		},
		default: 'Site-wide Job Execution',
		description: 'Name for the job execution (will be applied to all devices)',
	},

	// Device filtering options for runOnSite
	{
		displayName: 'Device Filters',
		name: 'deviceFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['runOnSite'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Operating System',
				name: 'operatingSystem',
				type: 'string',
				default: '',
				placeholder: 'e.g., Windows, Linux',
				description: 'Filter devices by operating system',
			},
			{
				displayName: 'Device Type',
				name: 'deviceType',
				type: 'options',
				options: [
					{
						name: 'All',
						value: '',
					},
					{
						name: 'Workstation',
						value: 'Workstation',
					},
					{
						name: 'Server',
						value: 'Server',
					},
					{
						name: 'Laptop',
						value: 'Laptop',
					},
				],
				default: '',
				description: 'Filter devices by type',
			},
			{
				displayName: 'Online Only',
				name: 'onlineOnly',
				type: 'boolean',
				default: true,
				description: 'Only execute job on devices that are currently online',
			},
		],
		description: 'Optional filters to apply when selecting devices for job execution',
	},

	// Execution options for runOnSite
	{
		displayName: 'Execution Options',
		name: 'executionOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['runOnSite'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Batch Size',
				name: 'batchSize',
				type: 'number',
				default: 10,
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
				description: 'Number of devices to process in each batch (recommended: 10-25)',
			},
			{
				displayName: 'Continue on Device Failure',
				name: 'continueOnFail',
				type: 'boolean',
				default: true,
				description: 'Continue executing on other devices if one device fails',
			},
			{
				displayName: 'Include Offline Devices in Results',
				name: 'includeSkipped',
				type: 'boolean',
				default: false,
				description: 'Include skipped devices (offline/filtered) in the results',
			},
		],
		description: 'Options for controlling job execution behavior',
	},

	// Device UID parameter (required for device-specific results)
	{
		displayName: 'Device',
		name: 'deviceUid',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getResults', 'getStdOut', 'getStdErr'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getDevices',
		},
		default: '',
		description: 'Select the device for which to retrieve job results',
	},

	// Retrieve All option for list operations
	{
		displayName: 'Retrieve All',
		name: 'retrieveAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getResults', 'getHistory'],
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
				resource: ['job'],
				operation: ['getResults', 'getHistory'],
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
				resource: ['job'],
				operation: ['getResults', 'getHistory'],
				retrieveAll: [false],
			},
		},
		description: 'Maximum number of results to return per page',
	},

	// Date range filters for history
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getHistory'],
			},
		},
		default: '',
		description: 'Start date for filtering job history (ISO 8601 format)',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getHistory'],
			},
		},
		default: '',
		description: 'End date for filtering job history (ISO 8601 format)',
	},

	// Job status filter
	{
		displayName: 'Status Filter',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getHistory'],
			},
		},
		options: [
			{
				name: 'All',
				value: '',
				description: 'Include all job statuses',
			},
			{
				name: 'Completed',
				value: 'completed',
				description: 'Only completed jobs',
			},
			{
				name: 'Failed',
				value: 'failed',
				description: 'Only failed jobs',
			},
			{
				name: 'Running',
				value: 'running',
				description: 'Only currently running jobs',
			},
			{
				name: 'Queued',
				value: 'queued',
				description: 'Only queued jobs',
			},
		],
		default: '',
		description: 'Filter jobs by execution status',
	},

	// Include detailed output option
	{
		displayName: 'Include Output Details',
		name: 'includeOutput',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getResults'],
			},
		},
		description: 'Whether to include stdout/stderr in the results (may increase response size)',
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
				resource: ['job'],
				operation: ['get', 'getResults', 'getHistory'],
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
