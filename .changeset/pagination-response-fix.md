---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

**Fix: Pagination and Response Parsing for Account Operations**

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