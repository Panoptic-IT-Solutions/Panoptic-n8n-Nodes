import type { ILoadOptionsFunctions, ResourceMapperFields } from 'n8n-workflow';

/**
 * Get resource mapper fields for a Datto RMM resource
 * This is a simplified implementation that will be expanded in later tasks
 */
export async function getResourceMapperFields(
	this: ILoadOptionsFunctions,
	resource: string,
): Promise<ResourceMapperFields> {
	// TODO: Implement actual API calls to discover fields dynamically
	// For now, return resource-specific field sets

	const baseFields = [
		{
			id: 'id',
			displayName: 'ID',
			required: false,
			defaultMatch: false,
			canBeUsedToMatch: true,
			display: true,
		},
		{
			id: 'createdDate',
			displayName: 'Created Date',
			required: false,
			defaultMatch: false,
			canBeUsedToMatch: false,
			display: true,
		},
		{
			id: 'lastModified',
			displayName: 'Last Modified',
			required: false,
			defaultMatch: false,
			canBeUsedToMatch: false,
			display: true,
		},
	];

	// Resource-specific fields
	const resourceSpecificFields = getResourceSpecificFields(resource);

	return {
		fields: [...baseFields, ...resourceSpecificFields],
	};
}

/**
 * Get resource-specific fields based on the resource type
 * TODO: Expand this with actual API discovery
 */
function getResourceSpecificFields(resource: string) {
	switch (resource) {
		case 'account':
			return [
				{
					id: 'name',
					displayName: 'Account Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'email',
					displayName: 'Email',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
			];

		case 'device':
			return [
				{
					id: 'hostname',
					displayName: 'Hostname',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'operatingSystem',
					displayName: 'Operating System',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'deviceType',
					displayName: 'Device Type',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
			];

		case 'site':
			return [
				{
					id: 'name',
					displayName: 'Site Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'description',
					displayName: 'Description',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
			];

		case 'alert':
			return [
				{
					id: 'alertType',
					displayName: 'Alert Type',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'priority',
					displayName: 'Priority',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'status',
					displayName: 'Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
			];

		default:
			return [
				{
					id: 'name',
					displayName: 'Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
			];
	}
}
