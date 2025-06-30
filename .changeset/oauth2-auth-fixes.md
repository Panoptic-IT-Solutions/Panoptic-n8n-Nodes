---
'@panoptic-it-solutions/n8n-nodes-datto-rmm': patch
---

Fix OAuth2 authentication implementation to match Datto RMM API requirements

- Updated credential configuration to use password grant type with public-client:public
- Fixed token request to send API Key/Secret as username/password in request body
- Added comprehensive OAuth2 test script that emulates n8n's authentication flow
- Verified authentication works with actual Datto RMM API endpoints
- Updated documentation and test scripts for proper OAuth2 flow testing 