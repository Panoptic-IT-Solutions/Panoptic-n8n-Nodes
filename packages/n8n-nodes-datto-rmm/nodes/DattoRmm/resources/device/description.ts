import type { INodeProperties } from 'n8n-workflow';

export const deviceFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['device'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get device information by UID',
				action: 'Get device information',
			},
			{
				name: 'Get by ID',
				value: 'getById',
				description: 'Get device information by ID',
				action: 'Get device by ID',
			},
			{
				name: 'Get by MAC Address',
				value: 'getByMacAddress',
				description: 'Get device information by MAC address',
				action: 'Get device by MAC address',
			},
			{
				name: 'Get Open Alerts',
				value: 'getOpenAlerts',
				description: 'Get open alerts for a device',
				action: 'Get device open alerts',
			},
			{
				name: 'Get Resolved Alerts',
				value: 'getResolvedAlerts',
				description: 'Get resolved alerts for a device',
				action: 'Get device resolved alerts',
			},
			{
				name: 'Move Device',
				value: 'moveDevice',
				description: 'Move device to another site',
				action: 'Move device to site',
			},
			{
				name: 'Create Quick Job',
				value: 'createQuickJob',
				description: 'Create a quick job on the device',
				action: 'Create device quick job',
			},
			{
				name: 'Set Warranty',
				value: 'setWarranty',
				description: 'Set warranty information for device',
				action: 'Set device warranty',
			},
			{
				name: 'Set UDF Fields',
				value: 'setUdfFields',
				description: 'Set user-defined fields for device',
				action: 'Set device UDF fields',
			},
		],
		default: 'get',
	},
	// Device UID parameter
	{
		displayName: 'Device UID',
		name: 'deviceUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: [
					'get',
					'getOpenAlerts',
					'getResolvedAlerts',
					'moveDevice',
					'createQuickJob',
					'setWarranty',
					'setUdfFields',
				],
			},
		},
		description: 'The unique identifier (UID) of the device',
	},
	// Device ID parameter
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getById'],
			},
		},
		description: 'The numeric ID of the device',
	},
	// MAC Address parameter
	{
		displayName: 'MAC Address',
		name: 'macAddress',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getByMacAddress'],
			},
		},
		description: 'MAC address in format: XXXXXXXXXXXX (12 characters, no separators)',
	},
	// Site UID parameter for move operation
	{
		displayName: 'Target Site UID',
		name: 'siteUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['moveDevice'],
			},
		},
		description: 'The UID of the target site to move the device to',
	},
	// Job Name for quick job
	{
		displayName: 'Job Name',
		name: 'jobName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['createQuickJob'],
			},
		},
		description: 'Name for the quick job',
	},
	// Component UID for quick job
	{
		displayName: 'Component UID',
		name: 'componentUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['createQuickJob'],
			},
		},
		description: 'UID of the component to run as quick job',
	},
	// Warranty Date
	{
		displayName: 'Warranty Date',
		name: 'warrantyDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['setWarranty'],
			},
		},
		description: 'Warranty date in ISO 8601 format (yyyy-mm-dd) or leave empty to set to null',
	},
	// UDF Fields (simplified - in reality you might want individual fields)
	{
		displayName: 'UDF Fields',
		name: 'udfFields',
		type: 'fixedCollection',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['setUdfFields'],
			},
		},
		description: 'User-defined fields to set',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'name',
						type: 'options',
						options: [
							{ name: 'UDF 1', value: 'udf1' },
							{ name: 'UDF 2', value: 'udf2' },
							{ name: 'UDF 3', value: 'udf3' },
							{ name: 'UDF 4', value: 'udf4' },
							{ name: 'UDF 5', value: 'udf5' },
							// Add more as needed (up to udf30)
						],
						default: 'udf1',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
	// Pagination parameters for alerts
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getOpenAlerts', 'getResolvedAlerts'],
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
				resource: ['device'],
				operation: ['getOpenAlerts', 'getResolvedAlerts'],
			},
		},
		description: 'Maximum number of results per page',
	},
	{
		displayName: 'Include Muted Alerts',
		name: 'muted',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getOpenAlerts', 'getResolvedAlerts'],
			},
		},
		description: 'Whether to include muted alerts in the results',
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
				resource: ['device'],
				operation: ['get', 'getById', 'getByMacAddress'],
			},
		},
		description: 'Select which fields to include in the response',
	},
];
