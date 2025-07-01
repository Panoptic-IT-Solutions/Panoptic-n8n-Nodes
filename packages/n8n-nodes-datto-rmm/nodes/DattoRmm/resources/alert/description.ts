import type { INodeProperties } from 'n8n-workflow';

export const alertFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['alert'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get specific alert by UID',
				action: 'Get alert by UID',
			},
			{
				name: 'Resolve',
				value: 'resolve',
				description: 'Resolve an alert',
				action: 'Resolve alert',
			},
			{
				name: 'Mute',
				value: 'mute',
				description: 'Mute an alert (deprecated in API v8.9.0+)',
				action: 'Mute alert',
			},
			{
				name: 'Unmute',
				value: 'unmute',
				description: 'Unmute an alert (deprecated in API v8.9.0+)',
				action: 'Unmute alert',
			},
		],
		default: 'get',
	},

	// Alert UID parameter - required for all operations
	{
		displayName: 'Alert UID',
		name: 'alertUid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['get', 'resolve', 'mute', 'unmute'],
			},
		},
		description: 'The unique identifier (UID) of the alert',
	},

	// Resolution note for resolve operation
	{
		displayName: 'Resolution Note',
		name: 'resolutionNote',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['resolve'],
			},
		},
		description: 'Optional note to add when resolving the alert',
	},

	// Resource Mapper for dynamic field selection
	{
		displayName: 'Fields to Include',
		name: 'fieldsToInclude',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['get'],
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
