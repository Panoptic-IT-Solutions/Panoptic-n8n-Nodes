import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class DattoRmmApi implements ICredentialType {
	name = 'dattoRmmApi';
	displayName = 'Datto RMM API';
	documentationUrl = 'https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm';

	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://pinotage-api.centrastage.net',
			required: true,
			description:
				'The base URL for the Datto RMM API. Refer to Datto RMM documentation for your platform-specific URL.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			required: true,
			default: '',
			description: 'Your Datto RMM API Key',
		},
		{
			displayName: 'API Secret Key',
			name: 'apiSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			description: 'Your Datto RMM API Secret Key',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/api/v2/account',
			method: 'GET',
		},
	};
}
