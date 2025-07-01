---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Fix critical bugs in account operations:

- **Fixed "Cannot read properties of undefined (reading 'trim')" error**: Added safe string handling for dynamic data inputs in getDevices and getSites operations. Now properly handles undefined/null values from expressions like `{{ $json.extractedDetails.agentName }}`.

- **Fixed duplicate results issue**: Modified list operations (get, getDevices, getUsers, etc.) to execute only once per node execution regardless of input count, preventing the same API call from running multiple times and returning duplicate data.

- **Fixed ESLint error**: Added proper block scoping for case statements with lexical declarations in error handler.

These fixes ensure that the node works reliably with dynamic data and doesn't return unexpected duplicates when processing multiple input items. 