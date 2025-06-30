import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DattoRmmApi implements ICredentialType {
	name = 'dattoRmmApi';
	displayName = 'Datto RMM API';
	documentationUrl = 'https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm';
	properties: INodeProperties[] = [
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
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			description: 'This is your API Key from the Datto RMM user settings page',
		},
		{
			displayName: 'API Secret Key',
			name: 'apiSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'This is your API Secret Key from the Datto RMM user settings page',
		},
	];
}
