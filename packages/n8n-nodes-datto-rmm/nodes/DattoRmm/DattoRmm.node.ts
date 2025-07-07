import { type ResourceMapperFields, NodeOperationError } from 'n8n-workflow';
import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

// Import resource execute functions
import { executeAccountOperation } from './resources/account/execute';
import { executeDeviceOperation } from './resources/device/execute';
import { executeSiteOperation } from './resources/site/execute';
import { executeAlertOperation } from './resources/alert/execute';
import { executeJobOperation } from './resources/job/execute';
import { executeAuditOperation } from './resources/audit/execute';
import { executeSystemOperation } from './resources/system/execute';
import { executeFilterOperation } from './resources/filter/execute';

// Import resource definitions and field descriptions
import { RESOURCE_DEFINITIONS } from './resources/definitions';
import { accountFields } from './resources/account/description';
import { deviceFields } from './resources/device/description';
import { siteFields } from './resources/site/description';
import { alertFields } from './resources/alert/description';
import { jobFields } from './resources/job/description';
import { auditFields } from './resources/audit/description';
import { systemFields } from './resources/system/description';
import { filterFields } from './resources/filter/description';
import { addOperationsToResource } from './helpers/resource-operations.helper';
import { getResourceMapperFields } from './helpers/resourceMapper';

/**
 * Datto RMM node implementation
 */
export class DattoRmm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Datto RMM',
		name: 'dattoRmm',
		icon: 'file:datto-rmm.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Datto RMM API to manage devices, sites, alerts, and monitoring',
		defaults: {
			name: 'Datto RMM',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
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
				options: RESOURCE_DEFINITIONS,
				default: 'account',
				required: true,
			},
			// Add resource-specific property definitions
			...addOperationsToResource(accountFields, { resourceName: 'account' }),
			...addOperationsToResource(deviceFields, { resourceName: 'device' }),
			...addOperationsToResource(siteFields, { resourceName: 'site' }),
			...addOperationsToResource(alertFields, { resourceName: 'alert' }),
			...addOperationsToResource(jobFields, { resourceName: 'job' }),
			...addOperationsToResource(auditFields, { resourceName: 'audit' }),
			...addOperationsToResource(systemFields, { resourceName: 'system' }),
			...addOperationsToResource(filterFields, { resourceName: 'filter' }),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;

		// Handle resource-specific operations using switch statement
		switch (resource) {
			case 'account':
				return executeAccountOperation.call(this);

			case 'device':
				return executeDeviceOperation.call(this);

			case 'site':
				return executeSiteOperation.call(this);

			case 'alert':
				return executeAlertOperation.call(this);

			case 'job':
				return executeJobOperation.call(this);

			case 'audit':
				return executeAuditOperation.call(this);

			case 'system':
				return executeSystemOperation.call(this);

			case 'filter':
				return executeFilterOperation.call(this);

			default:
				throw new NodeOperationError(
					this.getNode(),
					`Resource ${resource} is not supported yet. Please check back later or contribute to the implementation.`,
				);
		}
	}

	methods = {
		resourceMapping: {
			async getFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
				const resource = this.getNodeParameter('resource', 0) as string;
				return getResourceMapperFields.call(this, resource);
			},
		},
		loadOptions: {
			async getResources(this: ILoadOptionsFunctions) {
				// Return available resources for dynamic loading
				return RESOURCE_DEFINITIONS.map((resource) => ({
					name: resource.name,
					value: resource.value,
				}));
			},

			async getSelectColumns(this: ILoadOptionsFunctions) {
				const resource = this.getNodeParameter('resource', 0) as string;

				try {
					// Get fields using the same function that powers the resource mapper
					const { fields } = await getResourceMapperFields.call(this, resource);

					// Format fields for multiOptions dropdown
					return fields.map((field) => ({
						name: field.displayName || field.id,
						value: field.id,
					}));
				} catch (error) {
					console.error(`Error loading select columns options: ${error.message}`);
					return [];
				}
			},

			// Dynamic loading for Sites
			async getSites(this: ILoadOptionsFunctions) {
				try {
					const { dattoRmmApiRequest } = await import('./helpers/api.helper');
					const response = await dattoRmmApiRequest.call(this, 'GET', '/api/v2/site');

					if (response?.data && Array.isArray(response.data)) {
						return response.data.map((site: any) => ({
							name: `${site.name} (${site.uid})`,
							value: site.uid,
						}));
					}
					return [];
				} catch (error) {
					console.error('Error loading sites:', error.message);
					return [];
				}
			},

			// Dynamic loading for Open Alerts
			async getOpenAlerts(this: ILoadOptionsFunctions) {
				try {
					const { dattoRmmApiRequest } = await import('./helpers/api.helper');
					const response = await dattoRmmApiRequest.call(
						this,
						'GET',
						'/api/v2/account/alerts/open',
					);

					if (response?.data && Array.isArray(response.data)) {
						return response.data.map((alert: any) => ({
							name: `${alert.alertType || 'Alert'} - ${alert.deviceName || alert.uid} (${alert.priority || 'Normal'})`,
							value: alert.uid,
						}));
					}
					return [];
				} catch (error) {
					console.error('Error loading alerts:', error.message);
					return [];
				}
			},

			// Dynamic loading for Devices
			async getDevices(this: ILoadOptionsFunctions) {
				try {
					const { dattoRmmApiRequest } = await import('./helpers/api.helper');
					const response = await dattoRmmApiRequest.call(this, 'GET', '/api/v2/account/devices');

					if (response?.data && Array.isArray(response.data)) {
						return response.data.map((device: any) => ({
							name: `${device.hostname || device.displayName || 'Unknown'} - ${device.deviceType || 'Device'} (${device.uid})`,
							value: device.uid,
						}));
					}
					return [];
				} catch (error) {
					console.error('Error loading devices:', error.message);
					return [];
				}
			},

			// Dynamic loading for Jobs
			async getJobs(this: ILoadOptionsFunctions) {
				try {
					const { dattoRmmApiRequestAllItems } = await import('./helpers/api.helper');
					const jobs = await dattoRmmApiRequestAllItems.call(this, 'GET', '/api/v2/job');
					return jobs.map((job: any) => ({
						name: `${job.name} (${job.status})`,
						value: job.uid,
					}));
				} catch {
					return [];
				}
			},

			// Dynamic loading for Site-specific Devices
			async getSiteDevices(this: ILoadOptionsFunctions) {
				try {
					const siteUid = this.getNodeParameter('siteUid', 0) as string;
					if (!siteUid) return [];

					const { dattoRmmApiRequest } = await import('./helpers/api.helper');
					const response = await dattoRmmApiRequest.call(
						this,
						'GET',
						`/api/v2/site/${siteUid}/devices`,
					);

					if (response?.data && Array.isArray(response.data)) {
						return response.data.map((device: any) => ({
							name: `${device.hostname || device.displayName || 'Unknown'} - ${device.deviceType || 'Device'}`,
							value: device.uid,
						}));
					}
					return [];
				} catch (error) {
					console.error('Error loading site devices:', error.message);
					return [];
				}
			},

			// Dynamic loading for Site-specific Open Alerts
			async getSiteOpenAlerts(this: ILoadOptionsFunctions) {
				try {
					const siteUid = this.getNodeParameter('siteUid', 0) as string;
					if (!siteUid) return [];

					const { dattoRmmApiRequest } = await import('./helpers/api.helper');
					const response = await dattoRmmApiRequest.call(
						this,
						'GET',
						`/api/v2/site/${siteUid}/alerts/open`,
					);

					if (response?.data && Array.isArray(response.data)) {
						return response.data.map((alert: any) => ({
							name: `${alert.alertType || 'Alert'} - ${alert.deviceName || 'Unknown Device'} (${alert.priority || 'Normal'})`,
							value: alert.uid,
						}));
					}
					return [];
				} catch (error) {
					console.error('Error loading site alerts:', error.message);
					return [];
				}
			},

			// Dynamic loading for Custom Filters
			async getCustomFilters(this: ILoadOptionsFunctions) {
				try {
					const { dattoRmmApiRequest } = await import('./helpers/api.helper');
					const response = await dattoRmmApiRequest.call(this, 'GET', '/api/v2/filter/custom');

					if (response?.data && Array.isArray(response.data)) {
						return response.data.map((filter: any) => ({
							name: `${filter.name} - ${filter.category || 'General'} (${filter.uid})`,
							value: filter.uid,
						}));
					}
					return [];
				} catch (error) {
					console.error('Error loading custom filters:', error.message);
					return [];
				}
			},

			async getComponents(this: ILoadOptionsFunctions) {
				try {
					const { dattoRmmApiRequestAllItems } = await import('./helpers/api.helper');
					const components = await dattoRmmApiRequestAllItems.call(
						this,
						'GET',
						'/api/v2/account/components',
					);
					return components.map((component: any) => ({
						name: `${component.name} - ${component.description || 'No description'}`,
						value: component.uid,
					}));
				} catch {
					return [];
				}
			},
		},
	};
}
