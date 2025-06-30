# Local Testing Scripts

This directory contains scripts for testing the Datto RMM node locally without deploying to n8n.

## test-node-locally.ts

A comprehensive testing script that mimics how n8n uses the node, allowing you to test operations locally during development.

### Setup

1. **Configure Credentials**: Add your Datto RMM credentials to the `.env` file in the project root:
   ```bash
   # Datto RMM API Credentials
   DATTO_API_KEY=your-api-key-here
   DATTO_API_SECRET=your-api-secret-here
   
   # Optional: API Base URL (if different from default)
   DATTO_API_BASE_URL=https://your-instance.centrastage.net
   
   # Optional: Use real API or mock responses (defaults to true)
   TEST_USE_REAL_API=true
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
- **Secure Credentials**: Uses environment variables from .env file, keeps credentials out of code
- **Credential Safety**: Never commits credentials to version control

### Real vs Mock API Testing

The script now supports **real API calls** by default! Configure this behavior with environment variables:

#### Real API Mode (Default)
```bash
TEST_USE_REAL_API=true  # Default behavior
```
- Makes actual HTTP requests to Datto RMM API
- Uses your real credentials for authentication
- Perfect for integration testing and debugging

#### Mock API Mode
```bash
TEST_USE_REAL_API=false  # Set explicitly to use mocks
```
- Returns simulated responses
- Useful for testing node logic without API dependencies
- Faster for repeated testing

### Limitations

- **API Rate Limits**: Real API mode counts against your account limits
- **Limited n8n Context**: May not catch all production edge cases
- **No Workflow Integration**: Tests individual node, not full workflows

### Environment Variables

The script automatically loads credentials from your `.env` file using these variables:

- `DATTO_API_KEY` - Your Datto RMM API Key (required)
- `DATTO_API_SECRET` - Your Datto RMM API Secret (required)  
- `DATTO_API_BASE_URL` - Your Datto RMM instance URL (optional, defaults to pinotage-api.centrastage.net)
- `TEST_USE_REAL_API` - Whether to make real API calls (optional, defaults to true)

**Security Note**: The `.env` file should be in your `.gitignore` to prevent credentials from being committed to version control. 