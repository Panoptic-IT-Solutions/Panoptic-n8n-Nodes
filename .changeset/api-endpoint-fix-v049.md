---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

**Bug Fixes: API Endpoint 404 Errors Resolved**

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