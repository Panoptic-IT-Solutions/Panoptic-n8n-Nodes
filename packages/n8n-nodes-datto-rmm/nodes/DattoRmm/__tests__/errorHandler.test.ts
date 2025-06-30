import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { handleErrors, validateRequiredParams, validateParamTypes } from '../helpers/errorHandler';

describe('Error Handler', () => {
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNode: jest.fn(() => ({ name: 'DattoRmm', type: 'dattoRmm' })),
		} as any;

		jest.clearAllMocks();
	});

	describe('handleErrors', () => {
		it('should execute operation successfully when no error', async () => {
			const mockOperation = jest.fn().mockResolvedValue('success');
			const result = await handleErrors(mockExecuteFunctions, mockOperation);

			expect(result).toBe('success');
			expect(mockOperation).toHaveBeenCalled();
		});

		it('should handle HTTP 400 error', async () => {
			const httpError = {
				httpCode: 400,
				response: {
					data: {
						message: 'Invalid request parameters',
					},
				},
			};
			const mockOperation = jest.fn().mockRejectedValue(httpError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(NodeApiError);
		});

		it('should handle HTTP 401 authentication error', async () => {
			const httpError = {
				httpCode: 401,
				response: { data: {} },
			};
			const mockOperation = jest.fn().mockRejectedValue(httpError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Authentication failed',
			);
		});

		it('should handle HTTP 403 forbidden error', async () => {
			const httpError = {
				httpCode: 403,
				response: { data: {} },
			};
			const mockOperation = jest.fn().mockRejectedValue(httpError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Access forbidden',
			);
		});

		it('should handle HTTP 404 not found error', async () => {
			const httpError = {
				httpCode: 404,
				response: {
					data: {
						message: 'Resource not found',
					},
				},
			};
			const mockOperation = jest.fn().mockRejectedValue(httpError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Resource not found',
			);
		});

		it('should handle HTTP 429 rate limit error', async () => {
			const httpError = {
				httpCode: 429,
				response: { data: {} },
			};
			const mockOperation = jest.fn().mockRejectedValue(httpError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Rate limit exceeded',
			);
		});

		it('should handle HTTP 500 server error', async () => {
			const httpError = {
				httpCode: 500,
				response: { data: {} },
			};
			const mockOperation = jest.fn().mockRejectedValue(httpError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Internal server error',
			);
		});

		it('should handle Axios errors', async () => {
			const axiosError = {
				isAxiosError: true,
				response: {
					status: 400,
					data: {
						error: 'Bad request from Datto API',
					},
				},
			};
			const mockOperation = jest.fn().mockRejectedValue(axiosError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Datto RMM API Error',
			);
		});

		it('should handle validation errors', async () => {
			const validationError = {
				name: 'ValidationError',
				message: 'Invalid field value',
			};
			const mockOperation = jest.fn().mockRejectedValue(validationError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				NodeOperationError,
			);
		});

		it('should handle timeout errors', async () => {
			const timeoutError = {
				code: 'ETIMEDOUT',
				message: 'Request timeout',
			};
			const mockOperation = jest.fn().mockRejectedValue(timeoutError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Request timeout',
			);
		});

		it('should handle network connection errors', async () => {
			const networkError = {
				code: 'ECONNREFUSED',
				message: 'Connection refused',
			};
			const mockOperation = jest.fn().mockRejectedValue(networkError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Network Error',
			);
		});

		it('should handle unknown errors', async () => {
			const unknownError = {
				message: 'Some unknown error',
			};
			const mockOperation = jest.fn().mockRejectedValue(unknownError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(
				'Unexpected error',
			);
		});

		it('should re-throw NodeApiError and NodeOperationError as-is', async () => {
			const nodeError = new NodeOperationError({ name: 'TestNode', type: 'test' }, 'Test error');
			const mockOperation = jest.fn().mockRejectedValue(nodeError);

			await expect(handleErrors(mockExecuteFunctions, mockOperation)).rejects.toThrow(nodeError);
		});
	});

	describe('validateRequiredParams', () => {
		it('should not throw when all required parameters are provided', () => {
			const params = {
				field1: 'value1',
				field2: 'value2',
				field3: 123,
			};
			const requiredFields = ['field1', 'field2'];

			expect(() =>
				validateRequiredParams(mockExecuteFunctions, params, requiredFields),
			).not.toThrow();
		});

		it('should throw when required parameter is missing', () => {
			const params = {
				field1: 'value1',
			};
			const requiredFields = ['field1', 'field2'];

			expect(() => validateRequiredParams(mockExecuteFunctions, params, requiredFields)).toThrow(
				NodeOperationError,
			);
		});

		it('should throw when required parameter is null', () => {
			const params = {
				field1: 'value1',
				field2: null,
			};
			const requiredFields = ['field1', 'field2'];

			expect(() => validateRequiredParams(mockExecuteFunctions, params, requiredFields)).toThrow(
				'Missing required parameters: field2',
			);
		});

		it('should throw when required parameter is empty string', () => {
			const params = {
				field1: 'value1',
				field2: '',
			};
			const requiredFields = ['field1', 'field2'];

			expect(() => validateRequiredParams(mockExecuteFunctions, params, requiredFields)).toThrow(
				'Missing required parameters: field2',
			);
		});

		it('should throw when multiple required parameters are missing', () => {
			const params = {
				field1: 'value1',
			};
			const requiredFields = ['field1', 'field2', 'field3'];

			expect(() => validateRequiredParams(mockExecuteFunctions, params, requiredFields)).toThrow(
				'Missing required parameters: field2, field3',
			);
		});
	});

	describe('validateParamTypes', () => {
		it('should not throw when parameter types are correct', () => {
			const params = {
				stringField: 'hello',
				numberField: 42,
				booleanField: true,
				arrayField: [1, 2, 3],
			};
			const rules = {
				stringField: { type: 'string' },
				numberField: { type: 'number' },
				booleanField: { type: 'boolean' },
				arrayField: { type: 'array' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).not.toThrow();
		});

		it('should throw when string parameter is wrong type', () => {
			const params = {
				stringField: 123,
			};
			const rules = {
				stringField: { type: 'string' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'stringField must be a string',
			);
		});

		it('should throw when number parameter is wrong type', () => {
			const params = {
				numberField: 'not a number',
			};
			const rules = {
				numberField: { type: 'number' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'numberField must be a valid number',
			);
		});

		it('should validate number ranges', () => {
			const params = {
				numberField: 5,
			};
			const rules = {
				numberField: { type: 'number', min: 10, max: 20 },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'numberField must be at least 10',
			);
		});

		it('should validate email format', () => {
			const params = {
				emailField: 'not-an-email',
			};
			const rules = {
				emailField: { type: 'string', format: 'email' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'emailField must be a valid email address',
			);
		});

		it('should validate URL format', () => {
			const params = {
				urlField: 'not-a-url',
			};
			const rules = {
				urlField: { type: 'string', format: 'url' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'urlField must be a valid URL',
			);
		});

		it('should validate date format', () => {
			const params = {
				dateField: 'not-a-date',
			};
			const rules = {
				dateField: { type: 'string', format: 'date' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'dateField must be a valid date',
			);
		});

		it('should skip validation for undefined values', () => {
			const params = {
				definedField: 'value',
			};
			const rules = {
				definedField: { type: 'string' },
				undefinedField: { type: 'string' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).not.toThrow();
		});

		it('should handle multiple validation errors', () => {
			const params = {
				stringField: 123,
				numberField: 'not a number',
			};
			const rules = {
				stringField: { type: 'string' },
				numberField: { type: 'number' },
			};

			expect(() => validateParamTypes(mockExecuteFunctions, params, rules)).toThrow(
				'Parameter validation failed: stringField must be a string, numberField must be a valid number',
			);
		});
	});
});
