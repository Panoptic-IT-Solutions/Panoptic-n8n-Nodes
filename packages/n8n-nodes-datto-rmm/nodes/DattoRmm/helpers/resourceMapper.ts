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
				// Basic device information
				{
					id: 'uid',
					displayName: 'Device UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'hostname',
					displayName: 'Hostname',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'displayName',
					displayName: 'Display Name',
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
					displayName: 'Device Type (Full Object)',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'deviceType.category',
					displayName: 'Device Type Category',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'deviceType.type',
					displayName: 'Device Type Specific',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				// Network information
				{
					id: 'intIpAddress',
					displayName: 'Internal IP Address',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'extIpAddress',
					displayName: 'External IP Address',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'lastLoggedInUser',
					displayName: 'Last Logged In User',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'domain',
					displayName: 'Domain',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				// Site information
				{
					id: 'siteName',
					displayName: 'Site Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'siteUid',
					displayName: 'Site UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				// Status fields
				{
					id: 'online',
					displayName: 'Online Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'suspended',
					displayName: 'Suspended Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'deleted',
					displayName: 'Deleted Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'rebootRequired',
					displayName: 'Reboot Required',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				// System information
				{
					id: 'a64Bit',
					displayName: '64-bit Architecture',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'cagVersion',
					displayName: 'CAG Version',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'displayVersion',
					displayName: 'Display Version',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'softwareStatus',
					displayName: 'Software Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'snmpEnabled',
					displayName: 'SNMP Enabled',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				// Antivirus information
				{
					id: 'antivirus',
					displayName: 'Antivirus (Full Object)',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'antivirus.antivirusProduct',
					displayName: 'Antivirus Product',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'antivirus.antivirusStatus',
					displayName: 'Antivirus Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				// Patch management
				{
					id: 'patchManagement',
					displayName: 'Patch Management (Full Object)',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'patchManagement.patchStatus',
					displayName: 'Patch Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'patchManagement.patchesApprovedPending',
					displayName: 'Patches Approved Pending',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'patchManagement.patchesNotApproved',
					displayName: 'Patches Not Approved',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'patchManagement.patchesInstalled',
					displayName: 'Patches Installed',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				// User Defined Fields
				{
					id: 'udf',
					displayName: 'UDF (Full Object)',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf1',
					displayName: 'UDF 1',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf2',
					displayName: 'UDF 2',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf3',
					displayName: 'UDF 3',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf4',
					displayName: 'UDF 4',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf5',
					displayName: 'UDF 5',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf6',
					displayName: 'UDF 6',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf7',
					displayName: 'UDF 7',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf8',
					displayName: 'UDF 8',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf9',
					displayName: 'UDF 9',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'udf.udf10',
					displayName: 'UDF 10',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
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

		case 'job':
			return [
				{
					id: 'jobUid',
					displayName: 'Job UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'jobName',
					displayName: 'Job Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
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
				{
					id: 'deviceUid',
					displayName: 'Device UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
			];

		case 'audit':
			return [
				{
					id: 'deviceUid',
					displayName: 'Device UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'auditType',
					displayName: 'Audit Type',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'lastAuditDate',
					displayName: 'Last Audit Date',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'version',
					displayName: 'Version',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
			];

		case 'system':
			return [
				{
					id: 'status',
					displayName: 'System Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'version',
					displayName: 'API Version',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'rateLimit',
					displayName: 'Rate Limit',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'requestsRemaining',
					displayName: 'Requests Remaining',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
			];

		case 'filter':
			return [
				{
					id: 'filterUid',
					displayName: 'Filter UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'name',
					displayName: 'Filter Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'category',
					displayName: 'Category',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'criteria',
					displayName: 'Filter Criteria',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
			];

		case 'activityLog':
			return [
				{
					id: 'activityTime',
					displayName: 'Activity Time',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'activityType',
					displayName: 'Activity Type',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'userName',
					displayName: 'User Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'userId',
					displayName: 'User ID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'deviceName',
					displayName: 'Device Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'deviceId',
					displayName: 'Device ID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'siteName',
					displayName: 'Site Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'siteId',
					displayName: 'Site ID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'message',
					displayName: 'Activity Message',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'severity',
					displayName: 'Severity',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'status',
					displayName: 'Status',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'activityResult',
					displayName: 'Activity Result',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
				},
				{
					id: 'sourceConfigUid',
					displayName: 'Source Config UID',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'sourceName',
					displayName: 'Source Name',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'subject',
					displayName: 'Subject',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: false,
					display: true,
				},
				{
					id: 'priority',
					displayName: 'Priority',
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
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
