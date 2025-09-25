# Datto RMM Activity Log Examples

This document provides comprehensive examples for using the Activity Log resource in the Datto RMM n8n node. Activity logs provide visibility into user actions, device activities, and system events with 180-day retention.

## Table of Contents

- [Overview](#overview)
- [Basic Operations](#basic-operations)
- [Filtering Examples](#filtering-examples)
- [Search Examples](#search-examples)
- [Device-Specific Logs](#device-specific-logs)
- [Site-Specific Logs](#site-specific-logs)
- [User-Specific Logs](#user-specific-logs)
- [Advanced Use Cases](#advanced-use-cases)
- [Best Practices](#best-practices)

## Overview

The Activity Log resource supports the following operations:

- **Get All**: Retrieve all activity logs with optional filtering
- **Search**: Search activity logs using text queries
- **Get by Device**: Get activities for a specific device
- **Get by Site**: Get activities for a specific site
- **Get by User**: Get activities for a specific user

All operations support date filtering, activity type filtering, and result limiting.

## Basic Operations

### Get All Activity Logs

**Basic Configuration:**
- Resource: `Activity Log`
- Operation: `Get All`
- Return All: `false`
- Limit: `100`

**Sample Output:**
```json
[
  {
    "id": "12345",
    "activityTime": "2024-01-15T10:30:00Z",
    "activityType": "login",
    "userName": "admin@company.com",
    "userId": "user123",
    "message": "User logged in successfully",
    "severity": "low",
    "status": "completed",
    "priority": "none"
  }
]
```

### Get Recent Activities (Last 24 Hours)

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get All`
- Additional Fields:
  - Date From: `{{new Date(Date.now() - 24*60*60*1000).toISOString()}}`
- Return All: `true`

## Filtering Examples

### Filter by Activity Types

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get All`
- Additional Fields:
  - Activity Type: `["login", "user_management", "device_management"]`

**Use Case:** Monitor administrative activities across your RMM environment.

### Filter by Date Range

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get All`
- Additional Fields:
  - Date From: `2024-01-01T00:00:00Z`
  - Date To: `2024-01-31T23:59:59Z`

**Use Case:** Generate monthly activity reports for compliance.

### Filter by Severity

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get All`
- Additional Fields:
  - Severity: `high`

**Use Case:** Focus on high-priority activities that require attention.

## Search Examples

### Search for Failed Login Attempts

**Configuration:**
- Resource: `Activity Log`
- Operation: `Search`
- Search Query: `failed login`
- Search Options:
  - Activity Type: `["login"]`
  - Date From: `{{new Date(Date.now() - 7*24*60*60*1000).toISOString()}}`

**Use Case:** Security monitoring for unauthorized access attempts.

### Search for Policy Changes

**Configuration:**
- Resource: `Activity Log`
- Operation: `Search`
- Search Query: `policy`
- Search Options:
  - Activity Type: `["policy_deployment", "configuration_changes"]`
  - Case Sensitive: `false`

**Use Case:** Track configuration changes across your environment.

### Search for Specific Device Activities

**Configuration:**
- Resource: `Activity Log`
- Operation: `Search`
- Search Query: `SERVER-01`
- Search Options:
  - Activity Type: `["device_management", "component_execution"]`

**Use Case:** Troubleshoot issues on a specific device.

## Device-Specific Logs

### Get All Activities for a Device

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by Device`
- Device: `[Select from dropdown]`
- Device Options:
  - Return All: `true`

**Use Case:** Complete activity history for device troubleshooting.

### Get Recent Component Executions

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by Device`
- Device: `[Select device]`
- Device Options:
  - Activity Type: `["component_execution", "job_execution"]`
  - Date From: `{{new Date(Date.now() - 24*60*60*1000).toISOString()}}`

**Use Case:** Monitor automated tasks and component runs.

### Get Hardware/Software Changes

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by Device`
- Device: `[Select device]`
- Device Options:
  - Activity Type: `["hardware_changes", "software_changes"]`
  - Date From: `{{new Date(Date.now() - 30*24*60*60*1000).toISOString()}}`

**Use Case:** Track system changes for asset management.

## Site-Specific Logs

### Get All Site Activities Including Devices

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by Site`
- Site: `[Select from dropdown]`
- Site Options:
  - Include Device Activities: `true`
  - Return All: `true`

**Use Case:** Comprehensive site monitoring and reporting.

### Get Policy Deployment Activities

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by Site`
- Site: `[Select site]`
- Site Options:
  - Activity Type: `["policy_deployment", "monitor_management"]`
  - Date From: `{{new Date(Date.now() - 7*24*60*60*1000).toISOString()}}`

**Use Case:** Track policy rollouts and monitor changes.

### Get User Access Activities by Site

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by Site`
- Site: `[Select site]`
- Site Options:
  - Activity Type: `["user_access", "device_access"]`
  - Include Device Activities: `false`

**Use Case:** Monitor user access patterns for security auditing.

## User-Specific Logs

### Get All User Activities

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by User`
- User ID: `user123`
- User Options:
  - Return All: `true`

**Use Case:** User behavior analysis and compliance reporting.

### Get Login Activities

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by User`
- User ID: `user123`
- User Options:
  - Activity Type: `["login", "password_changes", "two_factor_activity"]`

**Use Case:** Security monitoring for specific user accounts.

### Get Configuration Changes by User

**Configuration:**
- Resource: `Activity Log`
- Operation: `Get by User`
- User ID: `admin_user`
- User Options:
  - Activity Type: `["configuration_changes", "user_management"]`
  - Date From: `2024-01-01T00:00:00Z`

**Use Case:** Audit administrative actions for compliance.

## Advanced Use Cases

### Security Monitoring Workflow

**Workflow Steps:**
1. **Get Failed Logins** (Activity Log - Search)
   - Search Query: `failed`
   - Activity Type: `login`
2. **Get High Severity Events** (Activity Log - Get All)
   - Severity: `high`
   - Date From: Last 24 hours
3. **Send Alert** (Email/Slack notification)

**Use Case:** Automated security incident detection and alerting.

### Compliance Reporting Workflow

**Workflow Steps:**
1. **Get User Management Activities** (Activity Log - Get All)
   - Activity Type: `["user_management", "password_reset", "two_factor_reset"]`
   - Date Range: Monthly
2. **Get Configuration Changes** (Activity Log - Get All)
   - Activity Type: `["configuration_changes", "policy_deployment"]`
   - Date Range: Monthly
3. **Generate Report** (Format and export data)

**Use Case:** Monthly compliance reports for auditors.

### Device Health Monitoring

**Workflow Steps:**
1. **Get Device Connection Issues** (Activity Log - Get All)
   - Activity Type: `["device_connection"]`
   - Search for "disconnect" or "offline"
2. **Get Component Failures** (Activity Log - Get All)
   - Activity Type: `["component_execution", "job_execution"]`
   - Search for "failed" or "error"
3. **Create Tickets** (ServiceNow/JIRA integration)

**Use Case:** Proactive device health monitoring and issue escalation.

## Best Practices

### Performance Optimization

1. **Use Date Filtering**: Always specify date ranges to limit result sets
2. **Limit Results**: Use pagination instead of retrieving all records
3. **Specific Activity Types**: Filter by relevant activity types only
4. **Column Selection**: Use Select Columns to retrieve only needed fields

### Security Considerations

1. **Access Control**: Ensure proper n8n permissions for activity log access
2. **Data Retention**: Follow your organization's data retention policies
3. **Sensitive Information**: Be careful when logging or exposing user data
4. **Rate Limiting**: Respect API rate limits (600 requests per 60 seconds)

### Error Handling

```javascript
// Example error handling in expressions
try {
  // Process activity log data
  return items.map(item => ({
    json: {
      processedAt: new Date().toISOString(),
      ...item.json
    }
  }));
} catch (error) {
  return [{
    json: {
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }];
}
```

### Data Processing Tips

1. **Date Formatting**: Convert timestamps to local timezone when needed
2. **Activity Correlation**: Use seriesUid to group related activities
3. **User-Friendly Messages**: Transform technical messages for end users
4. **Data Aggregation**: Group activities by type, user, or time period

## Sample Workflow Templates

### 1. Daily Security Report

**Trigger**: Schedule (Daily at 8 AM)
**Steps**:
1. Get failed login attempts (last 24 hours)
2. Get high-severity activities (last 24 hours)
3. Format report email
4. Send to security team

### 2. Device Maintenance Alert

**Trigger**: Schedule (Every 4 hours)
**Steps**:
1. Get device connection issues (last 4 hours)
2. Get component failures (last 4 hours)
3. Create maintenance tickets for affected devices
4. Send summary to IT team

### 3. User Activity Audit

**Trigger**: Manual or Schedule (Monthly)
**Steps**:
1. Get all user activities (last month)
2. Generate user activity summary
3. Export to CSV
4. Store in compliance folder

## API Endpoint Reference

The Activity Log operations use the following Datto RMM API endpoints:

- **Get All**: `GET /api/v2/account/activity-logs`
- **Search**: `GET /api/v2/account/activity-logs/search`
- **By Device**: `GET /api/v2/device/{deviceUid}/activity-logs`
- **By Site**: `GET /api/v2/site/{siteUid}/activity-logs`
- **By User**: `GET /api/v2/user/{userId}/activity-logs`

For more information, refer to the Datto RMM API documentation.