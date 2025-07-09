# Dynamic Device Filtering Examples

This document provides examples of how to use the enhanced dynamic filtering system for the Datto RMM "Get All Devices" operation.

## Overview

The device filtering system now supports two approaches:

1. **Basic Filters** - Simple, single-field filtering (processed by Datto RMM API)
2. **Advanced Filters** - Complex, multi-field filtering with logical operators (processed locally)

## Basic Filters (API-Level)

These filters are sent to the Datto RMM API and are processed server-side:

- **Hostname Filter**: Filter by device hostname (partial matches)
- **Device Type Filter**: Filter by device type (partial matches)
- **Operating System Filter**: Filter by OS (partial matches)
- **Site Name Filter**: Filter by site name (partial matches)
- **Filter ID**: Apply a pre-configured Datto RMM filter

## Advanced Filters (Client-Side)

Advanced filters allow you to build complex filtering conditions that are applied after retrieving data from the API.

### Available Fields

- **Basic Device Info**: hostname, description, deviceType.category, deviceType.type
- **Network Info**: intIpAddress, extIpAddress, domain, lastLoggedInUser
- **Status Info**: online, suspended, deleted, rebootRequired, a64Bit, snmpEnabled
- **Software Info**: operatingSystem, cagVersion, displayVersion, softwareStatus
- **Security Info**: antivirus.antivirusProduct, antivirus.antivirusStatus
- **Patch Management**: patchManagement.patchStatus, patchManagement.patchesApprovedPending, etc.
- **Custom Fields**: udf.udf1 through udf.udf10

### Available Operators

- **Text Operators**: equals, contains, startsWith, endsWith, notEquals, notContains
- **Empty/Null Checks**: isEmpty, isNotEmpty
- **Numeric Operators**: greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual
- **Pattern Matching**: regex

### Filter Logic

- **AND**: All conditions must be true (default)
- **OR**: At least one condition must be true

## Example Filter Configurations

### Example 1: Find Online Windows Desktops
```json
{
  "useAdvancedFilters": true,
  "filterLogic": "AND",
  "filterConditions": {
    "condition": [
      {
        "field": "online",
        "operator": "equals",
        "booleanValue": true
      },
      {
        "field": "deviceType.category",
        "operator": "equals",
        "value": "Desktop"
      },
      {
        "field": "operatingSystem",
        "operator": "contains",
        "value": "Windows"
      }
    ]
  }
}
```

### Example 2: Find Devices Needing Patches or Reboots
```json
{
  "useAdvancedFilters": true,
  "filterLogic": "OR",
  "filterConditions": {
    "condition": [
      {
        "field": "rebootRequired",
        "operator": "equals",
        "booleanValue": true
      },
      {
        "field": "patchManagement.patchesApprovedPending",
        "operator": "greaterThan",
        "numericValue": 0
      }
    ]
  }
}
```

### Example 3: Find Devices with Specific UDF Content
```json
{
  "useAdvancedFilters": true,
  "filterLogic": "AND",
  "filterConditions": {
    "condition": [
      {
        "field": "udf.udf4",
        "operator": "contains",
        "value": "AEB: Online"
      },
      {
        "field": "udf.udf4",
        "operator": "notContains",
        "value": "Last completed: Never"
      }
    ]
  }
}
```

### Example 4: Find Devices by IP Range (Using Regex)
```json
{
  "useAdvancedFilters": true,
  "filterLogic": "AND",
  "filterConditions": {
    "condition": [
      {
        "field": "intIpAddress",
        "operator": "regex",
        "value": "^192\\.168\\.(10[1-9]|1[1-9][0-9])\\."
      }
    ]
  }
}
```

### Example 5: Complex Multi-Condition Filter
```json
{
  "useAdvancedFilters": true,
  "filterLogic": "AND",
  "filterConditions": {
    "condition": [
      {
        "field": "online",
        "operator": "equals",
        "booleanValue": true
      },
      {
        "field": "suspended",
        "operator": "equals",
        "booleanValue": false
      },
      {
        "field": "deleted",
        "operator": "equals",
        "booleanValue": false
      },
      {
        "field": "antivirus.antivirusStatus",
        "operator": "equals",
        "value": "RunningAndUpToDate"
      },
      {
        "field": "patchManagement.patchStatus",
        "operator": "notEquals",
        "value": "NotConfigured"
      }
    ]
  }
}
```

## Usage Tips

1. **Performance**: Basic filters are processed by the API and are more efficient for large datasets
2. **Flexibility**: Advanced filters offer more control but process data locally
3. **Combination**: You can use both basic and advanced filters together
4. **Field Types**: Remember to use the correct value type (string, numeric, boolean) for your operators
5. **Regex**: Use proper regex escaping in regex patterns (e.g., `\\.` for literal dots in IP addresses)

## Error Handling

- Invalid filter conditions are silently ignored
- Invalid regex patterns return no matches
- Type mismatches (e.g., using numeric operators on text fields) return no matches
- Empty or null field values are handled gracefully

## Migration from Basic Filtering

Existing workflows using basic filters will continue to work unchanged. Advanced filtering is an opt-in feature that enhances rather than replaces basic filtering. 