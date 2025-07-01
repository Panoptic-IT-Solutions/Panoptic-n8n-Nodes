---
'@panoptic-it-solutions/n8n-nodes-datto-rmm': patch
---

# Major Enhancement: Expanded Datto RMM Node Capabilities

## 🚀 Enhanced Account Resource (2 → 8 Operations)
- **NEW: Get All Devices** - Search ALL devices across ALL sites with advanced filtering (hostname patterns, OS, device type, site)
- **NEW: Get Users** - Retrieve all account users and their permissions
- **NEW: Get Components** - List available automation components for job creation
- **NEW: Get Open Alerts** - Monitor all active alerts account-wide with filtering options
- **NEW: Get Resolved Alerts** - Access historical alert data for analysis
- **NEW: Get Sites** - Enhanced site listing with pagination and filtering

## 🆕 New Alert Resource (4 Operations)
- **Get Alert Details** - Retrieve specific alert information by UID
- **Resolve Alerts** - Programmatically resolve alerts with optional resolution notes
- **Mute Alert** - Control alert notifications (deprecated in newer API versions)
- **Unmute Alert** - Re-enable alert notifications

## 🔧 Technical Improvements
- **Advanced Filtering** - Support for wildcard hostname matching, OS filtering, device type, and site-specific queries
- **Enhanced Pagination** - Efficient handling of large datasets (1000+ devices/alerts)
- **Resource Mapper Integration** - Dynamic field selection for optimized API performance
- **Improved Error Handling** - Better error messages and continue-on-fail support
- **Cross-Site Operations** - Account-wide queries spanning multiple client sites

## 📚 Comprehensive Documentation
- **CURRENT_CAPABILITIES.md** - Complete overview of 31 available operations
- **ENHANCEMENT_ROADMAP.md** - Future development plan with 100+ additional operations
- **QUICK_EXAMPLES.md** - Copy/paste n8n workflow configurations
- **Updated README.md** - Complete setup and usage guide
- **AI_REFERENCE.md** - Quick reference for AI assistants

## 💡 New Workflow Capabilities
- **Enterprise RMM Dashboard** - Real-time monitoring across all sites and devices
- **Automated Alert Management** - Programmatic alert resolution with audit trails
- **Client Health Reports** - Comprehensive site-by-site reporting
- **Cross-Site Device Management** - Search and manage devices across entire RMM instance
- **Compliance Reporting** - Historical data analysis and user management

This update transforms the node from basic device/site management to a comprehensive RMM automation platform suitable for enterprise-grade workflows. 