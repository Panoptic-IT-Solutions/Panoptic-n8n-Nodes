import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DattoRmmApi implements ICredentialType {
	name = 'dattoRmmApi';
	displayName = 'Datto RMM API';
	documentationUrl = 'https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm';
	extends = ['oAuth2Api'];
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://pinotage-api.centrastage.net',
			description:
				'The base URL for your Datto RMM API instance (e.g., https://pinotage-api.centrastage.net). Do not include /api at the end.',
			validateType: 'url',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'password',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: '={{$self.apiUrl.replace(/\\/+$/, "").replace(/\\/api\\/?$/, "")}}/auth/oauth/token',
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
			displayName: 'API Key (Username)',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Datto RMM API Key (from User Settings → API)',
		},
		{
			displayName: 'API Secret (Password)',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Datto RMM API Secret Key (from User Settings → API)',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'default',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'Request Token URL',
			name: 'requestTokenUrl',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Ignore SSL Issues',
			name: 'ignoreSSLIssues',
			type: 'hidden',
			default: false,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.oauthTokenData.access_token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl.replace(/\\/+$/, "").replace(/\\/api\\/?$/, "")}}',
			url: '/api/v2/account',
			method: 'GET',
		},
	};
}
