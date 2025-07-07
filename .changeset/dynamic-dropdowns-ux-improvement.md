---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": minor
---

Major UX improvement: Replace manual UID entry with dynamic dropdowns across all resources

- **🎯 Site Operations**: Site UID parameters now use dropdown selection showing site names and device counts
- **🚨 Alert Operations**: Alert UID parameters replaced with dropdown showing alert descriptions, severity, and status
- **💻 Device Operations**: Device UID parameters now use dropdown with device hostnames, IPs, and status information
- **📋 Job Operations**: Job UID parameters replaced with dropdown showing job names and execution status
- **🔧 Component Selection**: Component UID for quick jobs now uses dropdown with component names and descriptions
- **📊 Audit Operations**: Device selection for audit operations now uses device dropdown instead of manual UID entry
- **🎛️ Multi-Select Jobs**: Bulk job operations now use multi-select dropdown instead of comma-separated UID strings

**New LoadOptions Methods Added:**
- `getSites()` - Loads all available sites for selection
- `getDevices()` - Loads all devices with hostname and IP information  
- `getOpenAlerts()` - Loads current open alerts with descriptions
- `getJobs()` - Loads available jobs with status information
- `getComponents()` - Loads automation components for quick job creation

**Enhanced User Experience:**
- ✅ No more manual UID hunting and copying
- ✅ Prevents typos with UID entry errors  
- ✅ Shows contextual information (device counts, alert severity, job status)
- ✅ Real-time data loaded from Datto RMM API
- ✅ Multi-select support for bulk operations
- ✅ Consistent UX patterns across all 8 resources

This update transforms the node from requiring technical UID knowledge to providing an intuitive, enterprise-ready interface suitable for all user skill levels. 