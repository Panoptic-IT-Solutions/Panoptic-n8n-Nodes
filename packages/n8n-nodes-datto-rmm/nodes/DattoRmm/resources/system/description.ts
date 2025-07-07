import type { INodeProperties } from 'n8n-workflow';

export const systemFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['system'],
			},
		},
		options: [
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get API system status and version information',
				action: 'Get system status',
			},
			{
				name: 'Get Rate Limit',
				value: 'getRateLimit',
				description: 'Get current API usage and rate limiting information',
				action: 'Get rate limit info',
			},
			{
				name: 'Get Pagination',
				value: 'getPagination',
				description: 'Get pagination configuration and limits',
				action: 'Get pagination config',
			},
			{
				name: 'Get Health',
				value: 'getHealth',
				description: 'Get comprehensive system health monitoring information',
				action: 'Get system health',
			},
		],
		default: 'getStatus',
	},

	// Include detailed metrics option
	{
		displayName: 'Include Detailed Metrics',
		name: 'includeMetrics',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['system'],
				operation: ['getHealth', 'getStatus'],
			},
		},
		description: 'Whether to include detailed performance metrics and system statistics',
	},

	// Time period for rate limit analysis
	{
		displayName: 'Time Period',
		name: 'timePeriod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['system'],
				operation: ['getRateLimit'],
			},
		},
		options: [
			{
				name: 'Current',
				value: 'current',
				description: 'Current rate limit status',
			},
			{
				name: 'Last Hour',
				value: 'hour',
				description: 'Rate limit usage for the last hour',
			},
			{
				name: 'Last Day',
				value: 'day',
				description: 'Rate limit usage for the last 24 hours',
			},
			{
				name: 'Last Week',
				value: 'week',
				description: 'Rate limit usage for the last 7 days',
			},
		],
		default: 'current',
		description: 'Time period for rate limit analysis',
	},

	// Include usage history option
	{
		displayName: 'Include Usage History',
		name: 'includeHistory',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['system'],
				operation: ['getRateLimit'],
			},
		},
		description: 'Whether to include historical usage data and trends',
	},

	// Pagination detail level
	{
		displayName: 'Detail Level',
		name: 'detailLevel',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['system'],
				operation: ['getPagination'],
			},
		},
		options: [
			{
				name: 'Basic',
				value: 'basic',
				description: 'Basic pagination limits and defaults',
			},
			{
				name: 'Detailed',
				value: 'detailed',
				description: 'Detailed pagination configuration and recommendations',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Advanced pagination settings and optimization tips',
			},
		],
		default: 'basic',
		description: 'Level of detail to include in pagination information',
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
				resource: ['system'],
				operation: ['getStatus', 'getRateLimit', 'getPagination', 'getHealth'],
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
