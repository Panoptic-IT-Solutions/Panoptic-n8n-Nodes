---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Fix "Could not get parameter" error for Activity Log operations

- Integrate activity log operations directly into activityLogFields array
- Resolve missing operation parameter when Activity Log resource is selected
- Ensure proper operation dropdown functionality for all Activity Log operations (Get All, Search, Get by Device, Get by Site, Get by User)
- Fix node execution error that prevented Activity Log functionality from working