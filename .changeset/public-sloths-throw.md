---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": minor
---

Dramatically improve Activity Log historical data retrieval

- **ENHANCED**: Activity Log now fetches extensive historical data using audit endpoints with date range support
- **NEW**: Historical audit change log data provides months of device activity history
- **IMPROVED**: Fetch both open and resolved alerts for comprehensive activity timeline
- **NEW**: Support for `includeArchived`, `startDate`, and `endDate` parameters in audit data retrieval
- **ENHANCED**: Each device now gets individual audit data fetched with proper date filtering
- **IMPROVED**: Activity type filtering now works correctly across all data sources
- **FIXED**: Date filtering now properly applies to all activity types
- **ENHANCED**: Better error handling for individual device audit data fetching
- **NEW**: Comprehensive activity timeline combining device status, audit changes, and alert history

The Activity Log now provides much more historical data by leveraging:
- Device audit change logs with configurable date ranges
- Both open and resolved alert histories  
- Individual device audit data fetching with archive support
- Proper chronological sorting of all activity types
- Enhanced filtering capabilities across all historical data sources

This resolves the issue where activity logs were only showing recent data by implementing proper historical data retrieval from multiple Datto RMM API endpoints.
