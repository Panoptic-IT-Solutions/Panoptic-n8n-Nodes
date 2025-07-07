import type { INodeProperties } from 'n8n-workflow';

export const auditFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['audit'],
			},
		},
		options: [
			{
				name: 'Get Device Audit',
				value: 'getDeviceAudit',
				description: 'Get complete device audit information',
				action: 'Get device audit',
			},
			{
				name: 'Get Software Audit',
				value: 'getSoftwareAudit',
				description: 'Get installed software inventory for a device',
				action: 'Get software audit',
			},
			{
				name: 'Get Hardware Audit',
				value: 'getHardwareAudit',
				description: 'Get hardware configuration details for a device',
				action: 'Get hardware audit',
			},
			{
				name: 'Get Printer Audit',
				value: 'getPrinterAudit',
				description: 'Get printer-specific audit data',
				action: 'Get printer audit',
			},
			{
				name: 'Get ESXi Audit',
				value: 'getEsxiAudit',
				description: 'Get ESXi host audit information',
				action: 'Get ESXi audit',
			},
			{
				name: 'Get Audit by MAC Address',
				value: 'getAuditByMac',
				description: 'Get audit data using MAC address',
				action: 'Get audit by MAC',
			},
		],
		default: 'getDeviceAudit',
	},

	// Device UID parameter (for most operations)
	{
		displayName: 'Device',
		name: 'deviceUid',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: [
					'getDeviceAudit',
					'getSoftwareAudit',
					'getHardwareAudit',
					'getPrinterAudit',
					'getEsxiAudit',
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getDevices',
		},
		default: '',
		description: 'Select the device to retrieve audit information for',
	},

	// MAC Address parameter (for MAC-based lookup)
	{
		displayName: 'MAC Address',
		name: 'macAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getAuditByMac'],
			},
		},
		default: '',
		description: 'MAC address in format: XXXXXXXXXXXX (12 characters, no separators)',
	},

	// Audit Type for getAuditByMac
	{
		displayName: 'Audit Type',
		name: 'auditType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getAuditByMac'],
			},
		},
		options: [
			{
				name: 'Device',
				value: 'device',
				description: 'Complete device audit information',
			},
			{
				name: 'Software',
				value: 'software',
				description: 'Software inventory audit',
			},
			{
				name: 'Hardware',
				value: 'hardware',
				description: 'Hardware configuration audit',
			},
		],
		default: 'device',
		description: 'Type of audit information to retrieve',
	},

	// Include archived data option
	{
		displayName: 'Include Archived',
		name: 'includeArchived',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getDeviceAudit', 'getSoftwareAudit', 'getHardwareAudit', 'getAuditByMac'],
			},
		},
		description: 'Whether to include archived/historical audit data',
	},

	// Date range filters for historical data
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getDeviceAudit', 'getSoftwareAudit', 'getHardwareAudit'],
				includeArchived: [true],
			},
		},
		default: '',
		description: 'Start date for filtering historical audit data (ISO 8601 format)',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getDeviceAudit', 'getSoftwareAudit', 'getHardwareAudit'],
				includeArchived: [true],
			},
		},
		default: '',
		description: 'End date for filtering historical audit data (ISO 8601 format)',
	},

	// Software-specific filters
	{
		displayName: 'Software Name Filter',
		name: 'softwareName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getSoftwareAudit'],
			},
		},
		default: '',
		description: 'Filter software by name (partial matches supported)',
	},
	{
		displayName: 'Include System Software',
		name: 'includeSystemSoftware',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getSoftwareAudit'],
			},
		},
		description: 'Whether to include system/OS software in results',
	},

	// Hardware-specific filters
	{
		displayName: 'Hardware Category',
		name: 'hardwareCategory',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getHardwareAudit'],
			},
		},
		options: [
			{
				name: 'All',
				value: '',
				description: 'Include all hardware categories',
			},
			{
				name: 'Processor',
				value: 'processor',
				description: 'CPU information only',
			},
			{
				name: 'Memory',
				value: 'memory',
				description: 'RAM information only',
			},
			{
				name: 'Storage',
				value: 'storage',
				description: 'Disk and storage information only',
			},
			{
				name: 'Network',
				value: 'network',
				description: 'Network interfaces only',
			},
			{
				name: 'Graphics',
				value: 'graphics',
				description: 'GPU information only',
			},
		],
		default: '',
		description: 'Filter hardware audit by specific category',
	},

	// Retrieve All option for list operations
	{
		displayName: 'Retrieve All',
		name: 'retrieveAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getSoftwareAudit', 'getHardwareAudit'],
			},
		},
		description: 'Whether to retrieve all audit records automatically using pagination',
	},

	// Pagination parameters
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getSoftwareAudit', 'getHardwareAudit'],
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
				resource: ['audit'],
				operation: ['getSoftwareAudit', 'getHardwareAudit'],
				retrieveAll: [false],
			},
		},
		description: 'Maximum number of results to return per page',
	},

	// Output format options
	{
		displayName: 'Include Details',
		name: 'includeDetails',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['audit'],
				operation: ['getDeviceAudit', 'getSoftwareAudit', 'getHardwareAudit'],
			},
		},
		description: 'Whether to include detailed audit information (may increase response size)',
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
				resource: ['audit'],
				operation: [
					'getDeviceAudit',
					'getSoftwareAudit',
					'getHardwareAudit',
					'getPrinterAudit',
					'getEsxiAudit',
					'getAuditByMac',
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
