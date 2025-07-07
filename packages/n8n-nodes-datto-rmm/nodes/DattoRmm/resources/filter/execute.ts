import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { dattoRmmApiRequest, dattoRmmApiRequestAllItems } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';

export async function executeFilterOperation(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const operation = this.getNodeParameter('operation', 0) as string;
	const returnData: INodeExecutionData[] = [];

	return handleErrors(this, async () => {
		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				switch (operation) {
					case 'getDefaultFilters':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const category = this.getNodeParameter('category', i, '') as string;

							const queryParams: Record<string, string | number> = {};

							if (category?.trim()) {
								queryParams.category = category.trim();
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allFilters = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/filter/default',
									{},
									queryParams,
								);
								responseData = { filters: allFilters };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 1) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/filter/default',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'getCustomFilters':
						{
							const retrieveAll = this.getNodeParameter('retrieveAll', i, true) as boolean;
							const category = this.getNodeParameter('category', i, '') as string;
							const includeInactive = this.getNodeParameter('includeInactive', i, false) as boolean;

							const queryParams: Record<string, string | number | boolean> = {};

							if (category?.trim()) {
								queryParams.category = category.trim();
							}

							if (includeInactive) {
								queryParams.includeInactive = true;
							}

							if (retrieveAll) {
								// Use automatic pagination to get all results
								const allFilters = await dattoRmmApiRequestAllItems.call(
									this,
									'GET',
									'/api/v2/filter/custom',
									{},
									queryParams,
								);
								responseData = { filters: allFilters };
							} else {
								// Use manual pagination
								const page = this.getNodeParameter('page', i, 1) as number;
								const max = this.getNodeParameter('max', i, 100) as number;
								queryParams.page = page;
								queryParams.max = max;

								responseData = await dattoRmmApiRequest.call(
									this,
									'GET',
									'/api/v2/filter/custom',
									{},
									queryParams,
								);
							}
						}
						break;

					case 'createFilter':
						{
							const filterName = this.getNodeParameter('filterName', i) as string;
							const description = this.getNodeParameter('description', i, '') as string;
							const criteria = this.getNodeParameter('criteria', i) as string;
							const filterType = this.getNodeParameter('filterType', i, 'device') as string;
							const category = this.getNodeParameter('category', i, '') as string;

							// Parse criteria JSON
							let parsedCriteria;
							try {
								parsedCriteria = JSON.parse(criteria);
							} catch {
								throw new NodeOperationError(
									this.getNode(),
									'Invalid JSON format in filter criteria',
									{ itemIndex: i },
								);
							}

							const requestBody: Record<string, any> = {
								name: filterName,
								criteria: parsedCriteria,
								type: filterType,
							};

							if (description?.trim()) {
								requestBody.description = description.trim();
							}

							if (category?.trim()) {
								requestBody.category = category.trim();
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								'/api/v2/filter/custom',
								requestBody,
							);
						}
						break;

					case 'updateFilter':
						{
							const filterId = this.getNodeParameter('filterId', i) as string;
							const filterName = this.getNodeParameter('filterName', i, '') as string;
							const description = this.getNodeParameter('description', i, '') as string;
							const criteria = this.getNodeParameter('criteria', i, '') as string;
							const filterType = this.getNodeParameter('filterType', i, '') as string;
							const category = this.getNodeParameter('category', i, '') as string;

							const requestBody: Record<string, any> = {};

							// Only include fields that are provided
							if (filterName?.trim()) {
								requestBody.name = filterName.trim();
							}

							if (description?.trim()) {
								requestBody.description = description.trim();
							}

							if (criteria?.trim()) {
								try {
									requestBody.criteria = JSON.parse(criteria);
								} catch {
									throw new NodeOperationError(
										this.getNode(),
										'Invalid JSON format in filter criteria',
										{ itemIndex: i },
									);
								}
							}

							if (filterType?.trim()) {
								requestBody.type = filterType.trim();
							}

							if (category?.trim()) {
								requestBody.category = category.trim();
							}

							// Check if at least one field is being updated
							if (Object.keys(requestBody).length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									'At least one field must be provided to update the filter',
									{ itemIndex: i },
								);
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'PUT',
								`/api/v2/filter/custom/${filterId}`,
								requestBody,
							);
						}
						break;

					case 'deleteFilter':
						{
							const filterId = this.getNodeParameter('filterId', i) as string;

							responseData = await dattoRmmApiRequest.call(
								this,
								'DELETE',
								`/api/v2/filter/custom/${filterId}`,
							);

							// For delete operations, create a simple success response
							responseData = {
								success: true,
								message: `Filter ${filterId} deleted successfully`,
								filterId: filterId,
								operation: 'delete',
							};
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for filter resource`,
							{
								description: `Available operations: getDefaultFilters, getCustomFilters, createFilter, updateFilter, deleteFilter`,
							},
						);
				}

				// Handle response data
				if (Array.isArray(responseData)) {
					// Direct array response
					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else if (responseData && typeof responseData === 'object') {
					// Handle different response structures
					let dataArray: any[] = [];

					switch (operation) {
						case 'getDefaultFilters':
						case 'getCustomFilters':
							dataArray = responseData.filters || [];
							break;
						default:
							// Handle single object responses (create, update, delete)
							if (responseData.data && Array.isArray(responseData.data)) {
								dataArray = responseData.data;
							} else {
								// Single object response
								returnData.push({
									json: responseData,
									pairedItem: { item: i },
								});
								continue;
							}
					}

					// Add each item from the data array
					if (dataArray.length > 0) {
						dataArray.forEach((item: any) => {
							returnData.push({
								json: item,
								pairedItem: { item: i },
							});
						});
					} else {
						// Include pagination info when no data is returned
						returnData.push({
							json: {
								message: `No filters found for ${operation}`,
								pageDetails: responseData.pageDetails || null,
								operation: operation,
								category: this.getNodeParameter('category', i, ''),
							},
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				// Handle individual item errors when continueOnFail is enabled
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message || 'Unknown error occurred',
							itemIndex: i,
							operation: operation,
							resource: 'filter',
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}

				// Re-throw the error to be handled by the outer handleErrors wrapper
				throw error;
			}
		}

		return [returnData];
	});
}
