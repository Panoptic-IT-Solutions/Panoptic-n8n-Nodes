import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { getAccessToken, DattoRmmCredentials } from './oauth2.helper';

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
			...headers,
		},
		json: true,
	};

	// Only set Content-Type when we have a body to send
	if (body) {
		options.headers!['Content-Type'] = 'application/json';
	}

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
	let page = 0; // Datto RMM uses 0-based pagination
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
			hasMoreData = returnData.length < pageDetails.totalCount;
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
