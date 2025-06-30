import { DattoRmmApi } from '../credentials/DattoRmmApi.credentials';
import axios from 'axios';
import * as readline from 'readline';

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

class N8nCredentialTester {
	private credentialClass: DattoRmmApi;
	private credentials: Record<string, any> = {};

	constructor() {
		this.credentialClass = new DattoRmmApi();
	}

	/**
	 * Analyze the credential class configuration
	 */
	analyzeCredentialClass(): void {
		colorLog(colors.cyan, '\n🔍 Analyzing DattoRmmApi Credential Class...');

		colorLog(colors.blue, `Name: ${this.credentialClass.name}`);
		colorLog(colors.blue, `Display Name: ${this.credentialClass.displayName}`);
		colorLog(colors.blue, `Extends: ${JSON.stringify(this.credentialClass.extends)}`);
		colorLog(colors.blue, `Documentation URL: ${this.credentialClass.documentationUrl}`);

		colorLog(colors.yellow, '\nProperties:');
		this.credentialClass.properties.forEach((prop, index) => {
			console.log(`  ${index + 1}. ${prop.displayName} (${prop.name})`);
			console.log(`     Type: ${prop.type}`);
			console.log(`     Default: ${prop.default}`);
			if (prop.description) console.log(`     Description: ${prop.description}`);
			if (prop.displayOptions)
				console.log(`     Display Options: ${JSON.stringify(prop.displayOptions)}`);
			console.log('');
		});

		if (this.credentialClass.test) {
			colorLog(colors.yellow, 'Test Configuration:');
			console.log(JSON.stringify(this.credentialClass.test, null, 2));
		}
	}

	/**
	 * Collect credential values from user
	 */
	async collectCredentials(): Promise<void> {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		const question = (prompt: string): Promise<string> => {
			return new Promise((resolve) => {
				rl.question(prompt, resolve);
			});
		};

		colorLog(colors.cyan, '\n📝 Collecting Credential Values...');

		// Go through each property and collect user input for visible fields
		for (const prop of this.credentialClass.properties) {
			if (prop.type === 'hidden') {
				// Use default value for hidden fields
				this.credentials[prop.name] = prop.default;
				colorLog(colors.yellow, `${prop.displayName}: ${prop.default} (hidden)`);
			} else {
				// Ask user for visible fields
				let defaultPrompt = prop.default ? ` [${prop.default}]` : '';
				if (prop.description) {
					colorLog(colors.blue, `${prop.description}`);
				}

				const value = await question(`${prop.displayName}${defaultPrompt}: `);
				this.credentials[prop.name] = value || prop.default || '';
			}
		}

		rl.close();

		colorLog(colors.green, '\n✅ Credentials collected!');
		colorLog(colors.yellow, 'Final credential object:');

		// Show credentials with sensitive data masked
		const maskedCreds = { ...this.credentials };
		if (maskedCreds.password) maskedCreds.password = '***MASKED***';
		if (maskedCreds.clientSecret) maskedCreds.clientSecret = '***MASKED***';
		console.log(JSON.stringify(maskedCreds, null, 2));
	}

	/**
	 * Emulate n8n's OAuth2 token acquisition
	 */
	async getOAuth2Token(): Promise<string> {
		colorLog(colors.cyan, '\n🔐 Emulating n8n OAuth2 Token Acquisition...');

		// Build token URL from credential
		const tokenUrl = this.credentials.accessTokenUrl.replace(
			'={{$credentials.apiUrl}}',
			this.credentials.apiUrl,
		);
		colorLog(colors.blue, `Token URL: ${tokenUrl}`);

		// Prepare Basic Auth header (client credentials)
		const clientAuth = Buffer.from(
			`${this.credentials.clientId}:${this.credentials.clientSecret}`,
		).toString('base64');

		// Prepare request body based on grant type
		const requestBody: Record<string, any> = {
			grant_type: this.credentials.grantType,
		};

		// Add username/password for password grant
		if (this.credentials.grantType === 'password') {
			requestBody.username = this.credentials.username;
			requestBody.password = this.credentials.password;
		}

		colorLog(colors.yellow, 'Request details:');
		console.log('Headers:');
		console.log(`  Authorization: Basic ${clientAuth.substring(0, 20)}...`);
		console.log(`  Content-Type: application/x-www-form-urlencoded`);
		console.log('Body:');
		const maskedBody = { ...requestBody };
		if (maskedBody.password) maskedBody.password = '***MASKED***';
		console.log(JSON.stringify(maskedBody, null, 2));

		try {
			const response = await axios.post(tokenUrl, requestBody, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${clientAuth}`,
				},
				transformRequest: [
					(data: any) => {
						return Object.keys(data)
							.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
							.join('&');
					},
				],
			});

			colorLog(colors.green, '✅ Token obtained successfully!');
			colorLog(colors.blue, 'Token response:');
			console.log(JSON.stringify(response.data, null, 2));

			const accessToken =
				response.data.access_token || response.data.accessToken || response.data.token;

			if (!accessToken) {
				throw new Error('No access token found in response');
			}

			return accessToken;
		} catch (error: any) {
			colorLog(colors.red, '❌ Failed to get access token');

			if (error.response) {
				colorLog(colors.red, `Status: ${error.response.status}`);
				colorLog(colors.red, `Response: ${JSON.stringify(error.response.data, null, 2)}`);
			} else {
				colorLog(colors.red, `Error: ${error.message}`);
			}

			throw error;
		}
	}

	/**
	 * Test the credential using n8n's test configuration
	 */
	async testCredential(accessToken: string): Promise<void> {
		colorLog(colors.cyan, '\n🧪 Testing Credential using n8n Test Configuration...');

		if (!this.credentialClass.test) {
			colorLog(colors.yellow, 'No test configuration defined in credential class');
			return;
		}

		// Build test URL
		const baseURL = this.credentialClass.test.request.baseURL!.replace(
			'={{$credentials.apiUrl}}',
			this.credentials.apiUrl,
		);
		const testUrl = `${baseURL}${this.credentialClass.test.request.url}`;

		colorLog(colors.blue, `Test URL: ${testUrl}`);

		try {
			const response = await axios.get(testUrl, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json',
				},
			});

			colorLog(colors.green, '✅ Credential test successful!');
			colorLog(colors.yellow, `Status: ${response.status}`);
			colorLog(colors.blue, 'Response preview:');

			const preview = JSON.stringify(response.data).substring(0, 300);
			console.log(`${preview}...`);
		} catch (error: any) {
			colorLog(colors.red, '❌ Credential test failed');

			if (error.response) {
				colorLog(colors.red, `Status: ${error.response.status}`);
				colorLog(colors.red, `Response: ${JSON.stringify(error.response.data, null, 2)}`);
			} else {
				colorLog(colors.red, `Error: ${error.message}`);
			}

			throw error;
		}
	}

	/**
	 * Run the complete test suite
	 */
	async runTests(): Promise<void> {
		try {
			// Step 1: Analyze the credential class
			this.analyzeCredentialClass();

			// Step 2: Collect credentials from user
			await this.collectCredentials();

			// Step 3: Get OAuth2 token
			const accessToken = await this.getOAuth2Token();

			// Step 4: Test the credential
			await this.testCredential(accessToken);

			colorLog(colors.green, '\n🎉 All tests passed!');
			colorLog(colors.yellow, 'Your DattoRmmApi credential configuration is working correctly!');
		} catch (error: any) {
			colorLog(colors.red, '\n💥 Test failed!');
			colorLog(colors.red, error.message);

			colorLog(colors.yellow, '\n💡 Debugging suggestions:');
			console.log('1. Verify your API Key and Secret are correct');
			console.log('2. Check that your API URL matches your Datto RMM platform');
			console.log('3. Ensure API access is enabled in your Datto RMM settings');
			console.log('4. Review the credential class configuration above');

			process.exit(1);
		}
	}
}

// Main execution
async function main() {
	colorLog(colors.bright, '🚀 n8n DattoRmmApi Credential Tester');
	colorLog(colors.yellow, 'This script tests your credential class exactly as n8n would use it\n');

	const tester = new N8nCredentialTester();
	await tester.runTests();
}

// Run the script
if (require.main === module) {
	main();
}

export { N8nCredentialTester };
