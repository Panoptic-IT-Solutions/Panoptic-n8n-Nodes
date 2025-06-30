# Datto RMM Node for n8n

A comprehensive n8n node for integrating with Datto RMM (Remote Monitoring and Management) platform. This node enables automation of device management, site administration, alert monitoring, and more through n8n workflows.

## 📋 Table of Contents

- [Installation](#installation)
- [Authentication Setup](#authentication-setup)
- [Available Resources](#available-resources)
- [Quick Start Guide](#quick-start-guide)
- [Workflow Examples](#workflow-examples)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🚀 Installation

### Method 1: npm Installation (Recommended)
```bash
npm install n8n-nodes-datto-rmm
```

### Method 2: Manual Installation
1. Download the package
2. Place in your n8n custom nodes directory
3. Restart n8n

### Enable the Node
1. Add to your n8n environment variables:
```bash
N8N_CUSTOM_EXTENSIONS="n8n-nodes-datto-rmm"
```
2. Restart n8n service

## 🔐 Authentication Setup

### Step 1: Get Datto RMM API Credentials
1. Log into your Datto RMM portal
2. Navigate to **Administration → API Management**
3. Create new API keys:
   - **API Key** (Access Key)
   - **Secret Key**
   - **API URL** (your instance URL, e.g., `https://your-instance.centrastage.net`)

### Step 2: Configure n8n Credentials
1. In n8n, go to **Settings → Credentials**
2. Click **Create Credential**
3. Search for "Datto RMM API"
4. Fill in the required fields:
   ```
   API URL: https://your-instance.centrastage.net
   API Key: your-access-key
   Secret Key: your-secret-key
   ```
5. Click **Save** and **Test**

### Step 3: Verify Connection
The credential test will validate your connection to the Datto RMM API.

## 📊 Available Resources

### ✅ Fully Implemented Resources

#### 1. **Account Resource**
Manage account-level information and settings.

**Operations:**
- `Get` - Retrieve account information
- `Get Variables` - Get account variables

#### 2. **Device Resource** 
Comprehensive device management and monitoring.

**Operations:**
- `Get` - Get device by UID
- `Get by ID` - Get device by numeric ID  
- `Get by MAC Address` - Find device by MAC address
- `Get Open Alerts` - View active device alerts
- `Get Resolved Alerts` - View resolved device alerts
- `Move Device` - Transfer device between sites
- `Create Quick Job` - Execute automation on device
- `Set Warranty` - Update warranty information
- `Set UDF Fields` - Configure user-defined fields

#### 3. **Site Resource**
Complete site administration and monitoring.

**Operations:**
- `Get` - Get site by UID
- `Get Many` - List all sites with filtering
- `Create` - Create new site
- `Update` - Modify existing site
- `Get Devices` - List site devices with filters
- `Get Open Alerts` - View site alerts  
- `Get Resolved Alerts` - View resolved site alerts
- `Get Variables` - Retrieve site variables
- `Get Settings` - Get site configuration
- `Get Filters` - View site device filters

### ⏳ Planned Resources
- Alert Resource (resolve alerts, advanced filtering)
- Job Resource (job results, automation monitoring)
- Audit Resource (compliance, software inventory)
- System Resource (API health, rate limits)
- Filter Resource (advanced device queries)

## 🎯 Quick Start Guide

### Basic Workflow: Get Account Information

1. **Add Datto RMM Node**
   - Drag "Datto RMM" node into workflow
   - Connect to trigger (Manual, Schedule, etc.)

2. **Configure Node**
   ```
   Resource: Account
   Operation: Get
   Credential: [Select your Datto RMM credential]
   ```

3. **Execute Workflow**
   - Click Execute to test
   - View account data in output

### Basic Workflow: List All Sites

1. **Add Datto RMM Node**
2. **Configure Node**
   ```
   Resource: Site  
   Operation: Get Many
   Page: 1
   Max Results: 100
   ```
3. **Execute and Review**
   - Returns paginated list of all sites
   - Each site includes device counts and status

## 📖 Workflow Examples

### Example 1: Device Health Dashboard

**Goal:** Monitor all devices with open alerts across all sites

**Workflow Steps:**
1. **Manual Trigger** → Start workflow
2. **Datto RMM (Get Sites)** → List all sites
   ```
   Resource: Site
   Operation: Get Many
   Max Results: 100
   ```
3. **Split In Batches** → Process sites individually
4. **Datto RMM (Get Site Alerts)** → Get alerts per site
   ```
   Resource: Site  
   Operation: Get Open Alerts
   Site UID: {{ $json.uid }}
   ```
5. **Filter (Has Alerts)** → Only sites with alerts
6. **Slack/Email** → Send notifications

### Example 2: Automated Device Onboarding

**Goal:** Automatically organize new devices into appropriate sites

**Workflow Steps:**
1. **Webhook Trigger** → Receive device MAC address
2. **Datto RMM (Find Device)** → Locate device
   ```
   Resource: Device
   Operation: Get by MAC Address  
   MAC Address: {{ $json.macAddress }}
   ```
3. **Datto RMM (Move Device)** → Assign to correct site
   ```
   Resource: Device
   Operation: Move Device
   Device UID: {{ $json.uid }}
   Target Site UID: {{ $json.targetSiteUid }}
   ```
4. **Datto RMM (Set UDF Fields)** → Apply custom fields
   ```
   Resource: Device
   Operation: Set UDF Fields
   Device UID: {{ $json.uid }}
   UDF Fields: [Configure as needed]
   ```

### Example 3: Bulk Device Management

**Goal:** Run maintenance tasks across multiple devices

**Workflow Steps:**
1. **Schedule Trigger** → Daily at 2 AM
2. **Datto RMM (Get Site Devices)** → Get target devices
   ```
   Resource: Site
   Operation: Get Devices
   Site UID: {{ $json.maintenanceSiteUid }}
   Operating System: Windows
   ```
3. **Filter (Online Devices)** → Only available devices
4. **Split In Batches** → Process devices in groups
5. **Datto RMM (Create Quick Job)** → Run maintenance
   ```
   Resource: Device
   Operation: Create Quick Job
   Device UID: {{ $json.uid }}
   Job Name: "Nightly Maintenance"
   Component UID: {{ $json.maintenanceComponentUid }}
   ```

### Example 4: Alert Escalation Workflow

**Goal:** Automatically escalate high-priority alerts

**Workflow Steps:**
1. **Schedule Trigger** → Every 15 minutes
2. **Datto RMM (Get Account Alerts)** → Get all open alerts
   ```
   Resource: Account
   Operation: Get Open Alerts
   Max Results: 50
   ```
3. **Filter (High Priority)** → Critical alerts only
4. **Datto RMM (Get Device Details)** → Get device info
   ```
   Resource: Device
   Operation: Get
   Device UID: {{ $json.deviceUid }}
   ```
5. **ServiceNow/Jira** → Create tickets
6. **Slack** → Notify team

## 🔧 API Reference

### Common Parameters

#### Pagination Parameters
Most list operations support pagination:
```
Page: 1 (1-based page number)
Max Results: 100 (maximum items per page)
```

#### Filter Parameters
Many operations support filtering:
```
Site Name: "Production" (partial match allowed)
Hostname: "web-server" (partial match allowed)  
Device Type: "Workstation"
Operating System: "Windows"
```

#### Resource Mapper
All operations support dynamic field selection:
- Use "Fields to Return" to choose specific data
- Improves performance by limiting response size
- Customize output for specific workflow needs

### Error Handling

The node includes comprehensive error handling:
- **Individual Item Errors**: When "Continue on Fail" is enabled
- **Authentication Errors**: Clear OAuth2 error messages
- **Rate Limiting**: Automatic handling of API limits
- **Network Issues**: Retry logic for transient failures

### Response Format

All operations return data in consistent format:
```json
{
  "json": {
    // Datto RMM API response data
  },
  "pairedItem": {
    "item": 0
  }
}
```

## 🔍 Advanced Usage

### Using Resource Mapper

The Resource Mapper allows dynamic field selection:

1. **Enable Resource Mapper**
   - Available on all operations
   - Located in "Fields to Return" section

2. **Configure Fields**
   - Select specific fields to include
   - Improves performance
   - Reduces data transfer

3. **Example Configuration**
   ```
   Fields to Return:
   ✓ ID
   ✓ Name  
   ✓ Status
   ✗ Description (unchecked to exclude)
   ```

### Batch Processing

For large datasets, use batch processing:

1. **Split In Batches Node**
   - Process 10-50 items at a time
   - Prevents API rate limiting
   - Improves reliability

2. **Configuration Example**
   ```
   Batch Size: 25
   Options: Keep Input Data
   ```

### Custom Variables

Leverage Datto RMM variables in workflows:

1. **Get Account Variables**
   ```
   Resource: Account
   Operation: Get Variables
   ```

2. **Get Site Variables**
   ```
   Resource: Site  
   Operation: Get Variables
   Site UID: {{ $json.siteUid }}
   ```

3. **Use in Automation**
   - Reference variables in job parameters
   - Dynamic configuration based on site/account settings

## 🚨 Troubleshooting

### Common Issues

#### Authentication Errors (401)
```
Error: Request failed with status code 401
```
**Solutions:**
1. Verify API credentials in n8n
2. Check API URL format (include https://)
3. Ensure API keys have proper permissions
4. Test credentials using "Test" button

#### Rate Limiting (429)
```
Error: Request failed with status code 429
```
**Solutions:**
1. Reduce batch sizes
2. Add delays between operations
3. Use pagination for large datasets
4. Check account API limits

#### Device Not Found (404)
```
Error: Device was not found
```
**Solutions:**
1. Verify device UID/ID/MAC address
2. Check device exists in Datto RMM
3. Ensure proper permissions for device access

#### Site Access Issues (403)
```
Error: Authenticated user doesn't have access to this resource
```
**Solutions:**
1. Verify site UID is correct
2. Check user permissions in Datto RMM
3. Ensure API credentials have site access

### Debug Mode

Enable debug logging for troubleshooting:

1. **Environment Variable**
   ```bash
   N8N_LOG_LEVEL=debug
   ```

2. **Check Logs**
   - Review n8n logs for detailed API calls
   - Examine request/response data
   - Identify specific error points

### Best Practices

#### Performance Optimization
1. **Use Resource Mapper** - Select only needed fields
2. **Implement Pagination** - For large datasets
3. **Batch Processing** - Group operations efficiently
4. **Cache Results** - Store frequently accessed data

#### Error Handling
1. **Enable Continue on Fail** - For bulk operations
2. **Add Error Workflows** - Handle failures gracefully  
3. **Implement Retries** - For transient network issues
4. **Log Errors** - Track failures for debugging

#### Security
1. **Secure Credentials** - Use n8n credential system
2. **Limit API Scope** - Create dedicated API keys
3. **Regular Rotation** - Update API keys periodically
4. **Monitor Usage** - Track API consumption

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for:
- Bug reports
- Feature requests  
- Code contributions
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- GitHub Issues: [Report bugs or request features]
- Documentation: [This README and API docs]
- Community: [n8n Community Forum]

---

**Version:** 0.4.3+  
**Compatibility:** n8n v0.190.0+  
**API Version:** Datto RMM API v2 