# Developer Guide: Datto RMM n8n Node

## 🛠️ Technical Implementation Guide

This guide is for developers who want to understand, extend, or modify the Datto RMM n8n node implementation.

## 📁 Project Structure

```
packages/n8n-nodes-datto-rmm/
├── credentials/
│   └── DattoRmmApi.credentials.ts       # OAuth2 credential implementation
├── nodes/
│   └── DattoRmm/
│       ├── DattoRmm.node.ts            # Main node implementation
│       ├── helpers/                     # Utility functions
│       │   ├── errorHandler.ts         # Error handling wrapper
│       │   ├── oauth2.helper.ts        # API request helper
│       │   └── resourceMapper.ts       # Dynamic field mapping
│       ├── resources/                   # Resource implementations
│       │   ├── definitions.ts          # Resource definitions
│       │   ├── account/                 # Account resource
│       │   ├── device/                  # Device resource
│       │   └── site/                    # Site resource
│       └── types/                       # TypeScript definitions
│           ├── base/                    # Base types
│           └── [resource].types.ts      # Resource-specific types
└── package.json                         # Node package configuration
```

## 🏗️ Architecture Overview

### Node Structure
The Datto RMM node follows n8n's resource-operation pattern:
- **Resources**: Entities in Datto RMM (Account, Device, Site, etc.)
- **Operations**: Actions on resources (Get, Create, Update, etc.)

### Core Components

#### 1. Main Node (`DattoRmm.node.ts`)
```typescript
export class DattoRmm implements INodeType {
  description: INodeTypeDescription;
  
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    
    switch (resource) {
      case 'account': return executeAccountOperation.call(this);
      case 'device': return executeDeviceOperation.call(this);
      case 'site': return executeSiteOperation.call(this);
      // Add new resources here
    }
  }
}
```

#### 2. Resource Definitions (`resources/definitions.ts`)
```typescript
export const RESOURCE_DEFINITIONS = [
  {
    name: 'Account',
    value: 'account',
    description: 'Operations for account management'
  },
  // Add new resource definitions here
];
```

#### 3. Resource Implementation Pattern
Each resource has two files:
- `description.ts`: UI field definitions
- `execute.ts`: API operation implementations

## 🔧 Implementation Patterns

### Resource Description Pattern

```typescript
// resources/[resource]/description.ts
import type { INodeProperties } from 'n8n-workflow';

export const [resource]Fields: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['[resource]'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get [resource] by ID',
        action: 'Get [resource]',
      },
      // Add more operations
    ],
  },
  // Operation-specific parameters
  {
    displayName: '[Parameter Name]',
    name: '[parameterName]',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['[resource]'],
        operation: ['get'],
      },
    },
    default: '',
    description: '[Parameter description]',
  },
];
```

### Resource Execute Pattern

```typescript
// resources/[resource]/execute.ts
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { handleErrors } from '../../helpers/errorHandler';
import { dattoRmmApiRequest } from '../../helpers/oauth2.helper';

export async function execute[Resource]Operation(
  this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const operation = this.getNodeParameter('operation', 0) as string;
  const returnData: INodeExecutionData[] = [];

  return handleErrors(this, async () => {
    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        switch (operation) {
          case 'get':
            {
              const [resourceId] = this.getNodeParameter('[parameterName]', i) as string;
              responseData = await dattoRmmApiRequest.call(
                this,
                'GET',
                `/[api-endpoint]/${[resourceId]}`,
              );
            }
            break;

          // Add more operations

          default:
            throw new NodeOperationError(
              this.getNode(),
              `The operation "${operation}" is not supported!`,
            );
        }

        // Process and return data
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  });
}
```

## 🔌 Adding New Resources

### Step 1: Define Resource
Add to `resources/definitions.ts`:
```typescript
export const RESOURCE_DEFINITIONS = [
  // existing resources...
  {
    name: 'NewResource',
    value: 'newResource',
    description: 'Operations for new resource management'
  },
];
```

### Step 2: Create Resource Directory
```bash
mkdir packages/n8n-nodes-datto-rmm/nodes/DattoRmm/resources/newResource
```

### Step 3: Implement Description
Create `resources/newResource/description.ts` following the pattern above.

### Step 4: Implement Execute
Create `resources/newResource/execute.ts` following the pattern above.

### Step 5: Add Types (Optional)
Create `types/newResource.types.ts`:
```typescript
export interface NewResourceResponse {
  id: string;
  name: string;
  // Add fields based on API response
}

export interface NewResourceCreateRequest {
  name: string;
  // Add required fields for creation
}
```

### Step 6: Integrate into Main Node
Update `DattoRmm.node.ts`:

```typescript
// Add import
import { executeNewResourceOperation } from './resources/newResource/execute';
import { newResourceFields } from './resources/newResource/description';

// Add to properties
...addOperationsToResource(newResourceFields, { resourceName: 'newResource' }),

// Add to switch statement
case 'newResource':
  return executeNewResourceOperation.call(this);
```

## 🔧 Helper Functions

### API Request Helper
```typescript
// helpers/oauth2.helper.ts
export async function dattoRmmApiRequest(
  this: IExecuteFunctions | ICredentialTestFunctions,
  method: string,
  endpoint: string,
  body?: any,
  qs?: IDataObject,
): Promise<any> {
  // OAuth2 handling, request construction, error handling
}
```

### Error Handler
```typescript
// helpers/errorHandler.ts
export async function handleErrors<T>(
  context: IExecuteFunctions,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Enhanced error handling with context
    throw new NodeOperationError(context.getNode(), error.message);
  }
}
```

### Resource Mapper Helper
```typescript
// helpers/resourceMapper.ts
export function getResourceMappingFields(resource: string): INodeProperties {
  return {
    displayName: 'Fields to Return',
    name: 'fieldsToReturn',
    type: 'resourceMapper',
    // Dynamic field mapping configuration
  };
}
```

## 🎯 API Integration Patterns

### GET Requests
```typescript
const responseData = await dattoRmmApiRequest.call(
  this,
  'GET',
  `/account/sites/${siteUid}`,
  undefined,
  { page: 1, max: 100 }
);
```

### POST Requests
```typescript
const responseData = await dattoRmmApiRequest.call(
  this,
  'POST',
  '/account/sites',
  {
    name: siteName,
    description: siteDescription,
  }
);
```

### PUT/PATCH Requests
```typescript
const responseData = await dattoRmmApiRequest.call(
  this,
  'PUT',
  `/account/sites/${siteUid}`,
  updateData
);
```

### Pagination Handling
```typescript
const page = this.getNodeParameter('page', i, 1) as number;
const max = this.getNodeParameter('max', i, 100) as number;

const responseData = await dattoRmmApiRequest.call(
  this,
  'GET',
  endpoint,
  undefined,
  { page, max }
);
```

## 🧪 Testing Patterns

### Unit Test Structure
```typescript
// __tests__/[resource].test.ts
import { executeResourceOperation } from '../resources/resource/execute';

describe('Resource Operations', () => {
  let mockExecuteFunctions: IExecuteFunctions;

  beforeEach(() => {
    mockExecuteFunctions = {
      getInputData: jest.fn(),
      getNodeParameter: jest.fn(),
      helpers: {
        constructExecutionMetaData: jest.fn(),
        returnJsonArray: jest.fn(),
      },
    } as any;
  });

  it('should execute get operation successfully', async () => {
    // Test implementation
  });
});
```

### Integration Testing
```typescript
// scripts/test-node-locally.ts
import { DattoRmm } from '../nodes/DattoRmm/DattoRmm.node';

async function testNode() {
  const node = new DattoRmm();
  // Test with real credentials
}
```

## 🔒 Security Considerations

### Credential Handling
```typescript
// credentials/DattoRmmApi.credentials.ts
export class DattoRmmApi implements ICredentialType {
  name = 'dattoRmmApi';
  displayName = 'Datto RMM API';
  documentationUrl = 'https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm';
  
  properties: INodeProperties[] = [
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: '',
      required: true,
      description: 'The API URL for your Datto RMM instance',
    },
    // Never store sensitive data in plain text
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
    },
  ];
}
```

### Input Validation
```typescript
// Validate required parameters
const siteUid = this.getNodeParameter('siteUid', i) as string;
if (!siteUid || siteUid.trim() === '') {
  throw new NodeOperationError(
    this.getNode(),
    'Site UID is required and cannot be empty',
    { itemIndex: i }
  );
}

// Sanitize inputs
const cleanedMacAddress = macAddress.replace(/[:-]/g, '').toLowerCase();
```

## 📊 Performance Optimization

### Batch Processing
```typescript
// Process items in batches to avoid rate limits
const batchSize = 25;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  // Process batch
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit delay
}
```

### Resource Mapper Optimization
```typescript
// Only request needed fields
const fieldsToReturn = this.getNodeParameter('fieldsToReturn', i, {}) as IDataObject;
const selectedFields = Object.keys(fieldsToReturn).filter(key => fieldsToReturn[key]);

if (selectedFields.length > 0) {
  // Apply field selection to API request
  qs.fields = selectedFields.join(',');
}
```

### Caching Strategy
```typescript
// Cache frequently accessed data
const cacheKey = `datto-rmm-sites-${accountId}`;
let sites = await this.helpers.getCache(cacheKey);

if (!sites) {
  sites = await dattoRmmApiRequest.call(this, 'GET', '/account/sites');
  await this.helpers.setCache(cacheKey, sites, 300000); // 5 minutes
}
```

## 🚀 Deployment and Distribution

### Package Configuration
```json
// package.json
{
  "name": "n8n-nodes-datto-rmm",
  "version": "0.4.3",
  "main": "index.js",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/DattoRmmApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/DattoRmm/DattoRmm.node.js"
    ]
  }
}
```

### Build Process
```bash
# Build the project
npm run build

# Test locally
npm run test

# Publish to npm
npm publish
```

## 🐛 Common Issues and Solutions

### OAuth2 Token Refresh
```typescript
// Automatic token refresh is handled by n8n's OAuth2 implementation
// Ensure proper error handling for 401 responses
if (error.response?.status === 401) {
  // n8n will automatically attempt token refresh
  throw new NodeOperationError(
    this.getNode(),
    'Authentication failed. Please check your credentials.',
  );
}
```

### Rate Limiting
```typescript
// Handle 429 responses
if (error.response?.status === 429) {
  const retryAfter = error.response.headers['retry-after'] || 60;
  throw new NodeOperationError(
    this.getNode(),
    `Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
  );
}
```

### Memory Management
```typescript
// For large datasets, use streaming or pagination
const pageSize = 100;
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await dattoRmmApiRequest.call(
    this,
    'GET',
    endpoint,
    undefined,
    { page, max: pageSize }
  );
  
  // Process page
  returnData.push(...response.results);
  
  hasMore = response.results.length === pageSize;
  page++;
}
```

## 📚 Further Reading

- [n8n Node Development Documentation](https://docs.n8n.io/integrations/creating-nodes/)
- [Datto RMM API Documentation](https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm)
- [OAuth2 Implementation Guide](https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/)
- [TypeScript Best Practices](https://typescript-eslint.io/docs/)

## 🤝 Contributing Guidelines

1. **Follow existing patterns** when adding new resources
2. **Add comprehensive tests** for new functionality
3. **Update documentation** for any changes
4. **Use TypeScript strictly** - no `any` types without justification
5. **Handle errors gracefully** with proper user messages
6. **Optimize for performance** - consider rate limits and memory usage
7. **Maintain backward compatibility** when possible 