#!/usr/bin/env ts-node

/**
 * Local testing script for Datto RMM node
 * Mimics how n8n uses the node for local development and testing
 */

import { DattoRmm } from '../nodes/DattoRmm/DattoRmm.node';
import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeParameters,
	ICredentialsDecrypted,
	ICredentialDataDecryptedObject,
	INode,
	IWorkflowExecuteAdditionalData,
	IRunExecutionData,
	INodeType,
} from 'n8n-workflow';
import { NodeParameterValueType } from 'n8n-workflow';

// Mock credentials - replace with your actual Datto RMM credentials
const MOCK_CREDENTIALS: ICredentialDataDecryptedObject = {
	apiUrl: 'https://pinotage-api.centrastage.net', // Replace with your actual API URL
	username: 'your-api-key-here', // Replace with your actual API Key
	password: 'your-secret-key-here', // Replace with your actual Secret Key
	accessTokenUrl: 'https://pinotage-api.centrastage.net/auth/oauth/token',
	clientId: 'public-client',
	clientSecret: 'public',
	authentication: 'header',
	scope: '',
	grantType: 'password',
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
	let tokenCache: { token?: string; expiresAt?: number } = {};

	const mockContext: IExecuteFunctions = {
		getInputData: () => inputData,
		getNodeParameter: (parameterName: string, itemIndex: number) => {
			return nodeParameters[parameterName];
		},
		getNode: () => MOCK_NODE,
		getCredentials: async (type: string) => {
			return {
				data: MOCK_CREDENTIALS,
			} as ICredentialsDecrypted;
		},
		continueOnFail: () => false,
		helpers: {
			returnJsonArray: (jsonData: any[]) =>
				jsonData.map((data, index) => ({
					json: data,
					pairedItem: { item: index },
				})),
			request: async (options: any) => {
				// Mock HTTP request - this is where we'd make the actual API call
				const { method, url, headers, body } = options;

				console.log(`\n🌐 Making ${method} request to: ${MOCK_CREDENTIALS.apiUrl}${url}`);
				console.log('📋 Headers:', JSON.stringify(headers || {}, null, 2));
				if (body) {
					console.log('📦 Body:', JSON.stringify(body, null, 2));
				}

				// Simulate OAuth token acquisition
				if (url?.includes('/auth/oauth/token')) {
					console.log('🔐 OAuth token request detected');
					const mockToken = 'mock-access-token-' + Date.now();
					tokenCache = {
						token: mockToken,
						expiresAt: Date.now() + 100 * 60 * 60 * 1000, // 100 hours
					};
					return {
						access_token: mockToken,
						token_type: 'Bearer',
						expires_in: 360000,
					};
				}

				// For actual API calls, return mock data based on the endpoint
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

				// Fallback for unknown endpoints
				throw new Error(`Mock request handler not implemented for: ${method} ${url}`);
			},
			requestOAuth2: async (name: string, options: any) => {
				// This simulates n8n's OAuth2 handling
				console.log(`\n🔑 OAuth2 request: ${name}`);
				console.log('⚙️ Options:', JSON.stringify(options, null, 2));

				// Check if we have a cached token
				if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
					console.log('📝 Using cached token');
					return mockContext.helpers.request({
						...options,
						headers: {
							...options.headers,
							Authorization: `Bearer ${tokenCache.token}`,
						},
					});
				}

				// Acquire new token
				console.log('🔄 Acquiring new OAuth token...');
				const tokenResponse = await mockContext.helpers.request({
					method: 'POST',
					url: '/auth/oauth/token',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization:
							'Basic ' +
							Buffer.from(`${MOCK_CREDENTIALS.clientId}:${MOCK_CREDENTIALS.clientSecret}`).toString(
								'base64',
							),
					},
					body: `grant_type=password&username=${MOCK_CREDENTIALS.username}&password=${MOCK_CREDENTIALS.password}`,
				});

				// Make the actual request with the token
				return mockContext.helpers.request({
					...options,
					headers: {
						...options.headers,
						Authorization: `Bearer ${tokenResponse.access_token}`,
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
		getCredentials: async (type: string) =>
			({
				data: MOCK_CREDENTIALS,
			}) as ICredentialsDecrypted,
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
	console.log('📋 Using mock credentials:');
	console.log(`   API URL: ${MOCK_CREDENTIALS.apiUrl}`);
	console.log(`   API Key: ${(MOCK_CREDENTIALS.username as string).substring(0, 8)}...`);
	console.log(`   Secret: ${(MOCK_CREDENTIALS.password as string).substring(0, 8)}...\n`);

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
	// Check if credentials are configured
	if (
		MOCK_CREDENTIALS.username === 'your-api-key-here' ||
		MOCK_CREDENTIALS.password === 'your-secret-key-here'
	) {
		console.error('❌ Please configure your Datto RMM credentials in the MOCK_CREDENTIALS object');
		console.error('📝 Edit the script and replace:');
		console.error('   - apiUrl: Your Datto RMM API URL');
		console.error('   - username: Your API Key');
		console.error('   - password: Your API Secret Key');
		process.exit(1);
	}

	testNode().catch(console.error);
}

export { testNode, createMockExecuteFunctions, createMockLoadOptionsFunctions };
