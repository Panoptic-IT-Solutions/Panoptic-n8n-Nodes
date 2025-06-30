---
'@panoptic-it-solutions/n8n-nodes-datto-rmm': patch
---

**OAuth2 Authentication & JSON Parsing Improvements (v0.4.0-alpha.6)**

- **Fixed OAuth2 Implementation**: Replaced manual OAuth2 with proper n8n OAuth2 extension using Resource Owner Password Credentials flow
- **Enhanced Authentication**: Configured proper OAuth2 endpoints with dynamic URL handling for token acquisition
- **JSON Response Parsing Fix**: Fixed critical bug where API responses were returned as escaped JSON strings instead of parsed objects
- **Improved Error Handling**: Added better OAuth2 error detection and response type handling
- **Production Testing**: Confirmed working OAuth2 flow with real Panoptic IT Solutions account data
- **Community Standards**: Aligned OAuth2 implementation with n8n community best practices

This release resolves authentication issues and ensures proper API response handling for production use.
