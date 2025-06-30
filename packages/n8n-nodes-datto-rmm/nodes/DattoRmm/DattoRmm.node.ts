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

// Import resource definitions and field descriptions
import { RESOURCE_DEFINITIONS } from './resources/definitions';
import { accountFields } from './resources/account/description';
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
		// @ts-expect-error: 'authentication' is a valid property for INodeTypeDescription
		authentication: {
			type: 'oauth2',
			name: 'dattoRmmApi',
		},
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;

		// Handle resource-specific operations using switch statement
		switch (resource) {
			case 'account':
				return executeAccountOperation.call(this);

			// TODO: Add other resources as they are implemented
			// case 'device':
			//     return executeDeviceOperation.call(this);
			// case 'site':
			//     return executeSiteOperation.call(this);
			// case 'alert':
			//     return executeAlertOperation.call(this);
			// case 'job':
			//     return executeJobOperation.call(this);
			// case 'audit':
			//     return executeAuditOperation.call(this);
			// case 'system':
			//     return executeSystemOperation.call(this);
			// case 'filter':
			//     return executeFilterOperation.call(this);

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

			// TODO: Add more dynamic loading functions as needed
			// async getQueryableEntities(this: ILoadOptionsFunctions) { ... }
			// async getEntityFields(this: ILoadOptionsFunctions) { ... }
		},
	};
}
