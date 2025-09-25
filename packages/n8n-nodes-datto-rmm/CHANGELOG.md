# n8n-nodes-datto-rmm

## 0.7.0

### Minor Changes

- ed0545d: Add Activity Log resource support to Datto RMM node
  - Add new Activity Log resource with comprehensive operations (get, list, search)
  - Implement activity log filtering with support for date ranges, sites, devices, and status
  - Add activity log type definitions and response interfaces
  - Include activity log examples and documentation
  - Update resource definitions and mapper to include activity log functionality
  - Add comprehensive test coverage for activity log operations
  - Support for paginated activity log results with proper metadata handling

## 0.6.3

### Patch Changes

- 731eae0: Fix audit operation API endpoints to match Datto RMM API specification
  - Fix Hardware Audit: Use `/api/v2/audit/device/{deviceUid}` instead of non-existent `/hardware` path
  - Fix Printer Audit: Use `/api/v2/audit/printer/{deviceUid}` instead of `/device/{deviceUid}/printer`
  - Fix ESXi Audit: Use `/api/v2/audit/esxihost/{deviceUid}` instead of `/device/{deviceUid}/esxi`
  - Fix MAC Address Audit: Use `/api/v2/audit/device/macAddress/{macAddress}` instead of `/audit/mac/{macAddress}`
  - Fix Run Site Audit: Correct endpoint building logic for hardware audits to prevent 404 errors
  - Remove unused audit type parameter from MAC address operation (only device audit supported)
  - All endpoints now match the official Datto RMM API specification and resolve 404 errors

## 0.6.2

### Patch Changes

- 91a9b44: Fix Run Site Audit operation returning zero devices
  - Fixed critical bug where Run Site Audit was only fetching the first page of devices from a site
  - Now uses `dattoRmmApiRequestAllItems` to properly fetch ALL devices with automatic pagination
  - Improved error message to provide better context when no devices are found
  - Ensures consistent behavior with other "list all site devices" operations that work correctly

## 0.6.1

### Patch Changes

- 3a92707: Add "Run Site Audit" operation to audit resource
  - Added new `runSiteAudit` operation that executes audits on all devices within a specified site
  - Supports device filtering by type, operating system, and online status
  - Includes execution options for error handling, concurrency control, and result formatting
  - Provides comprehensive audit results with device-specific data, error tracking, and execution summary
  - Supports all audit types: device, software, and hardware audits
  - Implements batch processing with configurable concurrency (1-10 concurrent audits)
  - Includes proper error handling with continue-on-error functionality

## 0.6.0

### Minor Changes

- 22589dd: Advanced Device Filtering System for Account Operations

  Implemented a comprehensive two-tier filtering system for the "Get All Devices" operation, enabling users to filter devices using both simple API-level filters and complex client-side conditions with 25+ device properties.

  ## 🎯 **Key Features**
  - **🔍 Two-Tier Architecture**: Basic API filters + Advanced client-side filtering
  - **📊 25+ Filter Fields**: Device info, network details, security status, patch management, UDFs 1-10
  - **⚙️ 13 Comparison Operators**: equals, contains, regex, numeric comparisons, isEmpty, and more
  - **🔗 Logical Combinations**: AND/OR logic between multiple filter conditions
  - **🎛️ Type-Aware Filtering**: String, numeric, and boolean value handling
  - **🚀 Multi-Input Support**: Process multiple hostnames in a single operation

  ## 🛠 **Technical Implementation**

  ### **New Helper Module**: `helpers/deviceFilter.ts`
  - `applyAdvancedFilters()` - Main filtering engine with AND/OR logic
  - `evaluateCondition()` - Type-safe condition evaluation
  - `getNestedValue()` - Dot-notation property access (e.g., `deviceType.category`)
  - `validateFilterConditions()` - Input validation and sanitization

  ### **Enhanced UI Controls**: `resources/account/description.ts`
  - Advanced filter toggle (`useAdvancedFilters`)
  - Dynamic field selection with comprehensive device properties
  - Operator selection with context-appropriate input types
  - Filter logic selection (AND/OR combinations)
  - Clear separation between basic and advanced filter sections

  ### **Execute Function Updates**: `resources/account/execute.ts`
  - Multi-input hostname processing with result consolidation
  - Dynamic import and application of advanced filter logic
  - Integration with both paginated and non-paginated API results
  - Backward compatibility with existing basic filters

  ## 📋 **Supported Filter Properties**

  ### **Device Information**
  - Hostname, Device Type Category, Operating System, Site Name, Domain, Description

  ### **Network & Connectivity**
  - Internal IP Address, External IP Address, Last Logged In User

  ### **Status & Health**
  - Online Status, Suspended Status, Deleted Status, Reboot Required, 64-bit Architecture

  ### **Software & Versions**
  - CAG Version, Display Version, Software Status, SNMP Enabled

  ### **Security & Compliance**
  - Antivirus Product, Antivirus Status, Patch Status, Patches (Approved Pending, Not Approved, Installed)

  ### **Custom Organization Data**
  - User Defined Fields 1-10 (UDF support for custom business requirements)

  ## 🔧 **Filter Operators**
  - **Text Matching**: equals, contains, startsWith, endsWith, notEquals, notContains
  - **Existence Checks**: isEmpty, isNotEmpty
  - **Numeric Comparisons**: greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual
  - **Pattern Matching**: regex (with case-insensitive support)

  ## 🚀 **Enterprise Benefits**
  - **✅ Scalable Filtering**: Handle large device inventories with complex filter requirements
  - **✅ Flexible Logic**: Build sophisticated filter combinations for specific use cases
  - **✅ Performance Optimized**: Client-side filtering applied after efficient API pagination
  - **✅ User-Friendly Interface**: Clear UI guidance between simple and advanced filtering options
  - **✅ Type Safety**: Robust handling of different data types prevents filter errors
  - **✅ Backward Compatible**: Existing workflows continue to function without changes
  - **✅ Custom Field Support**: Full integration with User Defined Fields for organizational data

  This implementation elevates the Datto RMM node from basic device listing to a powerful device management tool suitable for enterprise environments with complex filtering requirements.

## 0.5.0

### Minor Changes

- 7fdf15d: Major UX improvement: Replace manual UID entry with dynamic dropdowns across all resources
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

## 0.4.14

### Patch Changes

- 98e5e8c: Fix Account > getDevices operation to support multiple hostname filtering:
  - **Fixed single hostname limitation**: Account > getDevices operation now properly processes multiple input items instead of only processing the first hostname
  - **Added multi-hostname support**: When multiple input items are provided, the operation collects all unique hostnames and searches for each one individually
  - **Improved parameter handling**: Enhanced hostname parameter to extract values from each input item using expressions like `{{ $json.output.agentName }}`
  - **Combined results**: All matching devices from multiple hostname searches are combined into a single output

  This fix resolves the issue where only the first input item's hostname was being processed, ensuring all provided hostnames are searched in the Datto RMM API.

## 0.4.13

### Patch Changes

- d8756b7: Fix critical bugs in account operations:
  - **Fixed "Cannot read properties of undefined (reading 'trim')" error**: Added safe string handling for dynamic data inputs in getDevices and getSites operations. Now properly handles undefined/null values from expressions like `{{ $json.extractedDetails.agentName }}`.
  - **Fixed duplicate results issue**: Modified list operations (get, getDevices, getUsers, etc.) to execute only once per node execution regardless of input count, preventing the same API call from running multiple times and returning duplicate data.
  - **Fixed ESLint error**: Added proper block scoping for case statements with lexical declarations in error handler.

  These fixes ensure that the node works reliably with dynamic data and doesn't return unexpected duplicates when processing multiple input items.

## 0.4.12

### Patch Changes

- 3161421: CRITICAL: Fix pagination consistency across all Datto RMM resources
  - Fixed all resource operations to use consistent 0-based pagination (page=0) instead of mixed 1-based pagination
  - Resolves critical issue where some operations would return empty results despite API returning totalCount > 0
  - Ensures uniform pagination behavior across Account, Device, Site, and Alert resources
  - Affects all manual pagination operations: getDevices, getSites, getUsers, getVariables, getComponents, getOpenAlerts, getResolvedAlerts, getDeviceDetails, getDeviceAuditData, getSiteDevices, getSiteVariables
  - Fixed Content-Type header issue that was incorrectly set for GET requests
  - All resources now work consistently with both automatic pagination (retrieveAll: true) and manual pagination (page: 0, max: N)

  This resolves the core pagination inconsistency that prevented reliable data retrieval across different resource types.

## 0.4.11

### Patch Changes

- dbb1902: Add automatic pagination support for all "get all" operations
  - Added "Retrieve All" toggle option for all paginated operations in account and site resources
  - When enabled (default), automatically fetches all results across all pages without user configuration
  - When disabled, allows manual pagination control with page and max results parameters
  - Improved user experience by eliminating the need to manually handle pagination for large result sets
  - Enhanced pagination helper with proper Datto RMM API response structure handling
  - Affects all list operations: getDevices, getUsers, getSites, getVariables, getComponents, getOpenAlerts, getResolvedAlerts across account and site resources

- 3e4795e: CRITICAL: Fix pagination indexing across all account operations
  - Fixed pagination to use 1-based indexing (page=1) instead of 0-based (page=0) for all account operations to match API requirements
  - Resolves issue where operations would return empty results despite totalCount > 0
  - Ensures consistency with site operations that were already working correctly
  - Affects getDevices, getSites, getUsers, getVariables, and all other account operations

## 0.4.10

### Patch Changes

- d9ede9d: **Fix: Pagination and Response Parsing for Account Operations**

  Fixed critical pagination and response parsing issues that prevented proper data extraction from Datto RMM API responses.

  ## 🐛 Fixed Issues
  - **Empty Results**: Operations like "Get Sites" returned empty arrays despite API showing totalCount > 0
  - **Wrong Page Index**: Node was using 1-based pagination while Datto RMM API expects 0-based pagination
  - **Response Structure**: Node was returning entire response wrapper instead of extracting data arrays

  ## ✅ Resolved
  - ✅ **0-Based Pagination**: Changed all page defaults from 1 to 0 to match Datto RMM API expectations
  - ✅ **Data Extraction**: Added operation-specific response parsing:
    - `getSites` → extracts `sites[]` array
    - `getDevices` → extracts `devices[]` array
    - `getUsers` → extracts `users[]` array
    - `getComponents` → extracts `components[]` array
    - `getOpenAlerts`/`getResolvedAlerts` → extracts `alerts[]` array
  - ✅ **Pagination Info**: Includes helpful pagination details when no data found

  ## 🎯 Impact

  This resolves the core usability issue where users saw response metadata instead of actual data. Account operations now return clean, individual data objects that can be properly processed in n8n workflows.

  **Before**: `{ pageDetails: {...}, sites: [] }` (wrapper object)
  **After**: Individual site objects that can be mapped, filtered, and processed

  **Affected Operations:** All account list operations (getSites, getDevices, getUsers, etc.)

## 0.4.9

### Patch Changes

- 8501dc8: **Bug Fixes: API Endpoint 404 Errors Resolved**

  Fixed critical API endpoint issues that were causing 404 errors across multiple Datto RMM operations:

  ## 🐛 Fixed Issues
  - **Account Operations**: All account operations (getSites, getDevices, getUsers, etc.) were failing with 404 errors
  - **Alert Operations**: All alert operations (get, resolve, mute, unmute) were returning 404 responses
  - **Missing API Prefix**: Endpoints were missing the required `/api/v2` prefix that the Datto RMM API requires

  ## ✅ Resolved
  - ✅ Account endpoints: Added `/api/v2` prefix to all operations (`/account/*` → `/api/v2/account/*`)
  - ✅ Alert endpoints: Added `/api/v2` prefix to all operations (`/alert/*` → `/api/v2/alert/*`)
  - ✅ ResourceMapper consistency: Standardized field naming across all resources
  - ✅ All tests passing: Verified functionality with comprehensive test suite

  ## 🎯 Impact

  This fix resolves the primary issue preventing users from successfully using account and alert operations. The "Get account sites" operation and all other account/alert operations now work correctly.

  **Affected Operations:**
  - Account: `get`, `getSites`, `getDevices`, `getUsers`, `getComponents`, `getOpenAlerts`, `getResolvedAlerts`
  - Alert: `get`, `resolve`, `mute`, `unmute`

## 0.4.8

### Patch Changes

- b0a34c0: # Major Enhancement: Expanded Datto RMM Node Capabilities

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

- 294bf39: # Major Enhancement: Expanded Datto RMM Node Capabilities

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

## 0.4.7

### Patch Changes

- 47aa214: feat(datto-rmm): Add device and site resource operations to Datto RMM node

## 0.4.6

### Patch Changes

- 9a1a8f5: oauth

## 0.4.5

### Patch Changes

- ee0004a: Oauth2 tests

## 0.4.4

### Patch Changes

- Add missing scope field to OAuth2 credentials configuration
  - Added hidden 'scope' field with default value 'default' to prevent n8n OAuth2 UI errors
  - This field was missing from the published v0.4.3 but is required for proper n8n OAuth2 functionality
  - Without this field, users may experience OAuth2 configuration issues in the n8n UI
  - Completes the OAuth2 authentication fix started in v0.4.3

## 0.4.3

### Patch Changes

- d007f8f: Fix OAuth2 authentication implementation to match Datto RMM API requirements
  - Updated credential configuration to use password grant type with public-client:public
  - Fixed token request to send API Key/Secret as username/password in request body
  - Added missing scope field to prevent n8n OAuth2 UI errors
  - Created comprehensive OAuth2 test script that emulates n8n's exact authentication flow
  - Created n8n credential tester script that validates the actual credential class
  - Verified authentication works with actual Datto RMM API endpoints (status 200 responses)
  - All OAuth2 configuration now matches working Python implementation pattern

## 0.4.2

### Patch Changes

- ca84efd: Oauth fixes
- ad06b31: Version Bump

## 0.4.1

### Patch Changes

- f0054ca: Fix Oauth again

## 0.4.0

### Patch Changes

- e6faf9f: **OAuth2 Authentication & JSON Parsing Improvements (v0.4.0-alpha.6)**
  - **Fixed OAuth2 Implementation**: Replaced manual OAuth2 with proper n8n OAuth2 extension using Resource Owner Password Credentials flow
  - **Enhanced Authentication**: Configured proper OAuth2 endpoints with dynamic URL handling for token acquisition
  - **JSON Response Parsing Fix**: Fixed critical bug where API responses were returned as escaped JSON strings instead of parsed objects
  - **Improved Error Handling**: Added better OAuth2 error detection and response type handling
  - **Production Testing**: Confirmed working OAuth2 flow with real Panoptic IT Solutions account data
  - **Community Standards**: Aligned OAuth2 implementation with n8n community best practices

  This release resolves authentication issues and ensures proper API response handling for production use.

## 0.4.0

### Minor Changes

- **BREAKING CHANGE**: Implement proper n8n OAuth2 authentication system
  - **OAuth2 Credentials**: Replaced manual token handling with n8n's built-in OAuth2 system
  - **Resource Owner Password Credentials**: Properly configured for Datto RMM's `grant_type=password` flow
  - **JSON Response Parsing**: Fixed critical bug where API responses were sometimes returned as strings
  - **Token Management**: Automatic token acquisition, caching, and refresh handled by n8n
  - **Authentication Method**: All API requests now use `requestWithAuthentication` instead of manual token headers
  - **Community Standards**: Implementation follows n8n OAuth2 best practices from community guidelines
  - **Production Ready**: Tested with real Datto RMM API (Panoptic IT Solutions account)

  This change ensures reliable authentication, better security, and consistent user experience with other n8n OAuth2 nodes.

  **Migration**: Users will need to reconfigure their Datto RMM credentials using the new OAuth2 flow (API Key as Username, API Secret as Password).

## 0.4.0-alpha.5

### Patch Changes

- **🚨 CRITICAL FIX: OAuth2 JSON response parsing bug**
  - Fixed critical bug where valid OAuth2 tokens were incorrectly detected as missing
  - Added support for both string and object OAuth2 responses from n8n request helper
  - Added `json: true` flag to ensure proper JSON parsing in n8n production environments
  - Enhanced response type detection and automatic JSON parsing fallback
  - This resolves the "No access token received" error when valid tokens were actually returned
  - All OAuth2 functionality now works correctly in both local testing and production n8n

## 0.4.0-alpha.4

### Patch Changes

- **Enhanced OAuth2 error handling and diagnostics**
  - Added comprehensive error logging for OAuth2 token acquisition to help diagnose production issues
  - Enhanced credential validation with proper error messages for missing or invalid credentials
  - Added URL format validation with detailed guidance for API URL configuration
  - Implemented detailed OAuth2 response logging to identify specific authentication failures
  - Added specific error handling for common OAuth2 errors (invalid_grant, invalid_client, etc.)
  - Normalized API URL handling to remove trailing slashes and /api suffixes consistently
  - Added debug logging for OAuth2 token requests showing endpoint and credential info
  - All error messages now provide specific guidance for resolution

## 0.4.0-alpha.3

### Patch Changes

- **Fix OAuth2 URL parsing error in production**
  - Removed problematic `={{$self.apiUrl}}` expression from OAuth2 credentials that caused "Invalid URL" errors in production n8n
  - Implemented manual OAuth2 handling with proper Resource Owner Password Credentials flow
  - Simplified credentials to use direct `apiKey` and `apiSecret` fields instead of complex OAuth2 extension
  - Fixed URL construction issues in API requests using `baseURL` parameter
  - Enhanced local testing infrastructure to support new credential structure
  - All OAuth2 functionality now works correctly in both local testing and production environments

## 0.4.0-alpha.1

### Minor Changes

- 6c005bd: **Alpha Release: Major Infrastructure Overhaul**

  This alpha release completely refactors the Datto RMM node from a basic prototype to a production-ready implementation following proven n8n patterns:

  **🏗️ Infrastructure:**
  - Implemented switch-based routing architecture following Autotask node pattern
  - Added RESOURCE_DEFINITIONS structure for scalable resource management
  - Created comprehensive error handling with HTTP status code mapping
  - Built resource mapper system for dynamic field discovery

  **📦 Resources:**
  - Account operations with full CRUD support
  - Dynamic field loading and validation
  - Extensible base for additional resources

  **🧪 Testing:**
  - Complete Jest test suite for node, error handler, and resource mapper
  - Test infrastructure ready for execution
  - Type-safe error handling throughout

  **⚡ Features:**
  - ResourceMapper integration for dynamic field selection
  - loadOptions for dynamic dropdowns
  - Comprehensive parameter validation
  - Production-ready error boundaries

  This alpha provides a solid foundation for the remaining resource implementations (device, site, alert, etc.).

## 0.3.0

### Minor Changes

- f7bb046: add detailed readme and fix node configuration

## 0.2.1

### Patch Changes

- aa5b1f2: chore: Scope packages to @panoptic-it-solutions for publishing

## 0.2.0

### Minor Changes

- fa24640: - feat: Initial release of the n8n-nodes-datto-rmm package.
  - feat: Generated all API types from the official Datto RMM OpenAPI specification.
  - feat: Implemented correct OAuth2 authentication for credentials.
  - chore: Set up the repository for automated versioning and publishing.
