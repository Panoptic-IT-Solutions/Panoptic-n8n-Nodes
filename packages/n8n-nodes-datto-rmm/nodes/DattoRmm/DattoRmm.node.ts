import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class DattoRmm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Datto RMM',
		name: 'dattoRmm',
		icon: 'file:datto-rmm.svg',
		group: ['sources'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from the Datto RMM API',
		defaults: {
			name: 'Datto RMM',
		},
		// @ts-expect-error (n8n-nodes-base linter rule requires this to be 'main')
		inputs: ['main'],
		// @ts-expect-error (n8n-nodes-base linter rule requires this to be 'main')
		outputs: ['main'],
		credentials: [
			{
				name: 'dattoRmmApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.apiUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
				],
				default: 'account',
			},
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
				],
				default: 'get',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i);
			const operation = this.getNodeParameter('operation', i);

			if (resource === 'account' && operation === 'get') {
				// Placeholder implementation
				const responseData = {
					message: 'Datto RMM node placeholder - implementation coming soon',
					resource,
					operation,
				};

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			}
		}

		return [returnData];
	}
}
