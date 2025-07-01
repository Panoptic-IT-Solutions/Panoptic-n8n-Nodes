#!/usr/bin/env ts-node

/**
 * Real integration test for device hostname filtering.
 * Tests the actual Datto RMM API directly without any mocking.
 */

import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

interface DattoCredentials {
	apiUrl: string;
	apiKey: string;
	apiSecret: string;
}

/**
 * Get OAuth2 access token for Datto RMM API
 */
async function getAccessToken(credentials: DattoCredentials): Promise<string> {
	const tokenUrl = `${credentials.apiUrl}/auth/oauth/token`;

	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(`public-client:public`).toString('base64')}`,
		},
		body: new URLSearchParams({
			grant_type: 'password',
			username: credentials.apiKey,
			password: credentials.apiSecret,
		}),
	});

	if (!response.ok) {
		throw new Error(`OAuth2 failed: ${response.status} ${response.statusText}`);
	}

	const tokenData = await response.json();
	return tokenData.access_token;
}

/**
 * Make authenticated API request to Datto RMM
 */
async function makeApiRequest(
	credentials: DattoCredentials,
	accessToken: string,
	endpoint: string,
	queryParams?: Record<string, any>,
): Promise<any> {
	let url = `${credentials.apiUrl}${endpoint}`;

	if (queryParams) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== undefined && value !== null && value !== '') {
				params.append(key, String(value));
			}
		}
		if (params.toString()) {
			url += `?${params.toString()}`;
		}
	}

	console.log(`🌐 Making GET request to: ${url}`);
	if (queryParams) {
		console.log('🔍 Query parameters:', JSON.stringify(queryParams, null, 2));
	}

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
	}

	return response.json();
}

/**
 * Test device search with hostname filtering
 */
async function testDeviceHostnameFilter(hostname: string) {
	console.log(`🧪 Testing device search with hostname filter: "${hostname}"`);

	const credentials: DattoCredentials = {
		apiUrl: process.env.DATTO_API_BASE_URL || 'https://pinotage-api.centrastage.net',
		apiKey: process.env.DATTO_API_KEY || '',
		apiSecret: process.env.DATTO_API_SECRET || '',
	};

	try {
		// Step 1: Get OAuth2 access token
		console.log('🔐 Getting OAuth2 access token...');
		const accessToken = await getAccessToken(credentials);
		console.log('✅ OAuth2 authentication successful');

		// Step 2: Test device search with hostname filter
		const queryParams = {
			hostname: hostname,
			page: 0, // Datto RMM uses 0-based pagination
			max: 20, // Get more results to better test filtering
		};

		const result = await makeApiRequest(
			credentials,
			accessToken,
			'/api/v2/account/devices',
			queryParams,
		);

		console.log('✅ API request successful!');
		console.log('📤 API Response:', JSON.stringify(result, null, 2));

		// Analyze the results
		if (result.devices && Array.isArray(result.devices)) {
			console.log(`\n🎉 Found ${result.devices.length} device(s):`);

			let matchCount = 0;
			let noMatchCount = 0;

			result.devices.forEach((device: any, index: number) => {
				console.log(`\n📱 Device ${index + 1}:`);
				console.log(`   ID: ${device.uid}`);
				console.log(`   Hostname: ${device.hostname}`);
				console.log(`   Site: ${device.siteName}`);
				console.log(`   Description: ${device.description || 'N/A'}`);
				console.log(`   Online: ${device.online ? '✅' : '❌'}`);

				// Check if hostname actually matches our filter
				if (device.hostname && device.hostname.toLowerCase().includes(hostname.toLowerCase())) {
					console.log(`   🎯 MATCH: Hostname contains "${hostname}"`);
					matchCount++;
				} else {
					console.log(
						`   ⚠️ NO MATCH: Hostname "${device.hostname}" does not contain "${hostname}"`,
					);
					noMatchCount++;
				}
			});

			// Summary
			console.log(`\n📊 Filtering Results Summary:`);
			console.log(`   🎯 Devices matching "${hostname}": ${matchCount}`);
			console.log(`   ⚠️ Devices NOT matching "${hostname}": ${noMatchCount}`);
			console.log(`   📈 Total devices returned: ${result.devices.length}`);

			if (result.pageDetails) {
				console.log(`   📄 Page details:`, result.pageDetails);
			}

			// Test conclusion
			if (noMatchCount === 0 && matchCount > 0) {
				console.log(
					`\n✅ FILTERING WORKS PERFECTLY! All returned devices match the hostname filter.`,
				);
			} else if (noMatchCount > 0) {
				console.log(
					`\n❌ FILTERING NOT WORKING! ${noMatchCount} devices don't match the hostname filter.`,
				);
				console.log(`   This suggests the API hostname parameter isn't working as expected.`);
			} else if (matchCount === 0) {
				console.log(`\n🤷 NO RESULTS: No devices found matching "${hostname}".`);
				console.log(`   This could mean the filter is working and there are truly no matches,`);
				console.log(`   or the hostname doesn't exist in your RMM system.`);
			}
		} else {
			console.log('\n⚠️ No devices array found in response');
			if (result.pageDetails) {
				console.log(`📊 Page details:`, result.pageDetails);
			}
		}

		return result;
	} catch (error: any) {
		console.error('\n❌ Test failed!');
		console.error('🔍 Error details:', error.message);
		throw error;
	}
}

/**
 * Main function
 */
async function main() {
	console.log('🚀 Datto RMM Device Hostname Filter - Real Integration Test\n');

	// Check credentials
	if (!process.env.DATTO_API_KEY || !process.env.DATTO_API_SECRET) {
		console.error('❌ Missing Datto RMM credentials in .env file:');
		console.error('   DATTO_API_KEY=your_api_key');
		console.error('   DATTO_API_SECRET=your_api_secret');
		console.error('   DATTO_API_BASE_URL=your_api_url (optional)');
		process.exit(1);
	}

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const hostname = await new Promise<string>((resolve) => {
		rl.question('Enter the hostname to search for: ', resolve);
	});

	rl.close();

	if (!hostname.trim()) {
		console.error('❌ Hostname cannot be empty.');
		process.exit(1);
	}

	await testDeviceHostnameFilter(hostname.trim());
}

// Run the test
main().catch((error) => {
	console.error('💥 Test failed:', error);
	process.exit(1);
});
