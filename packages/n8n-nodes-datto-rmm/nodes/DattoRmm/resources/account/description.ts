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
		],
		default: 'get',
	},
	// Add ResourceMapper field for dynamic field selection
	{
		displayName: 'Fields to Return',
		name: 'resourceMapper',
		type: 'resourceMapper',
		default: {},
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['get', 'getVariables'],
			},
		},
		description: 'Select which fields to include in the response',
	},
];
