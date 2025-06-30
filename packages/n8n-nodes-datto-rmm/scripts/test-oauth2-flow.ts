import axios from 'axios';
import * as readline from 'readline';

// Interface matching our credential structure
interface DattoRmmCredentials {
	apiUrl: string;
	username: string; // API Key
	password: string; // API Secret Key
}

// OAuth2 configuration - hardcoded to match working Python implementation

// ANSI color codes for better output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
};

function colorLog(color: string, message: string) {
	console.log(`${color}${message}${colors.reset}`);
}

class DattoRmmOAuth2Emulator {
	private credentials: DattoRmmCredentials;
	private accessToken: string | null = null;
	private tokenExpiresAt: Date | null = null;

	constructor(credentials: DattoRmmCredentials) {
		this.credentials = credentials;
	}

	/**
	 * Step 1: Get OAuth2 token (emulates n8n's automatic token handling)
	 * Following official Datto RMM API documentation format
	 */
	async getAccessToken(): Promise<string> {
		colorLog(colors.cyan, '\n🔐 Step 1: Getting OAuth2 Access Token...');

		const tokenUrl = `${this.credentials.apiUrl}/auth/oauth/token`;
		colorLog(colors.blue, `Token URL: ${tokenUrl}`);

		// Use public-client:public as Basic Auth credentials (matching Python implementation)
		const clientCredentials = Buffer.from('public-client:public').toString('base64');

		const tokenData = {
			grant_type: 'password',
			username: this.credentials.username, // API Key
			password: this.credentials.password, // API Secret Key
		};

		colorLog(colors.yellow, 'Request payload:');
		console.log({
			...tokenData,
			username: '***API_KEY***',
			password: '***API_SECRET***',
		});
		colorLog(colors.yellow, 'Using Basic Auth: public-client:public, API Key/Secret in body');

		try {
			const response = await axios.post(tokenUrl, tokenData, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${clientCredentials}`,
				},
				transformRequest: [
					(data: any) => {
						// Convert object to URL-encoded string
						return Object.keys(data)
							.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
							.join('&');
					},
				],
			});

			// Log the actual response to see the structure
			colorLog(colors.blue, 'Token response structure:');
			console.log(JSON.stringify(response.data, null, 2));

			this.accessToken =
				response.data.access_token || response.data.accessToken || response.data.token;

			// Calculate expiration (Datto RMM tokens expire after 100 hours)
			const expiresIn = response.data.expires_in || response.data.expiresIn || 360000; // 100 hours in seconds
			this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

			if (this.accessToken) {
				colorLog(colors.green, '✅ Token obtained successfully!');
				colorLog(colors.yellow, `Token expires at: ${this.tokenExpiresAt!.toISOString()}`);
				colorLog(colors.yellow, `Access token: ${this.accessToken.substring(0, 20)}...`);
				return this.accessToken;
			} else {
				colorLog(colors.red, '❌ No access token found in response');
				throw new Error('No access token found in response');
			}
		} catch (error: any) {
			colorLog(colors.red, '❌ Failed to get access token');

			if (error.response) {
				colorLog(colors.red, `Status: ${error.response.status}`);
				colorLog(colors.red, `Response: ${JSON.stringify(error.response.data, null, 2)}`);

				// Additional debugging info
				if (error.response.status === 401) {
					colorLog(colors.yellow, '💡 401 Unauthorized - Check your API credentials');
					colorLog(colors.yellow, '   Make sure API access is enabled in Datto RMM settings');
					colorLog(colors.yellow, '   Verify API Key and Secret Key are correct');
					colorLog(colors.yellow, '   Check that your API URL matches your Datto RMM platform');
				}
			} else {
				colorLog(colors.red, `Error: ${error.message}`);
			}

			throw error;
		}
	}

	/**
	 * Step 2: Make authenticated API request (emulates n8n's authenticated requests)
	 */
	async makeAuthenticatedRequest(endpoint: string = '/api/v2/account'): Promise<any> {
		colorLog(colors.cyan, '\n🌐 Step 2: Making Authenticated API Request...');

		if (!this.accessToken) {
			await this.getAccessToken();
		}

		const apiUrl = `${this.credentials.apiUrl}${endpoint}`;
		colorLog(colors.blue, `API URL: ${apiUrl}`);

		try {
			const response = await axios.get(apiUrl, {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					Accept: 'application/json',
				},
			});

			colorLog(colors.green, '✅ API request successful!');
			colorLog(colors.yellow, `Status: ${response.status}`);

			return response.data;
		} catch (error: any) {
			colorLog(colors.red, '❌ API request failed');

			if (error.response) {
				colorLog(colors.red, `Status: ${error.response.status}`);
				colorLog(colors.red, `Response: ${JSON.stringify(error.response.data, null, 2)}`);

				// If token expired or invalid, try to refresh
				if (error.response.status === 401) {
					colorLog(colors.yellow, '🔄 Token may be expired, attempting to refresh...');
					this.accessToken = null;
					return await this.makeAuthenticatedRequest(endpoint);
				}
			} else {
				colorLog(colors.red, `Error: ${error.message}`);
			}

			throw error;
		}
	}

	/**
	 * Test multiple endpoints (emulates various n8n node operations)
	 */
	async testMultipleEndpoints(): Promise<void> {
		const testEndpoints = ['/api/v2/account', '/api/v2/account/sites', '/api/v2/account/users'];

		for (const endpoint of testEndpoints) {
			try {
				colorLog(colors.magenta, `\n📡 Testing endpoint: ${endpoint}`);
				const result = await this.makeAuthenticatedRequest(endpoint);

				if (Array.isArray(result)) {
					colorLog(colors.green, `✅ Success! Returned ${result.length} items`);
				} else if (typeof result === 'object') {
					colorLog(
						colors.green,
						`✅ Success! Returned object with keys: ${Object.keys(result).join(', ')}`,
					);
				} else {
					colorLog(colors.green, '✅ Success! Response received');
				}

				// Show first few characters of response for verification
				const preview = JSON.stringify(result).substring(0, 200);
				colorLog(colors.blue, `Response preview: ${preview}...`);
			} catch {
				colorLog(colors.red, `❌ Failed for endpoint: ${endpoint}`);
			}
		}
	}
}

// Interactive credential input
async function getCredentialsFromUser(): Promise<DattoRmmCredentials> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const question = (prompt: string): Promise<string> => {
		return new Promise((resolve) => {
			rl.question(prompt, resolve);
		});
	};

	colorLog(colors.bright, '🚀 Datto RMM OAuth2 Flow Emulator');
	colorLog(colors.yellow, 'This script emulates exactly how n8n handles your OAuth2 credentials\n');

	// API URL selection
	colorLog(colors.cyan, 'Available Datto RMM Platforms:');
	const platforms = [
		'https://pinotage-api.centrastage.net',
		'https://merlot-api.centrastage.net',
		'https://concord-api.centrastage.net',
		'https://vidal-api.centrastage.net',
		'https://zinfandel-api.centrastage.net',
		'https://syrah-api.centrastage.net',
	];

	platforms.forEach((platform, index) => {
		colorLog(colors.blue, `${index + 1}. ${platform}`);
	});

	const platformChoice = await question('\nSelect platform (1-6) or enter custom URL: ');
	let apiUrl: string;

	if (platformChoice.startsWith('http')) {
		apiUrl = platformChoice;
	} else {
		const choice = parseInt(platformChoice) - 1;
		apiUrl = platforms[choice] || platforms[0];
	}

	const username = await question('\nEnter your Datto RMM API Key: ');
	const password = await question('Enter your Datto RMM API Secret Key: ');

	rl.close();

	return { apiUrl, username, password };
}

// Main execution
async function main() {
	try {
		const credentials = await getCredentialsFromUser();

		colorLog(colors.green, '\n✅ Credentials collected!');
		colorLog(colors.blue, `API URL: ${credentials.apiUrl}`);
		colorLog(colors.blue, `API Key: ${credentials.username.substring(0, 8)}...`);

		const emulator = new DattoRmmOAuth2Emulator(credentials);

		// Test the OAuth2 flow
		await emulator.testMultipleEndpoints();

		colorLog(colors.green, '\n🎉 OAuth2 flow test completed!');
		colorLog(
			colors.yellow,
			'This demonstrates exactly how n8n will handle your Datto RMM credentials.',
		);
	} catch (error: any) {
		colorLog(colors.red, '\n💥 Test failed!');
		colorLog(colors.red, error.message);

		if (error.code === 'ECONNREFUSED') {
			colorLog(colors.yellow, '💡 This might be a network connectivity issue.');
		} else if (error.response?.status === 401) {
			colorLog(colors.yellow, '💡 Check your API Key and Secret Key are correct.');
		} else if (error.response?.status === 404) {
			colorLog(colors.yellow, '💡 Check your API URL is correct for your Datto RMM platform.');
		}

		process.exit(1);
	}
}

// Run the script
if (require.main === module) {
	main();
}

export { DattoRmmOAuth2Emulator };
