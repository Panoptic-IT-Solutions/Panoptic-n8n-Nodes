# 🚀 Datto RMM Quick Examples - Copy & Paste for n8n

## 📋 Ready-to-Use n8n Node Configurations

### 🏢 Account Operations

#### Get All Sites (Enhanced)
```json
{
  "resource": "account",
  "operation": "getSites",
  "showDeleted": false,
  "usePagination": true,
  "pageSize": 50,
  "pageNumber": 1
}
```

#### Get All Devices Across All Sites
```json
{
  "resource": "account", 
  "operation": "getDevices",
  "hostname": "",
  "operatingSystem": "",
  "siteName": "",
  "deviceType": "",
  "usePagination": true,
  "pageSize": 100
}
```

#### Find All Windows Servers
```json
{
  "resource": "account",
  "operation": "getDevices", 
  "operatingSystem": "Windows",
  "deviceType": "Server",
  "usePagination": true,
  "pageSize": 100
}
```

#### Monitor All Critical Alerts
```json
{
  "resource": "account",
  "operation": "getOpenAlerts",
  "muted": false,
  "usePagination": true,
  "pageSize": 50
}
```

#### Get All Account Users
```json
{
  "resource": "account",
  "operation": "getUsers"
}
```

### 🖥️ Device Operations

#### Get Device by Hostname (Find First Match)
```json
{
  "resource": "device",
  "operation": "get",
  "deviceUid": "device-uid-here"
}
```

#### Get Device Alerts
```json
{
  "resource": "device", 
  "operation": "getOpenAlerts",
  "deviceUid": "device-uid-here",
  "usePagination": true,
  "pageSize": 25
}
```

#### Move Device to Different Site
```json
{
  "resource": "device",
  "operation": "moveDevice", 
  "deviceUid": "device-uid-here",
  "siteUid": "new-site-uid-here"
}
```

#### Run Quick Job on Device
```json
{
  "resource": "device",
  "operation": "createQuickJob",
  "deviceUid": "device-uid-here", 
  "jobName": "System Health Check",
  "componentUid": "component-uid-here"
}
```

### 🏗️ Site Operations

#### Get Site Information
```json
{
  "resource": "site",
  "operation": "get",
  "siteUid": "site-uid-here"
}
```

#### Create New Site
```json
{
  "resource": "site",
  "operation": "create",
  "name": "New Client Location",
  "description": "Primary office location",
  "address": "123 Business St",
  "city": "Business City", 
  "state": "BC",
  "zip": "12345",
  "country": "US",
  "phone": "+1-555-123-4567"
}
```

#### Get All Devices in a Site
```json
{
  "resource": "site",
  "operation": "getDevices",
  "siteUid": "site-uid-here",
  "usePagination": true,
  "pageSize": 100
}
```

#### Get Site's Open Alerts
```json
{
  "resource": "site",
  "operation": "getOpenAlerts", 
  "siteUid": "site-uid-here",
  "usePagination": true,
  "pageSize": 50
}
```

### 🚨 Alert Operations

#### Get Alert Details
```json
{
  "resource": "alert",
  "operation": "get",
  "alertUid": "alert-uid-here"
}
```

#### Resolve Alert with Note
```json
{
  "resource": "alert",
  "operation": "resolve",
  "alertUid": "alert-uid-here",
  "resolutionNote": "Issue resolved - server restarted successfully"
}
```

#### Mute Alert (if API version supports it)
```json
{
  "resource": "alert", 
  "operation": "mute",
  "alertUid": "alert-uid-here"
}
```

## 🔧 Common Workflow Patterns

### Pattern 1: Daily Site Health Check
```
1. Schedule Trigger (Daily 8:00 AM)
   ↓
2. Datto RMM: Account → Get Sites
   ↓  
3. Split Into Batches: Each site
   ↓
4. For each site:
   - Datto RMM: Site → Get Open Alerts
   - Datto RMM: Site → Get Devices  
   - Count critical/warning alerts
   ↓
5. IF: Alert count > threshold
   - Slack: Send notification
   - Create: Ticket in system
```

### Pattern 2: Device Discovery & Auto-Assignment
```
1. Webhook: New device detected
   ↓
2. Datto RMM: Device → Get by MAC Address  
   ↓
3. IF: Device hostname contains pattern
   - Datto RMM: Device → Move to correct site
   - Datto RMM: Device → Create Quick Job (setup script)
   ↓
4. Slack: Notify team of new device
```

### Pattern 3: Alert Escalation & Resolution
```
1. Webhook: Alert created
   ↓
2. Datto RMM: Alert → Get alert details
   ↓  
3. Datto RMM: Device → Get device info
   ↓
4. IF: Critical alert + Server device
   - PagerDuty: Create incident  
   - Teams: Immediate notification
   ↓
5. ELSE IF: Warning alert
   - Slack: Standard notification
   ↓
6. Wait: 30 minutes
   ↓
7. Datto RMM: Alert → Resolve with auto-note
```

### Pattern 4: Weekly Compliance Report
```
1. Schedule: Every Monday 9:00 AM
   ↓
2. Datto RMM: Account → Get All Devices
   ↓
3. Datto RMM: Account → Get Resolved Alerts (last 7 days)
   ↓
4. Filter & Group by:
   - Site
   - Device type  
   - Alert severity
   ↓
5. Generate PDF report
   ↓
6. Email to management team
```

## 🎯 Pro Tips for n8n Workflows

### Efficient Data Processing
```json
// Use pagination for large datasets
{
  "usePagination": true,
  "pageSize": 100,  // Adjust based on your needs
  "pageNumber": 1
}
```

### Error Handling
```json
// Always enable "Continue On Fail" for bulk operations
{
  "continueOnFail": true,
  "resource": "account",
  "operation": "getDevices"
}
```

### Dynamic Field Selection
```json
// Use Resource Mapper to get only needed fields
{
  "resource": "device",
  "operation": "get", 
  "options": {
    "resourceMapper": {
      "mappingMode": "defineBelow",
      "value": {
        "hostname": "={{ $json.hostname }}",
        "status": "={{ $json.status }}",
        "lastSeen": "={{ $json.lastSeen }}"
      }
    }
  }
}
```

### Filter Combinations
```json
// Combine multiple filters for precise results
{
  "resource": "account",
  "operation": "getDevices",
  "hostname": "PROD-*",           // Wildcard matching
  "operatingSystem": "Windows",   // Exact match  
  "deviceType": "Server",         // Exact match
  "siteName": "Data Center"       // Exact match
}
```

## 🔗 Integration Examples

### With Slack
```json
// After getting alerts, format for Slack
{
  "text": "🚨 *Critical Alert*",
  "blocks": [
    {
      "type": "section", 
      "text": {
        "type": "mrkdwn",
        "text": "*Device:* {{ $node['Datto RMM'].json['hostname'] }}\n*Alert:* {{ $node['Datto RMM'].json['message'] }}\n*Site:* {{ $node['Datto RMM'].json['siteName'] }}"
      }
    }
  ]
}
```

### With Microsoft Teams
```json
// Format for Teams notification
{
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "type": "AdaptiveCard",
        "body": [
          {
            "type": "TextBlock", 
            "text": "RMM Alert: {{ $node['Datto RMM'].json['deviceName'] }}",
            "weight": "Bolder"
          }
        ]
      }
    }
  ]
}
```

## 📊 Common Expressions for Data Processing

### Extract Device Count
```javascript
// Count devices by status
{{ $json.length }} // Total count
{{ $json.filter(device => device.status === 'Online').length }} // Online count
```

### Format Alert Data
```javascript
// Format alert timestamp
{{ new Date($json.createdDate).toLocaleDateString() }}

// Extract severity level
{{ $json.severity.toUpperCase() }}
```

### Site-based Grouping
```javascript
// Group devices by site
{{ 
  $json.reduce((acc, device) => {
    const site = device.siteName;
    if (!acc[site]) acc[site] = [];
    acc[site].push(device);
    return acc;
  }, {})
}}
```

## 🎉 Ready to Build!

Copy any of these configurations into your n8n workflows and start automating your Datto RMM management today! 

For complete documentation, see:
- [README.md](./README.md) - Full setup and reference
- [CURRENT_CAPABILITIES.md](./CURRENT_CAPABILITIES.md) - What you can do now
- [AI_REFERENCE.md](./AI_REFERENCE.md) - AI assistant guide 