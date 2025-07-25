import type { INodePropertyOptions } from 'n8n-workflow';

/**
 * Supported Datto RMM resources and their descriptions
 */
export const RESOURCE_DEFINITIONS: INodePropertyOptions[] = [
	{
		name: 'Account',
		value: 'account',
		description: 'Manage account information and settings for your Datto RMM instance',
	},
	{
		name: 'Device',
		value: 'device',
		description:
			'Manage devices and endpoints monitored by Datto RMM, including workstations, servers, and mobile devices',
	},
	{
		name: 'Site',
		value: 'site',
		description: 'Manage client sites and locations where devices are deployed and monitored',
	},
	{
		name: 'Alert',
		value: 'alert',
		description:
			'Manage monitoring alerts and notifications generated by device monitoring and security events',
	},
	{
		name: 'Job',
		value: 'job',
		description:
			'Manage automation jobs, scripts, and scheduled tasks executed on monitored devices',
	},
	{
		name: 'Audit',
		value: 'audit',
		description:
			'Access audit logs and compliance reports for security and administrative activities',
	},
	{
		name: 'System',
		value: 'system',
		description: 'Manage system-level configuration and administrative settings',
	},
	{
		name: 'Filter',
		value: 'filter',
		description:
			'Manage data filters and search criteria for customized data retrieval and reporting',
	},
];
