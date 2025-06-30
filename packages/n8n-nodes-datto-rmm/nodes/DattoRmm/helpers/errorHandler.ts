import type { IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

// Define error types for better type safety
interface HttpErrorResponse {
	httpCode?: number;
	response?: {
		status?: number;
		data?: {
			message?: string;
			description?: string;
			error?: string;
			error_description?: string;
			error_details?: string;
			details?: string;
		};
	};
	responseData?: {
		message?: string;
		description?: string;
	};
	message?: string;
}

interface ApiErrorResponse {
	isAxiosError?: boolean;
	response?: {
		status?: number;
		data?: {
			error?: string;
			message?: string;
			error_description?: string;
			error_details?: string;
			details?: string;
			description?: string;
		};
	};
	message?: string;
}

interface GenericError {
	name?: string;
	code?: string;
	message?: string;
}

type DattoRmmError =
	| HttpErrorResponse
	| ApiErrorResponse
	| GenericError
	| NodeApiError
	| NodeOperationError;

/**
 * Enhanced error handling utility for Datto RMM API responses
 */
export async function handleErrors<T>(
	context: IExecuteFunctions,
	operation: () => Promise<T>,
): Promise<T> {
	try {
		return await operation();
	} catch (error: unknown) {
		const dattoError = error as DattoRmmError;

		// Handle different types of errors
		if ('httpCode' in dattoError && dattoError.httpCode) {
			return handleHttpError(context, dattoError as HttpErrorResponse);
		}

		if (
			('isAxiosError' in dattoError && dattoError.isAxiosError) ||
			('response' in dattoError && dattoError.response)
		) {
			return handleApiError(context, dattoError as ApiErrorResponse);
		}

		// Handle validation and other operation errors
		return handleGenericError(context, dattoError as GenericError);
	}
}

/**
 * Handle HTTP-specific errors (4xx, 5xx status codes)
 */
function handleHttpError(context: IExecuteFunctions, error: HttpErrorResponse): never {
	const statusCode = error.httpCode || error.response?.status;
	const responseData = error.response?.data || error.responseData || {};

	let message: string;

	switch (statusCode) {
		case 400:
			message = `Bad Request: ${responseData.message || 'Invalid parameters provided'}`;
			break;
		case 401:
			message = 'Authentication failed. Please check your API credentials';
			break;
		case 403:
			message = 'Access forbidden. You do not have permission to perform this operation';
			break;
		case 404:
			message = `Resource not found: ${responseData.message || 'The requested resource does not exist'}`;
			break;
		case 409:
			message = `Conflict: ${responseData.message || 'Resource already exists or conflicts with existing data'}`;
			break;
		case 429:
			message = 'Rate limit exceeded. Please wait before making more requests';
			break;
		case 500:
			message = 'Internal server error. Please try again later';
			break;
		case 502:
		case 503:
		case 504:
			message = 'Datto RMM service is temporarily unavailable. Please try again later';
			break;
		default:
			message = `HTTP ${statusCode}: ${responseData.message || error.message || 'An unexpected error occurred'}`;
	}

	throw new NodeApiError(context.getNode(), error as unknown as JsonObject, {
		message,
		description: responseData.description || 'Check your request parameters and try again',
		httpCode: statusCode?.toString() || '500',
	});
}

/**
 * Handle API response errors (Axios/HTTP client errors)
 */
function handleApiError(context: IExecuteFunctions, error: ApiErrorResponse): never {
	const response = error.response;
	const responseData = response?.data || {};

	// Extract error details from Datto RMM API response
	const errorMessage =
		responseData.error ||
		responseData.message ||
		responseData.error_description ||
		error.message ||
		'API request failed';

	const details =
		responseData.error_details ||
		responseData.details ||
		responseData.description ||
		'No additional details available';

	throw new NodeApiError(context.getNode(), error as unknown as JsonObject, {
		message: `Datto RMM API Error: ${errorMessage}`,
		description: details,
		httpCode: response?.status?.toString() || '500',
	});
}

/**
 * Handle generic/validation errors
 */
function handleGenericError(context: IExecuteFunctions, error: GenericError): never {
	// If it's already a proper n8n error, re-throw it
	if (error instanceof NodeApiError || error instanceof NodeOperationError) {
		throw error;
	}

	// Handle validation errors
	if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
		throw new NodeOperationError(
			context.getNode(),
			`Validation Error: ${error.message || 'Invalid input'}`,
			{
				description: 'Please check your input parameters and try again',
			},
		);
	}

	// Handle timeout errors
	if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
		throw new NodeApiError(context.getNode(), error as unknown as JsonObject, {
			message: 'Request timeout: Datto RMM API did not respond in time',
			description: 'The request took too long to complete. Please try again',
		});
	}

	// Handle network errors
	if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
		throw new NodeApiError(context.getNode(), error as unknown as JsonObject, {
			message: 'Network Error: Unable to connect to Datto RMM API',
			description: 'Please check your network connection and API URL configuration',
		});
	}

	// Handle URL parsing errors
	if (error.message?.includes('Invalid URL') || error.code === 'ERR_INVALID_URL') {
		throw new NodeOperationError(context.getNode(), 'Invalid API URL configuration', {
			description:
				'Please ensure your API URL is correctly formatted (e.g., https://pinotage-api.centrastage.net) without trailing slashes or /api suffix',
		});
	}

	// Fallback for unknown errors
	throw new NodeOperationError(
		context.getNode(),
		`Unexpected error: ${error.message || 'An unknown error occurred'}`,
		{
			description:
				'Please check your configuration and try again. If the problem persists, contact support',
		},
	);
}

/**
 * Validate required parameters
 */
export function validateRequiredParams(
	context: IExecuteFunctions,
	params: Record<string, unknown>,
	requiredFields: string[],
): void {
	const missingFields: string[] = [];

	for (const field of requiredFields) {
		const value = params[field];
		if (value === undefined || value === null || value === '') {
			missingFields.push(field);
		}
	}

	if (missingFields.length > 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Missing required parameters: ${missingFields.join(', ')}`,
			{
				description: 'Please provide all required parameters to continue',
			},
		);
	}
}

/**
 * Validate parameter types and formats
 */
export function validateParamTypes(
	context: IExecuteFunctions,
	params: Record<string, unknown>,
	rules: Record<string, { type: string; format?: string; min?: number; max?: number }>,
): void {
	const errors: string[] = [];

	for (const [field, rule] of Object.entries(rules)) {
		const value = params[field];

		if (value === undefined || value === null) {
			continue; // Skip validation for undefined/null values
		}

		// Type validation
		switch (rule.type) {
			case 'string':
				if (typeof value !== 'string') {
					errors.push(`${field} must be a string`);
				}
				break;
			case 'number':
				if (typeof value !== 'number' || isNaN(value)) {
					errors.push(`${field} must be a valid number`);
				} else {
					if (rule.min !== undefined && value < rule.min) {
						errors.push(`${field} must be at least ${rule.min}`);
					}
					if (rule.max !== undefined && value > rule.max) {
						errors.push(`${field} must be at most ${rule.max}`);
					}
				}
				break;
			case 'boolean':
				if (typeof value !== 'boolean') {
					errors.push(`${field} must be a boolean`);
				}
				break;
			case 'array':
				if (!Array.isArray(value)) {
					errors.push(`${field} must be an array`);
				}
				break;
		}

		// Format validation
		if (rule.format && typeof value === 'string') {
			switch (rule.format) {
				case 'email':
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(value)) {
						errors.push(`${field} must be a valid email address`);
					}
					break;
				case 'url':
					try {
						new URL(value);
					} catch {
						errors.push(`${field} must be a valid URL`);
					}
					break;
				case 'date':
					if (isNaN(Date.parse(value))) {
						errors.push(`${field} must be a valid date`);
					}
					break;
			}
		}
	}

	if (errors.length > 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Parameter validation failed: ${errors.join(', ')}`,
			{
				description: 'Please correct the parameter values and try again',
			},
		);
	}
}
