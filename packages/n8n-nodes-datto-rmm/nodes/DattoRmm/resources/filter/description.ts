import type { INodeProperties } from 'n8n-workflow';

export const filterFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['filter'],
			},
		},
		options: [
			{
				name: 'Get Default Filters',
				value: 'getDefaultFilters',
				description: 'Get system-provided device filters and templates',
				action: 'Get default filters',
			},
			{
				name: 'Get Custom Filters',
				value: 'getCustomFilters',
				description: 'Get user-created custom device filters',
				action: 'Get custom filters',
			},
			{
				name: 'Create Filter',
				value: 'createFilter',
				description: 'Create a new custom device filter',
				action: 'Create custom filter',
			},
			{
				name: 'Update Filter',
				value: 'updateFilter',
				description: 'Modify an existing custom filter',
				action: 'Update custom filter',
			},
			{
				name: 'Delete Filter',
				value: 'deleteFilter',
				description: 'Remove a custom filter permanently',
				action: 'Delete custom filter',
			},
		],
		default: 'getDefaultFilters',
	},

	// Filter ID parameter (for update and delete operations)
	{
		displayName: 'Filter ID',
		name: 'filterId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['updateFilter', 'deleteFilter'],
			},
		},
		default: '',
		description: 'The unique identifier of the filter to update or delete',
	},

	// Filter Name (for create and update operations)
	{
		displayName: 'Filter Name',
		name: 'filterName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['createFilter'],
			},
		},
		default: '',
		description: 'Name for the new custom filter',
	},
	{
		displayName: 'Filter Name',
		name: 'filterName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['updateFilter'],
			},
		},
		default: '',
		description: 'New name for the filter (leave empty to keep current name)',
	},

	// Filter Description
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['createFilter', 'updateFilter'],
			},
		},
		default: '',
		description: 'Description for the filter',
	},

	// Filter Criteria (JSON object)
	{
		displayName: 'Filter Criteria',
		name: 'criteria',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['createFilter'],
			},
		},
		default: '{}',
		description:
			'JSON object defining the filter criteria (e.g., {"hostname": "server-*", "operatingSystem": "Windows"})',
	},
	{
		displayName: 'Filter Criteria',
		name: 'criteria',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['updateFilter'],
			},
		},
		default: '{}',
		description:
			'Updated JSON object defining the filter criteria (leave empty to keep current criteria)',
	},

	// Filter Type
	{
		displayName: 'Filter Type',
		name: 'filterType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['createFilter', 'updateFilter'],
			},
		},
		options: [
			{
				name: 'Device',
				value: 'device',
				description: 'Filter for device-based queries',
			},
			{
				name: 'Site',
				value: 'site',
				description: 'Filter for site-based queries',
			},
			{
				name: 'Alert',
				value: 'alert',
				description: 'Filter for alert-based queries',
			},
			{
				name: 'Mixed',
				value: 'mixed',
				description: 'Filter that combines multiple resource types',
			},
		],
		default: 'device',
		description: 'Type of resource this filter applies to',
	},

	// Include inactive filters option
	{
		displayName: 'Include Inactive',
		name: 'includeInactive',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['getCustomFilters'],
			},
		},
		description: 'Whether to include inactive/disabled custom filters',
	},

	// Filter category for organization
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['getDefaultFilters', 'getCustomFilters', 'createFilter', 'updateFilter'],
			},
		},
		options: [
			{
				name: 'All',
				value: '',
				description: 'All filter categories',
			},
			{
				name: 'Monitoring',
				value: 'monitoring',
				description: 'Filters for monitoring and alerts',
			},
			{
				name: 'Maintenance',
				value: 'maintenance',
				description: 'Filters for maintenance operations',
			},
			{
				name: 'Reporting',
				value: 'reporting',
				description: 'Filters for reporting and analytics',
			},
			{
				name: 'Automation',
				value: 'automation',
				description: 'Filters for automation workflows',
			},
			{
				name: 'Custom',
				value: 'custom',
				description: 'User-defined custom categories',
			},
		],
		default: '',
		description: 'Filter category for organization and grouping',
	},

	// Retrieve All option for list operations
	{
		displayName: 'Retrieve All',
		name: 'retrieveAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['filter'],
				operation: ['getDefaultFilters', 'getCustomFilters'],
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
				resource: ['filter'],
				operation: ['getDefaultFilters', 'getCustomFilters'],
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
				resource: ['filter'],
				operation: ['getDefaultFilters', 'getCustomFilters'],
				retrieveAll: [false],
			},
		},
		description: 'Maximum number of results to return per page',
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
				resource: ['filter'],
				operation: ['getDefaultFilters', 'getCustomFilters'],
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
