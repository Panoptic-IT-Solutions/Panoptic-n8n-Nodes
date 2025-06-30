# Testing Scripts

This directory contains scripts for testing the Datto RMM n8n node functionality.

## OAuth2 Flow Test

The `test-oauth2-flow.ts` script emulates exactly how n8n handles OAuth2 authentication with Datto RMM.

### Prerequisites

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Get your Datto RMM credentials**:
   - Log into your Datto RMM account
   - Navigate to **Setup > Global Settings > Access Control**
   - Enable **API Access**
   - Go to **Setup > Users** > select your user
   - Click **Generate API Keys**
   - Note down your **API Key** and **API Secret Key**
   - Note your **API URL** (platform-specific)

### Running the Test

```bash
pnpm run test:oauth2
```

### What the Script Does

The script emulates n8n's OAuth2 flow by:

1. **🔐 Getting OAuth2 Token**:
   - Sends POST request to `/auth/oauth/token`
   - Uses password grant type with your API credentials
   - Receives and stores the access token

2. **🌐 Making Authenticated Requests**:
   - Uses the token to make API calls
   - Tests multiple endpoints like `/api/v2/account`, `/api/v2/account/sites`
   - Demonstrates automatic token refresh on 401 errors

3. **📊 Validation**:
   - Verifies the OAuth2 flow works correctly
   - Shows exactly what n8n will do with your credentials
   - Provides detailed logging of requests and responses

### Platform URLs

The script supports all Datto RMM platforms:

| Platform | URL |
|----------|-----|
| Pinotage | `https://pinotage-api.centrastage.net` |
| Merlot | `https://merlot-api.centrastage.net` |
| Concord | `https://concord-api.centrastage.net` |
| Vidal | `https://vidal-api.centrastage.net` |
| Zinfandel | `https://zinfandel-api.centrastage.net` |
| Syrah | `https://syrah-api.centrastage.net` |

### Expected Output

When successful, you'll see:
- ✅ Token obtained successfully
- ✅ API requests working
- 📊 Response data from your Datto RMM account

### Troubleshooting

**401 Unauthorized**: Check your API Key and Secret Key are correct

**404 Not Found**: Verify your API URL matches your Datto RMM platform

**Connection Refused**: Check network connectivity to Datto RMM

### Security Notes

- Your credentials are only used locally for testing
- API keys are masked in console output
- No credentials are stored or transmitted outside the test

---

## Other Scripts

- `test-node-locally.ts` - Tests the n8n node implementation locally
- `gen:types` - Generates TypeScript types from OpenAPI spec 