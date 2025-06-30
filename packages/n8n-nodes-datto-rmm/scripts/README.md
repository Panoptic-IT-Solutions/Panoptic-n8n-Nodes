# Local Testing Scripts

This directory contains scripts for testing the Datto RMM node locally without deploying to n8n.

## test-node-locally.ts

A comprehensive testing script that mimics how n8n uses the node, allowing you to test operations locally during development.

### Setup

1. **Configure Credentials**: Edit the `MOCK_CREDENTIALS` object in `test-node-locally.ts`:
   ```typescript
   const MOCK_CREDENTIALS = {
     apiUrl: 'https://your-datto-instance.centrastage.net', // Your Datto RMM API URL
     username: 'your-api-key-here',                         // Your API Key
     password: 'your-secret-key-here',                     // Your Secret Key
     // ... other credentials
   };
   ```

2. **Install Dependencies**: Ensure all dependencies are installed:
   ```bash
   pnpm install
   ```

### Running Tests

#### Option 1: Using npm script (recommended)
```bash
cd packages/n8n-nodes-datto-rmm
pnpm test:local
```

#### Option 2: Direct execution
```bash
cd packages/n8n-nodes-datto-rmm
npx ts-node scripts/test-node-locally.ts
```

### What It Tests

The script automatically tests:

1. **Node Operations**:
   - Account Get Information
   - Account Get Variables
   - (Add more scenarios as operations are implemented)

2. **Methods Section**:
   - Resource Mapping functionality
   - Load Options for resources
   - Load Options for select columns

3. **Error Handling**:
   - Network errors
   - Authentication failures
   - URL parsing issues

### Output

The script provides detailed console output showing:
- 🌐 HTTP requests being made
- 📋 Headers and body content
- 🔐 OAuth token acquisition
- ✅ Successful operations
- ❌ Error details with stack traces

### Adding New Test Scenarios

To test additional operations, add them to the `TEST_SCENARIOS` object:

```typescript
const TEST_SCENARIOS = {
  // Existing scenarios...
  
  deviceList: {
    name: 'List Devices',
    parameters: {
      resource: 'device',
      operation: 'getMany',
      // Add additional parameters as needed
    },
  },
};
```

### Debugging

The script includes comprehensive logging to help debug issues:
- Request/response details
- Authentication flow
- Error messages and stack traces
- Mock data simulation

### Benefits

- **Fast Development**: Test changes without deploying to n8n
- **Comprehensive Testing**: Test all node aspects including methods section
- **Easy Debugging**: Detailed logging and error reporting
- **Credential Safety**: Uses local mock credentials, never exposes real credentials

### Limitations

- **Mock Data**: Returns simulated responses for API calls
- **Network Simulation**: Doesn't make actual HTTP requests (by default)
- **Limited Validation**: May not catch all production edge cases

For real API testing, you can modify the `helpers.request` mock to make actual HTTP calls by removing the mock logic and letting it pass through to the real API. 