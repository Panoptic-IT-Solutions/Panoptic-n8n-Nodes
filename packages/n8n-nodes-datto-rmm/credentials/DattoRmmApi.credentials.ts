import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DattoRmmApi implements ICredentialType {
	name = 'dattoRmmApi';
	extends = ['oAuth2Api'];
	displayName = 'Datto RMM API';
	documentationUrl = 'https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'password',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			required: true,
			description:
				'The base URL for your Datto RMM API instance, e.g. https://pinotage-api.centrastage.net',
		},
		{
			displayName: 'API Key',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'This is your API Key from the Datto RMM user settings page',
		},
		{
			displayName: 'API Secret Key',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'This is your API Secret Key from the Datto RMM user settings page',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: '={{$self.apiUrl.replace(new RegExp("/+$"), "")}}/auth/oauth/token',
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
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
	];
}
