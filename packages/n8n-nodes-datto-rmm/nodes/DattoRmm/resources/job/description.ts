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
				name: 'Get Bulk Results',
				value: 'getBulkResults',
				description: 'Process multiple job results efficiently',
				action: 'Get bulk job results',
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

	// Device UID parameter (for device-specific results)
	{
		displayName: 'Device (Optional)',
		name: 'deviceUid',
		type: 'options',
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
		description: 'Select a specific device (leave empty for all devices)',
	},

	// Multiple Job UIDs for bulk operations
	{
		displayName: 'Jobs (Multi-Select)',
		name: 'jobUids',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['getBulkResults'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getJobs',
		},
		default: [],
		description: 'Select multiple jobs for bulk processing from the list of available jobs',
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
				operation: ['getResults', 'getHistory', 'getBulkResults'],
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
				operation: ['getResults', 'getHistory', 'getBulkResults'],
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
				operation: ['getResults', 'getHistory', 'getBulkResults'],
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
				operation: ['getHistory', 'getBulkResults'],
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
				operation: ['getResults', 'getBulkResults'],
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
				operation: ['get', 'getResults', 'getHistory', 'getBulkResults'],
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
