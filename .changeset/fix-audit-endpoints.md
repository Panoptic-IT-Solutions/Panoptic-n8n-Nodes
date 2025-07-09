---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Fix audit operation API endpoints to match Datto RMM API specification

- Fix Hardware Audit: Use `/api/v2/audit/device/{deviceUid}` instead of non-existent `/hardware` path
- Fix Printer Audit: Use `/api/v2/audit/printer/{deviceUid}` instead of `/device/{deviceUid}/printer`
- Fix ESXi Audit: Use `/api/v2/audit/esxihost/{deviceUid}` instead of `/device/{deviceUid}/esxi` 
- Fix MAC Address Audit: Use `/api/v2/audit/device/macAddress/{macAddress}` instead of `/audit/mac/{macAddress}`
- Fix Run Site Audit: Correct endpoint building logic for hardware audits to prevent 404 errors
- Remove unused audit type parameter from MAC address operation (only device audit supported)
- All endpoints now match the official Datto RMM API specification and resolve 404 errors 