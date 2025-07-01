---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

CRITICAL: Fix pagination indexing across all account operations

- Fixed pagination to use 1-based indexing (page=1) instead of 0-based (page=0) for all account operations to match API requirements
- Resolves issue where operations would return empty results despite totalCount > 0
- Ensures consistency with site operations that were already working correctly
- Affects getDevices, getSites, getUsers, getVariables, and all other account operations 