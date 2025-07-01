import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	IRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

interface TokenData {
	access_token: string;
	token_type: string;
	expires_in: number;
	expires_at: number;
}

interface DattoRmmCredentials {
	apiUrl: string;
	apiKey: string;
	apiSecret: string;
	tokenData?: TokenData;
}

/**
 * Get OAuth2 access token for Datto RMM API
 */
async function getAccessToken(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	credentials: DattoRmmCredentials,
): Promise<string> {
	// Check if we have a valid token that hasn't expired
	if (credentials.tokenData?.access_token && credentials.tokenData.expires_at) {
		const now = Date.now();
		const expiresAt = credentials.tokenData.expires_at;

		// If token is still valid (with 5 minute buffer), use it
		if (now < expiresAt - 300000) {
			return credentials.tokenData.access_token;
		}
	}

	// Get new OAuth2 token using password grant
	const tokenUrl = `${credentials.apiUrl}/auth/oauth/token`;

	const clientCredentials = Buffer.from('public-client:public').toString('base64');

	const tokenRequestOptions: IRequestOptions = {
		method: 'POST',
		url: tokenUrl,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${clientCredentials}`,
		},
		form: {
			grant_type: 'password',
			username: credentials.apiKey,
			password: credentials.apiSecret,
		},
	};

	try {
		const tokenResponse = await this.helpers.request(tokenRequestOptions);

		// Parse response if it's a string
		let parsedResponse = tokenResponse;
		if (typeof tokenResponse === 'string') {
			parsedResponse = JSON.parse(tokenResponse);
		}

		const accessToken = parsedResponse.access_token;
		const expiresIn = parsedResponse.expires_in || 360000; // Default to 100 hours

		if (!accessToken) {
			throw new Error('No access token received from OAuth2 response');
		}

		// Store token data in credentials for future use
		credentials.tokenData = {
			access_token: accessToken,
			token_type: parsedResponse.token_type || 'Bearer',
			expires_in: expiresIn,
			expires_at: Date.now() + expiresIn * 1000,
		};

		return accessToken;
	} catch (error: any) {
		throw new Error(`OAuth2 authentication failed: ${error.message}`);
	}
}

/**
 * Make an authenticated request to Datto RMM API
 */
export async function dattoRmmApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: any,
	qs?: any,
	headers?: any,
): Promise<any> {
	const credentials = (await this.getCredentials('dattoRmmApi')) as DattoRmmCredentials;

	// Get access token
	const accessToken = await getAccessToken.call(this, credentials);

	// Prepare request options
	const options: IHttpRequestOptions = {
		method,
		url: `${credentials.apiUrl}${endpoint}`,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...headers,
		},
		json: true,
	};

	if (body) {
		options.body = body;
	}

	if (qs) {
		options.qs = qs;
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return response;
	} catch (error: any) {
		// If token is invalid (401), try once more with a fresh token
		if (error.statusCode === 401) {
			// Clear cached token and try again
			delete credentials.tokenData;
			const newAccessToken = await getAccessToken.call(this, credentials);

			options.headers = {
				...options.headers,
				Authorization: `Bearer ${newAccessToken}`,
			};

			return await this.helpers.httpRequest(options);
		}

		throw error;
	}
}

/**
 * Make an authenticated request specifically for pagination
 */
export async function dattoRmmApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: any,
	qs?: any,
): Promise<any[]> {
	const returnData: any[] = [];
	let page = 1;
	const pageSize = 100; // Datto RMM default page size
	let hasMoreData = true;

	while (hasMoreData) {
		const queryParams = {
			...qs,
			page,
			max: pageSize,
		};

		const responseData = await dattoRmmApiRequest.call(this, method, endpoint, body, queryParams);

		// Handle Datto RMM specific response structures
		let dataArray: any[] = [];
		let pageDetails: any = null;

		if (Array.isArray(responseData)) {
			// Direct array response (rare in Datto RMM)
			dataArray = responseData;
		} else if (responseData && typeof responseData === 'object') {
			// Extract data based on common Datto RMM response patterns
			if (responseData.sites) {
				dataArray = responseData.sites;
			} else if (responseData.devices) {
				dataArray = responseData.devices;
			} else if (responseData.users) {
				dataArray = responseData.users;
			} else if (responseData.components) {
				dataArray = responseData.components;
			} else if (responseData.alerts) {
				dataArray = responseData.alerts;
			} else if (responseData.variables) {
				dataArray = responseData.variables;
			} else if (responseData.data && Array.isArray(responseData.data)) {
				dataArray = responseData.data;
			} else {
				// Single item response - wrap in array
				dataArray = [responseData];
			}

			pageDetails = responseData.pageDetails;
		}

		// Add items from this page
		if (dataArray.length > 0) {
			returnData.push(...dataArray);
		}

		// Determine if there are more pages
		if (pageDetails && typeof pageDetails.totalCount === 'number') {
			// Use totalCount to determine if we have more data
			const currentTotal = page * pageSize;
			hasMoreData = currentTotal < pageDetails.totalCount;
		} else {
			// Fallback: if we get less than pageSize items, assume we're done
			hasMoreData = dataArray.length >= pageSize;
		}

		// Early exit if no data returned (avoid infinite loops on empty responses)
		if (dataArray.length === 0) {
			hasMoreData = false;
		}

		page++;

		// Safety check to prevent infinite loops
		if (page > 1000) {
			console.warn(`Pagination safety limit reached (1000 pages) for endpoint: ${endpoint}`);
			break;
		}
	}

	return returnData;
}

/**
 * Helper to get all items for a specific operation type
 */
export async function dattoRmmApiRequestAllItemsByOperation(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	endpoint: string,
	qs?: any,
): Promise<any[]> {
	const allItems = await dattoRmmApiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
	return allItems;
}
