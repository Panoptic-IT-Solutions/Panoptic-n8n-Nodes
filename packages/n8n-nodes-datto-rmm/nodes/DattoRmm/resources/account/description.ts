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

	// Basic Filters Section
	{
		displayName: 'Basic Filters',
		name: 'basicFiltersNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		typeOptions: {
			theme: 'info',
		},
		description: 'Use these for simple, single-field filtering',
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
		description:
			"Filter devices by hostname (partial matches supported). When multiple input items are provided, each item's hostname will be searched individually.",
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

	// Advanced Dynamic Filters Section
	{
		displayName: 'Advanced Filters',
		name: 'advancedFiltersNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		typeOptions: {
			theme: 'info',
		},
		description:
			'Build complex, multi-field filter conditions. These are applied after API results are returned.',
	},
	{
		displayName: 'Use Advanced Filters',
		name: 'useAdvancedFilters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
			},
		},
		description: 'Whether to use the advanced filtering system for more complex conditions',
	},
	{
		displayName: 'Filter Conditions',
		name: 'filterConditions',
		placeholder: 'Add Filter Condition',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
				useAdvancedFilters: [true],
			},
		},
		description: 'Define multiple filter conditions to apply to the device results',
		options: [
			{
				name: 'condition',
				displayName: 'Filter Condition',
				values: [
					{
						displayName: 'Field',
						name: 'field',
						type: 'options',
						options: [
							{
								name: 'Hostname',
								value: 'hostname',
								description: 'Device hostname',
							},
							{
								name: 'Device Type Category',
								value: 'deviceType.category',
								description: 'Device category (Desktop, Server, etc.)',
							},
							{
								name: 'Device Type',
								value: 'deviceType.type',
								description: 'Specific device type',
							},
							{
								name: 'Operating System',
								value: 'operatingSystem',
								description: 'Operating system information',
							},
							{
								name: 'Site Name',
								value: 'siteName',
								description: 'Name of the site',
							},
							{
								name: 'Internal IP Address',
								value: 'intIpAddress',
								description: 'Internal IP address',
							},
							{
								name: 'External IP Address',
								value: 'extIpAddress',
								description: 'External IP address',
							},
							{
								name: 'Last Logged In User',
								value: 'lastLoggedInUser',
								description: 'Last user to log in',
							},
							{
								name: 'Domain',
								value: 'domain',
								description: 'Domain membership',
							},
							{
								name: 'Description',
								value: 'description',
								description: 'Device description',
							},
							{
								name: 'Online Status',
								value: 'online',
								description: 'Whether device is online',
							},
							{
								name: 'Suspended Status',
								value: 'suspended',
								description: 'Whether device is suspended',
							},
							{
								name: 'Deleted Status',
								value: 'deleted',
								description: 'Whether device is deleted',
							},
							{
								name: 'Reboot Required',
								value: 'rebootRequired',
								description: 'Whether device needs reboot',
							},
							{
								name: '64-bit Architecture',
								value: 'a64Bit',
								description: 'Whether device is 64-bit',
							},
							{
								name: 'CAG Version',
								value: 'cagVersion',
								description: 'Centrastage Agent version',
							},
							{
								name: 'Display Version',
								value: 'displayVersion',
								description: 'Agent display version',
							},
							{
								name: 'Antivirus Product',
								value: 'antivirus.antivirusProduct',
								description: 'Antivirus software name',
							},
							{
								name: 'Antivirus Status',
								value: 'antivirus.antivirusStatus',
								description: 'Antivirus status',
							},
							{
								name: 'Patch Status',
								value: 'patchManagement.patchStatus',
								description: 'Patch management status',
							},
							{
								name: 'Patches Approved Pending',
								value: 'patchManagement.patchesApprovedPending',
								description: 'Number of approved patches pending',
							},
							{
								name: 'Patches Not Approved',
								value: 'patchManagement.patchesNotApproved',
								description: 'Number of patches not approved',
							},
							{
								name: 'Patches Installed',
								value: 'patchManagement.patchesInstalled',
								description: 'Number of patches installed',
							},
							{
								name: 'Software Status',
								value: 'softwareStatus',
								description: 'Software compliance status',
							},
							{
								name: 'SNMP Enabled',
								value: 'snmpEnabled',
								description: 'Whether SNMP is enabled',
							},
							{
								name: 'UDF 1',
								value: 'udf.udf1',
								description: 'User Defined Field 1',
							},
							{
								name: 'UDF 2',
								value: 'udf.udf2',
								description: 'User Defined Field 2',
							},
							{
								name: 'UDF 3',
								value: 'udf.udf3',
								description: 'User Defined Field 3',
							},
							{
								name: 'UDF 4',
								value: 'udf.udf4',
								description: 'User Defined Field 4',
							},
							{
								name: 'UDF 5',
								value: 'udf.udf5',
								description: 'User Defined Field 5',
							},
							{
								name: 'UDF 6',
								value: 'udf.udf6',
								description: 'User Defined Field 6',
							},
							{
								name: 'UDF 7',
								value: 'udf.udf7',
								description: 'User Defined Field 7',
							},
							{
								name: 'UDF 8',
								value: 'udf.udf8',
								description: 'User Defined Field 8',
							},
							{
								name: 'UDF 9',
								value: 'udf.udf9',
								description: 'User Defined Field 9',
							},
							{
								name: 'UDF 10',
								value: 'udf.udf10',
								description: 'User Defined Field 10',
							},
						],
						default: 'hostname',
						description: 'Field to filter on',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{
								name: 'Equals',
								value: 'equals',
								description: 'Exact match (case-insensitive)',
							},
							{
								name: 'Contains',
								value: 'contains',
								description: 'Contains text (case-insensitive)',
							},
							{
								name: 'Starts With',
								value: 'startsWith',
								description: 'Starts with text (case-insensitive)',
							},
							{
								name: 'Ends With',
								value: 'endsWith',
								description: 'Ends with text (case-insensitive)',
							},
							{
								name: 'Not Equals',
								value: 'notEquals',
								description: 'Does not equal (case-insensitive)',
							},
							{
								name: 'Does Not Contain',
								value: 'notContains',
								description: 'Does not contain text (case-insensitive)',
							},
							{
								name: 'Is Empty',
								value: 'isEmpty',
								description: 'Field is empty, null, or undefined',
							},
							{
								name: 'Is Not Empty',
								value: 'isNotEmpty',
								description: 'Field has a value',
							},
							{
								name: 'Greater Than',
								value: 'greaterThan',
								description: 'Numeric/date greater than',
							},
							{
								name: 'Less Than',
								value: 'lessThan',
								description: 'Numeric/date less than',
							},
							{
								name: 'Greater Than or Equal',
								value: 'greaterThanOrEqual',
								description: 'Numeric/date greater than or equal',
							},
							{
								name: 'Less Than or Equal',
								value: 'lessThanOrEqual',
								description: 'Numeric/date less than or equal',
							},
							{
								name: 'Regex Match',
								value: 'regex',
								description: 'Matches regular expression',
							},
						],
						default: 'contains',
						description: 'How to compare the field value',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: {
							hide: {
								operator: ['isEmpty', 'isNotEmpty'],
							},
						},
						description: 'Value to compare against (not needed for isEmpty/isNotEmpty)',
					},
					{
						displayName: 'Numeric Value',
						name: 'numericValue',
						type: 'number',
						default: 0,
						displayOptions: {
							show: {
								operator: ['greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
							},
						},
						description: 'Numeric value for comparison',
					},
					{
						displayName: 'Boolean Value',
						name: 'booleanValue',
						type: 'boolean',
						default: true,
						displayOptions: {
							show: {
								field: [
									'online',
									'suspended',
									'deleted',
									'rebootRequired',
									'a64Bit',
									'snmpEnabled',
								],
								operator: ['equals', 'notEquals'],
							},
						},
						description: 'Boolean value for comparison',
					},
				],
			},
		],
	},
	{
		displayName: 'Filter Logic',
		name: 'filterLogic',
		type: 'options',
		options: [
			{
				name: 'AND',
				value: 'AND',
				description: 'All conditions must be true',
			},
			{
				name: 'OR',
				value: 'OR',
				description: 'At least one condition must be true',
			},
		],
		default: 'AND',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getDevices'],
				useAdvancedFilters: [true],
			},
		},
		description: 'How to combine multiple filter conditions',
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
