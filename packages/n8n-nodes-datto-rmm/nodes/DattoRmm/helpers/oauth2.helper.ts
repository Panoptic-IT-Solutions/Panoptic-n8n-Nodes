import type { IExecuteFunctions, ILoadOptionsFunctions, IRequestOptions } from 'n8n-workflow';

export interface TokenData {
	access_token: string;
	token_type: string;
	expires_in: number;
	expires_at: number;
}

export interface DattoRmmCredentials {
	apiUrl: string;
	apiKey: string;
	apiSecret: string;
	tokenData?: TokenData;
}

/**
 * Get OAuth2 access token for Datto RMM API
 */
export async function getAccessToken(
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
