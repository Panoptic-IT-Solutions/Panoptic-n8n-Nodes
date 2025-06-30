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
			pageSize,
		};

		const responseData = await dattoRmmApiRequest.call(this, method, endpoint, body, queryParams);

		if (Array.isArray(responseData)) {
			returnData.push(...responseData);
			// If we get less than pageSize, we're done
			hasMoreData = responseData.length >= pageSize;
		} else if (responseData && Array.isArray(responseData.results)) {
			returnData.push(...responseData.results);
			// Check if there are more pages
			hasMoreData = responseData.hasMore && responseData.results.length >= pageSize;
		} else {
			// Single item or unknown structure
			returnData.push(responseData);
			hasMoreData = false;
		}

		page++;

		// Safety check to prevent infinite loops
		if (page > 1000) {
			break;
		}
	}

	return returnData;
}
