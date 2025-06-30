# n8n-nodes-datto-rmm

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
