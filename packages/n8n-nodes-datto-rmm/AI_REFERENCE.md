# AI Reference Guide: Datto RMM n8n Node

## 🤖 For AI Assistants: Quick Implementation Guide

This reference provides exact configurations and patterns for AI assistants helping users implement Datto RMM workflows in n8n.

## 📋 Available Resources & Operations

### Account Resource
```
Resource: Account
Operations:
  - Get (account info)
  - Get Variables (account variables)
```

### Device Resource (9 operations)
```
Resource: Device
Operations:
  - Get (by UID)
  - Get by ID (by numeric ID)
  - Get by MAC Address (find by MAC)
  - Get Open Alerts (active alerts)
  - Get Resolved Alerts (resolved alerts)
  - Move Device (transfer between sites)
  - Create Quick Job (run automation)
  - Set Warranty (update warranty info)
  - Set UDF Fields (custom fields)
```

### Site Resource (10 operations)
```
Resource: Site
Operations:
  - Get (by UID)
  - Get Many (list all sites)
  - Create (new site)
  - Update (modify site)
  - Get Devices (site devices)
  - Get Open Alerts (site alerts)
  - Get Resolved Alerts (resolved alerts)
  - Get Variables (site variables)
  - Get Settings (site config)
  - Get Filters (device filters)
```

## 🎯 Common Configuration Patterns

### Basic Get Operation
```
Resource: [account|device|site]
Operation: Get
[UID Parameter]: {{ $json.uid }}
Credential: [User's Datto RMM credential]
```

### List Operations with Pagination
```
Resource: Site
Operation: Get Many
Page: 1
Max Results: 100
Site Name Filter: [optional]
```

### Device Operations
```
Resource: Device
Operation: Get by MAC Address
MAC Address: {{ $json.macAddress }}
```

### Alert Operations
```
Resource: [Device|Site]
Operation: Get Open Alerts
[UID]: {{ $json.uid }}
Page: 1
Max Results: 50
Muted: false
```

## 🔧 Expression Examples

### Common n8n Expressions
```javascript
// Get UID from previous node
{{ $json.uid }}

// Get device UID from alert
{{ $json.deviceUid }}

// Get site UID from device
{{ $json.siteUid }}

// Format MAC address (remove separators)
{{ $json.macAddress.replace(/[:-]/g, '') }}

// Get current timestamp
{{ $now.toISO() }}
```

## 📊 Workflow Patterns

### Pattern 1: Monitor All Sites
```
1. Manual Trigger
2. Datto RMM Node:
   Resource: Site
   Operation: Get Many
   Max Results: 100
3. Split In Batches (batch size: 10)
4. Datto RMM Node:
   Resource: Site
   Operation: Get Open Alerts
   Site UID: {{ $json.uid }}
```

### Pattern 2: Device Management
```
1. Trigger (Schedule/Webhook)
2. Datto RMM Node:
   Resource: Device
   Operation: Get by MAC Address
   MAC Address: {{ $json.macAddress }}
3. Datto RMM Node:
   Resource: Device
   Operation: Move Device
   Device UID: {{ $json.uid }}
   Target Site UID: {{ $json.targetSiteUid }}
```

### Pattern 3: Bulk Operations
```
1. Schedule Trigger
2. Datto RMM Node:
   Resource: Site
   Operation: Get Devices
   Site UID: {{ $json.siteUid }}
   Operating System: "Windows"
3. Filter Node (online devices only)
4. Split In Batches (batch size: 25)
5. Datto RMM Node:
   Resource: Device
   Operation: Create Quick Job
   Device UID: {{ $json.uid }}
   Job Name: "Maintenance Task"
   Component UID: {{ $json.componentUid }}
```

## 🚨 Error Handling Configurations

### Standard Error Handling
```
Continue on Fail: ✓ Enabled (for bulk operations)
Retry on Fail: 3 attempts
Retry Interval: 1000ms
```

### Common Error Responses
```javascript
// 401 Authentication Error
{
  "error": "Request failed with status code 401",
  "description": "Check API credentials"
}

// 404 Not Found
{
  "error": "Device/Site was not found",
  "description": "Verify UID exists"
}

// 429 Rate Limit
{
  "error": "Request failed with status code 429",
  "description": "Reduce batch size or add delays"
}
```

## 🔍 Field Selection Patterns

### Resource Mapper Configuration
```
Fields to Return:
✓ id
✓ uid  
✓ name
✓ status
✗ description (uncheck to exclude)
✗ notes (uncheck to exclude)
```

### Device-Specific Fields
```
✓ hostname
✓ operatingSystem
✓ deviceType
✓ siteName
✓ status
```

### Site-Specific Fields
```
✓ name
✓ uid
✓ devicesStatus
✓ accountUid
```

## 📝 Parameter Reference

### Pagination Parameters
```
Page: 1 (1-based indexing)
Max Results: 100 (max per page)
```

### Filter Parameters
```
Site Name: "partial match allowed"
Hostname: "server-" (prefix matching)
Device Type: "Workstation"
Operating System: "Windows 10"
```

### UDF Fields Structure
```
UDF Fields:
- Field:
  - Name: "Department"
  - Value: "IT"
- Field:
  - Name: "Owner"
  - Value: "John Doe"
```

## 🎯 User Intent Mapping

### When User Says: "Get all devices"
```
Resource: Site
Operation: Get Devices
Site UID: [ask for specific site or get all sites first]
```

### When User Says: "Check alerts"
```
Resource: Account
Operation: Get Open Alerts
Max Results: 50
```

### When User Says: "Find device by MAC"
```
Resource: Device
Operation: Get by MAC Address
MAC Address: [clean MAC format - no separators]
```

### When User Says: "Move device to different site"
```
Resource: Device
Operation: Move Device
Device UID: [from previous step]
Target Site UID: [ask user or get from context]
```

## 🔧 Debugging Helpers

### Test Authentication
```
Resource: Account
Operation: Get
[Simple test to verify credentials work]
```

### Check API Limits
```
Resource: System
Operation: Get Request Rate
[When implemented - shows API usage]
```

### Validate Device Exists
```
Resource: Device
Operation: Get
Device UID: {{ $json.uid }}
[Before performing operations on device]
```

## 📈 Performance Guidelines

### Batch Size Recommendations
- **Small datasets** (< 50 items): No batching needed
- **Medium datasets** (50-500 items): Batch size 25-50
- **Large datasets** (500+ items): Batch size 10-25

### API Rate Limiting
- **Conservative**: 1 request per second
- **Standard**: 5 requests per second  
- **Aggressive**: 10 requests per second (monitor for 429 errors)

### Memory Optimization
- Use Resource Mapper to limit fields
- Implement pagination for large datasets
- Clear unnecessary data between nodes

## 🚀 Quick Start Templates

### Template 1: Device Health Check
```json
{
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "Get Sites",
      "type": "n8n-nodes-datto-rmm.dattoRmm",
      "parameters": {
        "resource": "site",
        "operation": "getMany",
        "max": 100
      }
    },
    {
      "name": "Get Site Alerts",
      "type": "n8n-nodes-datto-rmm.dattoRmm", 
      "parameters": {
        "resource": "site",
        "operation": "getOpenAlerts",
        "siteUid": "={{ $json.uid }}"
      }
    }
  ]
}
```

### Template 2: Device Lookup
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Find Device",
      "type": "n8n-nodes-datto-rmm.dattoRmm",
      "parameters": {
        "resource": "device",
        "operation": "getByMacAddress",
        "macAddress": "={{ $json.macAddress.replace(/[:-]/g, '') }}"
      }
    }
  ]
}
```

## 💡 AI Assistant Guidelines

### When Helping Users:
1. **Always ask for Datto RMM credentials first**
2. **Test with Account > Get operation** for initial validation
3. **Use Resource Mapper** to optimize performance
4. **Enable Continue on Fail** for bulk operations
5. **Implement proper error handling** in workflows
6. **Suggest batch processing** for large datasets
7. **Provide exact node configurations** with all required parameters
8. **Include expressions** for dynamic data mapping
9. **Recommend testing** with small datasets first
10. **Explain pagination** for large result sets

### Common User Requests:
- **"Monitor all devices"** → Site > Get Many → Split → Get Open Alerts
- **"Find specific device"** → Device > Get by MAC/UID/ID
- **"Automate device tasks"** → Device > Create Quick Job
- **"Generate reports"** → Combine multiple resources with filters
- **"Set up alerting"** → Schedule trigger + Alert operations + Notifications 