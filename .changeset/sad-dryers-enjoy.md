---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": minor
---

Replace activity log implementation with working device activity monitoring

- **BREAKING**: Remove non-functional activity log API endpoints that don't exist in Datto RMM API
- **NEW**: Implement activity monitoring using existing device, alert, and audit endpoints
- **NEW**: Monitor computer online/offline status using device status and last seen data
- **NEW**: Track device events through alert monitoring (open/resolved alerts)
- **NEW**: Include audit changes as part of device activity timeline
- **NEW**: Support site-level activity monitoring across all devices in a site
- **NEW**: Support device-specific activity monitoring with comprehensive data
- **NEW**: Search functionality for device events using alert data and text queries
- **IMPROVED**: Provide realistic activity data combining device status, alerts, and audit information
- **IMPROVED**: Add proper TypeScript interfaces for activity data structures
- **IMPROVED**: Update descriptions to reflect actual functionality using available endpoints

This implementation now provides working computer status monitoring functionality that can track:
- Device online/offline status changes
- Alert activities (new alerts, resolved alerts)
- Audit changes and system modifications
- Site-wide device activity monitoring
- Device-specific activity timelines
- Search across device events and alerts

The previous implementation using non-existent `/api/v2/account/activity-logs` endpoints has been replaced with a working solution that leverages available Datto RMM API endpoints to provide comprehensive device activity monitoring.