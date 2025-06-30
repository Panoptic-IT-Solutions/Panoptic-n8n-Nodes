import type { INodeProperties } from 'n8n-workflow';

/**
 * Operation addition configuration
 */
export interface IOperationAdditionConfig {
	resourceName: string;
	excludeOperations?: string[];
}

/**
 * Simplified version of addOperationsToResource for initial implementation
 * TODO: Expand this to match Autotask complexity in later tasks
 */
export function addOperationsToResource(
	baseFields: INodeProperties[],
	config: IOperationAdditionConfig,
): INodeProperties[] {
	const properties = [...baseFields];

	// Update displayOptions to include the resource name
	return properties.map((property) => {
		if (property.displayOptions?.show?.resource) {
			return {
				...property,
				displayOptions: {
					...property.displayOptions,
					show: {
						...property.displayOptions.show,
						resource: [config.resourceName],
					},
				},
			};
		}
		return property;
	});
}
