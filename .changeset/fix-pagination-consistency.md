---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

CRITICAL: Fix pagination consistency across all Datto RMM resources

- Fixed all resource operations to use consistent 0-based pagination (page=0) instead of mixed 1-based pagination
- Resolves critical issue where some operations would return empty results despite API returning totalCount > 0
- Ensures uniform pagination behavior across Account, Device, Site, and Alert resources
- Affects all manual pagination operations: getDevices, getSites, getUsers, getVariables, getComponents, getOpenAlerts, getResolvedAlerts, getDeviceDetails, getDeviceAuditData, getSiteDevices, getSiteVariables
- Fixed Content-Type header issue that was incorrectly set for GET requests
- All resources now work consistently with both automatic pagination (retrieveAll: true) and manual pagination (page: 0, max: N)

This resolves the core pagination inconsistency that prevented reliable data retrieval across different resource types. 