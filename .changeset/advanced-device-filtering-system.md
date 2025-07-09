---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": minor
---

Advanced Device Filtering System for Account Operations

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