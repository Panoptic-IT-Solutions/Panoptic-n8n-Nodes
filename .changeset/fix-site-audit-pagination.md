---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Fix Run Site Audit operation returning zero devices

- Fixed critical bug where Run Site Audit was only fetching the first page of devices from a site
- Now uses `dattoRmmApiRequestAllItems` to properly fetch ALL devices with automatic pagination
- Improved error message to provide better context when no devices are found
- Ensures consistent behavior with other "list all site devices" operations that work correctly 