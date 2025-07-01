import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { dattoRmmApiRequest } from '../../helpers/api.helper';
import { handleErrors } from '../../helpers/errorHandler';

export async function executeAlertOperation(
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
					case 'get':
						{
							const alertUid = this.getNodeParameter('alertUid', i) as string;

							responseData = await dattoRmmApiRequest.call(
								this,
								'GET',
								`/api/v2/alert/${alertUid}`,
							);
						}
						break;

					case 'resolve':
						{
							const alertUid = this.getNodeParameter('alertUid', i) as string;
							const resolutionNote = this.getNodeParameter('resolutionNote', i, '') as string;

							const body: Record<string, any> = {};

							if (resolutionNote.trim() !== '') {
								body.resolutionNote = resolutionNote.trim();
							}

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								`/api/v2/alert/${alertUid}/resolve`,
								body,
							);
						}
						break;

					case 'mute':
						{
							const alertUid = this.getNodeParameter('alertUid', i) as string;

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								`/api/v2/alert/${alertUid}/mute`,
								{},
							);
						}
						break;

					case 'unmute':
						{
							const alertUid = this.getNodeParameter('alertUid', i) as string;

							responseData = await dattoRmmApiRequest.call(
								this,
								'POST',
								`/api/v2/alert/${alertUid}/unmute`,
								{},
							);
						}
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				// Handle array responses
				if (Array.isArray(responseData)) {
					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else if (responseData && typeof responseData === 'object') {
					// Handle single object responses or paginated responses
					if (responseData.data && Array.isArray(responseData.data)) {
						responseData.data.forEach((item: any) => {
							returnData.push({
								json: item,
								pairedItem: { item: i },
							});
						});
					} else {
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				} else {
					// Handle successful operations that return simple responses
					returnData.push({
						json: {
							success: true,
							operation,
							alertUid: this.getNodeParameter('alertUid', i),
							message: `Alert ${operation} completed successfully`,
						},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	});
}
