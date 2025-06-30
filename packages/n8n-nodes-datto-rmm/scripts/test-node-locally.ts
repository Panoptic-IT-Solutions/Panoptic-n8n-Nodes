#!/usr/bin/env ts-node

/**
 * Local testing script for Datto RMM node
 * Mimics how n8n uses the node for local development and testing
 */

import * as dotenv from 'dotenv';
import { DattoRmm } from '../nodes/DattoRmm/DattoRmm.node';
import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeParameters,
	ICredentialDataDecryptedObject,
	INode,
	IWorkflowExecuteAdditionalData,
	IRunExecutionData,
} from 'n8n-workflow';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' }); // Load from project root .env file

// Configuration
const USE_REAL_API = process.env.TEST_USE_REAL_API !== 'false'; // Default to true, set to 'false' to use mocks

// Credentials - loaded from environment variables (now with OAuth2 structure)
const CREDENTIALS: ICredentialDataDecryptedObject = {
	apiUrl: process.env.DATTO_API_BASE_URL || 'https://pinotage-api.centrastage.net',
	username: process.env.DATTO_API_KEY || '', // API Key goes in username for OAuth2 password flow
	password: process.env.DATTO_API_SECRET || '', // API Secret goes in password for OAuth2 password flow
	grantType: 'password',
	clientId: 'public-client',
	clientSecret: 'public',
	// Mock OAuth2 token data (simulates what n8n would store after OAuth2 flow)
	oauthTokenData: {
		access_token: '',
		token_type: 'Bearer',
		expires_in: 360000,
		acquired_at: 0,
	},
};

// Mock node definition
const MOCK_NODE: INode = {
	id: 'test-node-id',
	name: 'Datto RMM Test',
	type: 'dattoRmm',
	typeVersion: 1,
	position: [0, 0],
	parameters: {},
};

/**
 * Create a mock IExecuteFunctions context
 */
function createMockExecuteFunctions(
	nodeParameters: INodeParameters,
	inputData: INodeExecutionData[] = [{ json: {} }],
): IExecuteFunctions {
	const mockContext: IExecuteFunctions = {
		getInputData: () => inputData,
		getNodeParameter: (parameterName: string, _itemIndex: number) => {
			return nodeParameters[parameterName];
		},
		getNode: () => MOCK_NODE,
		getCredentials: async (_type: string) => {
			return CREDENTIALS;
		},
		continueOnFail: () => false,
		helpers: {
			returnJsonArray: (jsonData: any[]) =>
				jsonData.map((data, index) => ({
					json: data,
					pairedItem: { item: index },
				})),
			request: async (options: any) => {
				const { method, url, headers, body } = options;

				console.log(`\n🌐 Making ${method} request to: ${CREDENTIALS.apiUrl}${url}`);
				console.log('📋 Headers:', JSON.stringify(headers || {}, null, 2));
				if (body) {
					console.log('📦 Body:', typeof body === 'string' ? body : JSON.stringify(body, null, 2));
				}

				if (USE_REAL_API) {
					// Make real HTTP requests using fetch
					try {
						const fullUrl = url.startsWith('http') ? url : `${CREDENTIALS.apiUrl}${url}`;

						const response = await fetch(fullUrl, {
							method: method,
							headers: headers || {},
							body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
						});

						console.log(`✅ Response ${response.status}: ${response.statusText}`);

						const contentType = response.headers.get('content-type');
						if (contentType && contentType.includes('application/json')) {
							const result = await response.json();
							console.log('📦 Response body:', JSON.stringify(result, null, 2));
							return result;
						} else {
							const text = await response.text();
							console.log('📦 Response body (text):', text.substring(0, 200));
							return text;
						}
					} catch (error) {
						console.error('❌ Request error:', error);
						throw error;
					}
				} else {
					// Mock responses (fallback)
					console.log('🎭 Using mock response');

					if (url?.includes('/auth/oauth/token')) {
						console.log('🔐 OAuth token request detected');
						const mockToken = 'mock-access-token-' + Date.now();
						return {
							access_token: mockToken,
							token_type: 'Bearer',
							expires_in: 360000,
						};
					}

					if (url?.includes('/api/v2/account')) {
						if (url.includes('/variables')) {
							return {
								uid: 'mock-account-uid',
								variables: [
									{ name: 'COMPANY_NAME', value: 'Mock Company' },
									{ name: 'TIMEZONE', value: 'UTC' },
									{ name: 'API_VERSION', value: 'v2' },
								],
							};
						} else {
							return {
								uid: 'mock-account-uid',
								name: 'Mock Datto RMM Account',
								companyName: 'Mock Company Inc.',
								timezone: 'UTC',
								dateCreated: new Date().toISOString(),
								apiVersion: 'v2',
								features: ['monitoring', 'automation', 'patching'],
							};
						}
					}

					throw new Error(`Mock request handler not implemented for: ${method} ${url}`);
				}
			},
			requestWithAuthentication: async (credentialsType: string, options: any) => {
				// Simulate n8n's OAuth2 authentication system
				console.log(`\n🔑 Authenticated request for credentials: ${credentialsType}`);
				console.log(
					'⚙️ Request details:',
					JSON.stringify(
						{
							method: options.method,
							url: options.url,
							hasBody: !!options.body,
						},
						null,
						2,
					),
				);

				// Check if we need to acquire/refresh OAuth2 token
				const oauthData = CREDENTIALS.oauthTokenData as any;
				if (
					!oauthData?.access_token ||
					oauthData.acquired_at + oauthData.expires_in * 1000 < Date.now()
				) {
					console.log('🔄 Acquiring new OAuth2 token via Datto RMM API...');

					try {
						const baseUrl = (CREDENTIALS.apiUrl as string)
							.replace(/\/+$/, '')
							.replace(/\/api\/?$/, '');
						const tokenResponse = await mockContext.helpers.request({
							method: 'POST',
							url: `${baseUrl}/auth/oauth/token`,
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
								Authorization: `Basic ${Buffer.from(`${CREDENTIALS.clientId}:${CREDENTIALS.clientSecret}`).toString('base64')}`,
							},
							body: `grant_type=${CREDENTIALS.grantType}&username=${CREDENTIALS.username}&password=${CREDENTIALS.password}`,
							json: true,
						});

						// Parse response if it's a string (handle the bug we found earlier)
						let parsedResponse = tokenResponse;
						if (typeof tokenResponse === 'string') {
							console.log('📋 Response is string, parsing JSON...');
							parsedResponse = JSON.parse(tokenResponse);
						}

						if (parsedResponse.access_token) {
							// Update credentials with new token data
							(CREDENTIALS.oauthTokenData as any) = {
								access_token: parsedResponse.access_token,
								token_type: parsedResponse.token_type || 'Bearer',
								expires_in: parsedResponse.expires_in || 360000,
								acquired_at: Date.now(),
							};
							console.log(
								`✅ OAuth2 token acquired successfully (expires in ${Math.round(parsedResponse.expires_in / 60 / 60)} hours)`,
							);
						} else {
							throw new Error('No access_token received from OAuth2 response');
						}
					} catch (error) {
						console.error('❌ OAuth2 token acquisition failed:', error);
						throw new Error(`OAuth2 authentication failed: ${error.message}`);
					}
				} else {
					console.log('📝 Using cached OAuth2 token');
				}

				// Make the actual API request with the Bearer token
				const updatedOauthData = CREDENTIALS.oauthTokenData as any;
				return mockContext.helpers.request({
					...options,
					headers: {
						...options.headers,
						Authorization: `${updatedOauthData.token_type} ${updatedOauthData.access_token}`,
					},
				});
			},
		},
		// Add other required methods with basic implementations
		getWorkflowDataProxy: () => ({}) as any,
		getContext: () => ({}),
		getExecuteData: () => ({}) as IRunExecutionData,
		getWorkflowStaticData: () => ({}),
		getRestApiUrl: () => 'http://localhost:5678/rest',
		getInstanceId: () => 'test-instance',
		getAdditionalData: () => ({}) as IWorkflowExecuteAdditionalData,
		executeWorkflow: async () => ({}),
		sendMessageToUI: () => {},
		sendResponse: () => {},
		getInputConnectionData: () => Promise.resolve({}),
		logAiEvent: () => {},
		addInputData: () => {},
		addOutputData: () => {},
		// Add minimal missing properties to satisfy interface
		logger: console,
		getCredentialsProperties: () => ({}),
		getExecutionId: () => 'test-execution-id',
		getWorkflow: () => ({}) as any,
		evaluateExpression: () => '',
		getKnownCredentialsProperties: () => ({}),
		getParentCallbackManager: () => undefined,
		getInputSourceData: () => ({}) as any,
		onCallback: () => '',
		getChildCallbackManager: () => ({}) as any,
	} as unknown as IExecuteFunctions;

	return mockContext;
}

/**
 * Create a mock ILoadOptionsFunctions context
 */
function createMockLoadOptionsFunctions(nodeParameters: INodeParameters): ILoadOptionsFunctions {
	return {
		getNodeParameter: (parameterName: string) => nodeParameters[parameterName],
		getNode: () => MOCK_NODE,
		getCredentials: async (_type: string) => CREDENTIALS,
		helpers: {
			request: async (options: any) => {
				console.log(`\n🔍 Load options request: ${options.method} ${options.url}`);
				// Return mock data for load options
				return { mockData: 'for load options' };
			},
		},
		getCurrentNodeParameter: () => undefined,
		getCurrentNodeParameters: () => ({}),
		getAdditionalData: () => ({}) as IWorkflowExecuteAdditionalData,
		getTimezone: () => 'UTC',
		getRestApiUrl: () => 'http://localhost:5678/rest',
		getInstanceId: () => 'test-instance',
		// Add minimal missing properties to satisfy interface
		logger: console,
		getCredentialsProperties: () => ({}),
		getExecutionId: () => 'test-execution-id',
		getWorkflow: () => ({}) as any,
		evaluateExpression: () => '',
		getKnownCredentialsProperties: () => ({}),
		getParentCallbackManager: () => undefined,
		getInputSourceData: () => ({}) as any,
		onCallback: () => '',
		getChildCallbackManager: () => ({}) as any,
	} as unknown as ILoadOptionsFunctions;
}

/**
 * Test scenarios
 */
const TEST_SCENARIOS = {
	accountGet: {
		name: 'Get Account Information',
		parameters: {
			resource: 'account',
			operation: 'get',
		},
	},
	accountVariables: {
		name: 'Get Account Variables',
		parameters: {
			resource: 'account',
			operation: 'getVariables',
		},
	},
	// Add more scenarios as needed
};

/**
 * Main testing function
 */
async function testNode() {
	console.log('🚀 Starting Datto RMM Node Local Testing\n');
	console.log(`📋 Using ${USE_REAL_API ? 'real' : 'mock'} API with credentials:`);
	console.log(`   API URL: ${CREDENTIALS.apiUrl}`);
	console.log(`   API Key: ${(CREDENTIALS.username as string).substring(0, 8)}...`);
	console.log(`   Secret: ${(CREDENTIALS.password as string).substring(0, 8)}...\n`);

	// Create node instance
	const node = new DattoRmm();

	console.log('✅ Node instance created successfully');
	console.log('📝 Node description:', node.description.displayName);
	console.log('🔧 Node version:', node.description.version);

	// Test each scenario
	for (const [scenarioKey, scenario] of Object.entries(TEST_SCENARIOS)) {
		console.log(`\n${'='.repeat(60)}`);
		console.log(`🧪 Testing: ${scenario.name}`);
		console.log(`📊 Scenario: ${scenarioKey}`);
		console.log(`${'='.repeat(60)}`);

		try {
			// Create mock context
			const mockContext = createMockExecuteFunctions(scenario.parameters);

			// Execute the node
			console.log('⚡ Executing node...');
			const result = await node.execute.call(mockContext);

			console.log('✅ Execution successful!');
			console.log('📤 Result:', JSON.stringify(result, null, 2));
		} catch (error) {
			console.error('❌ Execution failed!');
			console.error('🔍 Error details:', error);

			if (error.stack) {
				console.error('📚 Stack trace:', error.stack);
			}
		}
	}

	// Test methods section
	console.log(`\n${'='.repeat(60)}`);
	console.log('🔬 Testing Methods Section');
	console.log(`${'='.repeat(60)}`);

	try {
		const mockLoadContext = createMockLoadOptionsFunctions({ resource: 'account' });

		// Test resource mapping
		if (node.methods?.resourceMapping?.getFields) {
			console.log('🗺️ Testing Resource Mapping...');
			const fields = await node.methods.resourceMapping.getFields.call(mockLoadContext);
			console.log('✅ Resource mapping successful!');
			console.log('📋 Fields:', JSON.stringify(fields, null, 2));
		}

		// Test load options
		if (node.methods?.loadOptions?.getResources) {
			console.log('\n📂 Testing Load Options - Resources...');
			const resources = await node.methods.loadOptions.getResources.call(mockLoadContext);
			console.log('✅ Load options successful!');
			console.log('📋 Resources:', JSON.stringify(resources, null, 2));
		}

		if (node.methods?.loadOptions?.getSelectColumns) {
			console.log('\n📋 Testing Load Options - Select Columns...');
			const columns = await node.methods.loadOptions.getSelectColumns.call(mockLoadContext);
			console.log('✅ Select columns successful!');
			console.log('📋 Columns:', JSON.stringify(columns, null, 2));
		}
	} catch (error) {
		console.error('❌ Methods testing failed!');
		console.error('🔍 Error details:', error);
	}

	console.log(`\n${'='.repeat(60)}`);
	console.log('🎉 Testing completed!');
	console.log(`${'='.repeat(60)}`);
}

// Run the tests if this file is executed directly
if (require.main === module) {
	// Check if credentials are configured in environment variables
	if (!process.env.DATTO_API_KEY || !process.env.DATTO_API_SECRET) {
		console.error('❌ Please configure your Datto RMM credentials in the .env file');
		console.error('📝 Add the following to your .env file in the project root:');
		console.error('');
		console.error('   # Datto RMM API Credentials');
		console.error('   DATTO_API_KEY=your-api-key-here');
		console.error('   DATTO_API_SECRET=your-api-secret-here');
		console.error('');
		console.error('   # Optional: API Base URL (if different from default)');
		console.error('   DATTO_API_BASE_URL=https://your-instance.centrastage.net');
		console.error('');
		console.error('💡 Current values found:');
		console.error(`   DATTO_API_KEY: ${process.env.DATTO_API_KEY ? '✓ Set' : '❌ Missing'}`);
		console.error(`   DATTO_API_SECRET: ${process.env.DATTO_API_SECRET ? '✓ Set' : '❌ Missing'}`);
		console.error(`   DATTO_API_BASE_URL: ${process.env.DATTO_API_BASE_URL || '❌ Using default'}`);
		process.exit(1);
	}

	testNode().catch(console.error);
}

export { testNode, createMockExecuteFunctions, createMockLoadOptionsFunctions };
