---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Add "Run Site Audit" operation to audit resource

- Added new `runSiteAudit` operation that executes audits on all devices within a specified site
- Supports device filtering by type, operating system, and online status
- Includes execution options for error handling, concurrency control, and result formatting
- Provides comprehensive audit results with device-specific data, error tracking, and execution summary
- Supports all audit types: device, software, and hardware audits
- Implements batch processing with configurable concurrency (1-10 concurrent audits)
- Includes proper error handling with continue-on-error functionality 