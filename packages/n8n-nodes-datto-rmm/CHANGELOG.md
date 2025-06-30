# n8n-nodes-datto-rmm

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
