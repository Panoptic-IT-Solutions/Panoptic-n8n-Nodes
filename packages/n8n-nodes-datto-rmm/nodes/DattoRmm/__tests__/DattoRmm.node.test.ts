import type { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { DattoRmm } from '../DattoRmm.node';

// Mock the execute functions
jest.mock('../resources/account/execute', () => ({
	executeAccountOperation: jest.fn(),
}));

// Mock helpers
jest.mock('../helpers/resourceMapper', () => ({
	getResourceMapperFields: jest.fn(),
}));

import { executeAccountOperation } from '../resources/account/execute';
import { getResourceMapperFields } from '../helpers/resourceMapper';

describe('DattoRmm Node', () => {
	let dattoRmm: DattoRmm;
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;
	let mockLoadOptionsFunctions: jest.Mocked<ILoadOptionsFunctions>;

	beforeEach(() => {
		dattoRmm = new DattoRmm();

		// Mock IExecuteFunctions
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getNode: jest.fn(() => ({ name: 'DattoRmm', type: 'dattoRmm' })),
		} as any;

		// Mock ILoadOptionsFunctions
		mockLoadOptionsFunctions = {
			getNodeParameter: jest.fn(),
			getNode: jest.fn(() => ({ name: 'DattoRmm', type: 'dattoRmm' })),
		} as any;

		// Clear all mocks
		jest.clearAllMocks();
	});

	describe('Node Description', () => {
		it('should have correct basic properties', () => {
			expect(dattoRmm.description.displayName).toBe('Datto RMM');
			expect(dattoRmm.description.name).toBe('dattoRmm');
			expect(dattoRmm.description.version).toBe(1);
			expect(dattoRmm.description.usableAsTool).toBe(true);
		});

		it('should have proper node configuration', () => {
			expect(dattoRmm.description.group).toEqual(['transform']);
			expect(dattoRmm.description.inputs).toHaveLength(1);
			expect(dattoRmm.description.outputs).toHaveLength(1);
		});

		it('should require credentials', () => {
			expect(dattoRmm.description.credentials).toEqual([
				{
					name: 'dattoRmmApi',
					required: true,
				},
			]);
		});

		it('should have proper request defaults', () => {
			expect(dattoRmm.description.requestDefaults).toEqual({
				baseURL: '={{$credentials.apiUrl}}',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		});
	});

	describe('Properties Configuration', () => {
		it('should have resource property as first property', () => {
			const resourceProperty = dattoRmm.description.properties[0];
			expect(resourceProperty.name).toBe('resource');
			expect(resourceProperty.type).toBe('options');
			expect(resourceProperty.required).toBe(true);
			expect(resourceProperty.default).toBe('account');
		});

		it('should include account properties', () => {
			const properties = dattoRmm.description.properties;
			// Should have more than just the resource property (account fields should be added)
			expect(properties.length).toBeGreaterThan(1);

			// Check for account-specific operation property
			const accountOperationProperty = properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('account'),
			);
			expect(accountOperationProperty).toBeDefined();
		});

		it('should have resourceMapper field for account operations', () => {
			const properties = dattoRmm.description.properties;
			const resourceMapperProperty = properties.find(
				(prop) => prop.name === 'resourceMapper' && prop.type === 'resourceMapper',
			);
			expect(resourceMapperProperty).toBeDefined();
			expect(resourceMapperProperty?.displayOptions?.show?.resource).toContain('account');
		});
	});

	describe('Execute Method - Switch Routing', () => {
		it('should call executeAccountOperation for account resource', async () => {
			const mockResult: INodeExecutionData[][] = [[]];
			(executeAccountOperation as jest.Mock).mockResolvedValue(mockResult);
			mockExecuteFunctions.getNodeParameter.mockReturnValue('account');

			const result = await dattoRmm.execute.call(mockExecuteFunctions);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('resource', 0);
			expect(executeAccountOperation).toHaveBeenCalledWith();
			expect(result).toBe(mockResult);
		});

		it('should throw error for unsupported resource', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('unsupported');

			await expect(dattoRmm.execute.call(mockExecuteFunctions)).rejects.toThrow(NodeOperationError);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('resource', 0);
			expect(executeAccountOperation).not.toHaveBeenCalled();
		});

		it('should propagate errors from resource execute functions', async () => {
			const testError = new Error('Test execution error');
			(executeAccountOperation as jest.Mock).mockRejectedValue(testError);
			mockExecuteFunctions.getNodeParameter.mockReturnValue('account');

			await expect(dattoRmm.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Test execution error',
			);
		});
	});

	describe('Methods Section', () => {
		describe('resourceMapping', () => {
			it('should have getFields method', () => {
				expect(dattoRmm.methods).toBeDefined();
				expect(dattoRmm.methods?.resourceMapping).toBeDefined();
				expect(dattoRmm.methods?.resourceMapping?.getFields).toBeDefined();
			});

			it('should call getResourceMapperFields with correct resource', async () => {
				const mockFields = { fields: [] };
				(getResourceMapperFields as jest.Mock).mockResolvedValue(mockFields);
				mockLoadOptionsFunctions.getNodeParameter.mockReturnValue('account');

				const result =
					await dattoRmm.methods?.resourceMapping?.getFields?.call(mockLoadOptionsFunctions);

				expect(mockLoadOptionsFunctions.getNodeParameter).toHaveBeenCalledWith('resource', 0);
				expect(getResourceMapperFields).toHaveBeenCalledWith('account');
				expect(result).toBe(mockFields);
			});

			it('should handle errors in getFields', async () => {
				const testError = new Error('ResourceMapper error');
				(getResourceMapperFields as jest.Mock).mockRejectedValue(testError);
				mockLoadOptionsFunctions.getNodeParameter.mockReturnValue('account');

				await expect(
					dattoRmm.methods?.resourceMapping?.getFields?.call(mockLoadOptionsFunctions),
				).rejects.toThrow('ResourceMapper error');
			});
		});

		describe('loadOptions', () => {
			it('should have getResources method', () => {
				expect(dattoRmm.methods?.loadOptions?.getResources).toBeDefined();
			});

			it('should return available resources', async () => {
				const result =
					await dattoRmm.methods?.loadOptions?.getResources?.call(mockLoadOptionsFunctions);

				expect(result).toEqual([
					{ name: 'Account', value: 'account' },
					{ name: 'Device', value: 'device' },
					{ name: 'Site', value: 'site' },
					{ name: 'Alert', value: 'alert' },
					{ name: 'Job', value: 'job' },
					{ name: 'Audit', value: 'audit' },
					{ name: 'System', value: 'system' },
					{ name: 'Filter', value: 'filter' },
				]);
			});

			it('should have getSelectColumns method', () => {
				expect(dattoRmm.methods?.loadOptions?.getSelectColumns).toBeDefined();
			});

			it('should return columns from resourceMapper for getSelectColumns', async () => {
				const mockFields = {
					fields: [
						{ id: 'id', displayName: 'ID' },
						{ id: 'name', displayName: 'Name' },
						{ id: 'email', displayName: 'Email' },
					],
				};
				(getResourceMapperFields as jest.Mock).mockResolvedValue(mockFields);
				mockLoadOptionsFunctions.getNodeParameter.mockReturnValue('account');

				const result =
					await dattoRmm.methods?.loadOptions?.getSelectColumns?.call(mockLoadOptionsFunctions);

				expect(result).toEqual([
					{ name: 'ID', value: 'id' },
					{ name: 'Name', value: 'name' },
					{ name: 'Email', value: 'email' },
				]);
			});

			it('should handle errors in getSelectColumns gracefully', async () => {
				const testError = new Error('Load options error');
				(getResourceMapperFields as jest.Mock).mockRejectedValue(testError);
				mockLoadOptionsFunctions.getNodeParameter.mockReturnValue('account');

				// Should not throw, but return empty array
				const result =
					await dattoRmm.methods?.loadOptions?.getSelectColumns?.call(mockLoadOptionsFunctions);

				expect(result).toEqual([]);
			});
		});
	});

	// TODO: Add pagination tests in the future
	// - Test dattoRmmApiRequestAllItems with multiple pages
	// - Test retrieveAll toggle behavior
	// - Test safety limits and edge cases

	describe('Integration Tests', () => {
		it('should handle complete workflow for account resource', async () => {
			// Setup mocks for full workflow
			const mockExecutionData: INodeExecutionData[][] = [
				[{ json: { id: 1, name: 'Test Account' } }],
			];
			(executeAccountOperation as jest.Mock).mockResolvedValue(mockExecutionData);
			mockExecuteFunctions.getNodeParameter.mockReturnValue('account');

			// Execute the node
			const result = await dattoRmm.execute.call(mockExecuteFunctions);

			// Verify the full workflow
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('resource', 0);
			expect(executeAccountOperation).toHaveBeenCalled();
			expect(result).toEqual(mockExecutionData);
		});

		it('should integrate resourceMapping with loadOptions', async () => {
			// Setup mock for resourceMapper
			const mockFields = {
				fields: [
					{ id: 'id', displayName: 'ID' },
					{ id: 'name', displayName: 'Account Name' },
				],
			};
			(getResourceMapperFields as jest.Mock).mockResolvedValue(mockFields);
			mockLoadOptionsFunctions.getNodeParameter.mockReturnValue('account');

			// Test resourceMapping
			const mapperResult =
				await dattoRmm.methods?.resourceMapping?.getFields?.call(mockLoadOptionsFunctions);
			expect(mapperResult).toBe(mockFields);

			// Test loadOptions using same fields
			const columnsResult =
				await dattoRmm.methods?.loadOptions?.getSelectColumns?.call(mockLoadOptionsFunctions);
			expect(columnsResult).toEqual([
				{ name: 'ID', value: 'id' },
				{ name: 'Account Name', value: 'name' },
			]);
		});
	});
});
