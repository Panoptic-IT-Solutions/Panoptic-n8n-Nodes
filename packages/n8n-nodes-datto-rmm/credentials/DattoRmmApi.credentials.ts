import { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class DattoRmmApi implements ICredentialType {
	name = 'dattoRmmApi';
	extends = ['oAuth2Api'];
	displayName = 'Datto RMM API';
	documentationUrl = 'https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm';
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://pinotage-api.centrastage.net',
			description:
				'The base URL for the Datto RMM API. Refer to Datto RMM documentation for your platform-specific URL.',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'password',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'hidden',
			default: 'public-client',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			default: 'public',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			displayOptions: {
				show: {
					grantType: ['password'],
				},
			},
			default: '',
			description: 'Your Datto RMM API Key',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					grantType: ['password'],
				},
			},
			default: '',
			description: 'Your Datto RMM API Secret Key',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: '={{$credentials.apiUrl}}/auth/oauth/token',
		},
	];
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/api/v2/account',
		},
	};
}
