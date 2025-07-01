---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Add automatic pagination support for all "get all" operations

- Added "Retrieve All" toggle option for all paginated operations in account and site resources
- When enabled (default), automatically fetches all results across all pages without user configuration
- When disabled, allows manual pagination control with page and max results parameters
- Improved user experience by eliminating the need to manually handle pagination for large result sets
- Enhanced pagination helper with proper Datto RMM API response structure handling
- Affects all list operations: getDevices, getUsers, getSites, getVariables, getComponents, getOpenAlerts, getResolvedAlerts across account and site resources 