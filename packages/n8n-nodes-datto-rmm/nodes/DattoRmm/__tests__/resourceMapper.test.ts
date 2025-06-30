import type { ILoadOptionsFunctions } from 'n8n-workflow';
import { getResourceMapperFields } from '../helpers/resourceMapper';

describe('Resource Mapper', () => {
	let mockLoadOptionsFunctions: Partial<ILoadOptionsFunctions>;

	beforeEach(() => {
		mockLoadOptionsFunctions = {
			getNode: () => ({ name: 'DattoRmm', type: 'dattoRmm' }),
		};
	});

	describe('getResourceMapperFields', () => {
		it('should return fields for account resource', async () => {
			const result = await getResourceMapperFields.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
				'account',
			);

			expect(result).toBeDefined();
			expect(result.fields).toBeDefined();
			expect(Array.isArray(result.fields)).toBe(true);

			// Check for base fields
			const idField = result.fields.find((field) => field.id === 'id');
			const createdField = result.fields.find((field) => field.id === 'createdDate');
			const modifiedField = result.fields.find((field) => field.id === 'lastModified');

			expect(idField).toBeDefined();
			expect(createdField).toBeDefined();
			expect(modifiedField).toBeDefined();

			// Check for account-specific fields
			const nameField = result.fields.find((field) => field.id === 'name');
			const emailField = result.fields.find((field) => field.id === 'email');

			expect(nameField).toBeDefined();
			expect(emailField).toBeDefined();
		});

		it('should return fields for device resource', async () => {
			const result = await getResourceMapperFields.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
				'device',
			);

			expect(result.fields).toBeDefined();

			// Check for device-specific fields
			const hostnameField = result.fields.find((field) => field.id === 'hostname');
			const osField = result.fields.find((field) => field.id === 'operatingSystem');
			const typeField = result.fields.find((field) => field.id === 'deviceType');

			expect(hostnameField).toBeDefined();
			expect(osField).toBeDefined();
			expect(typeField).toBeDefined();
		});

		it('should return fields for site resource', async () => {
			const result = await getResourceMapperFields.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
				'site',
			);

			expect(result.fields).toBeDefined();

			// Check for site-specific fields
			const nameField = result.fields.find((field) => field.id === 'name');
			const descField = result.fields.find((field) => field.id === 'description');

			expect(nameField).toBeDefined();
			expect(descField).toBeDefined();
		});

		it('should return fields for alert resource', async () => {
			const result = await getResourceMapperFields.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
				'alert',
			);

			expect(result.fields).toBeDefined();

			// Check for alert-specific fields
			const typeField = result.fields.find((field) => field.id === 'alertType');
			const priorityField = result.fields.find((field) => field.id === 'priority');
			const statusField = result.fields.find((field) => field.id === 'status');

			expect(typeField).toBeDefined();
			expect(priorityField).toBeDefined();
			expect(statusField).toBeDefined();
		});

		it('should return default fields for unknown resource', async () => {
			const result = await getResourceMapperFields.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
				'unknown',
			);

			expect(result.fields).toBeDefined();

			// Should have base fields plus default name field
			const nameField = result.fields.find((field) => field.id === 'name');
			expect(nameField).toBeDefined();
		});

		it('should have proper field structure', async () => {
			const result = await getResourceMapperFields.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
				'account',
			);

			const field = result.fields[0];
			expect(field).toHaveProperty('id');
			expect(field).toHaveProperty('displayName');
			expect(field).toHaveProperty('required');
			expect(field).toHaveProperty('defaultMatch');
			expect(field).toHaveProperty('canBeUsedToMatch');
			expect(field).toHaveProperty('display');

			expect(typeof field.id).toBe('string');
			expect(typeof field.displayName).toBe('string');
			expect(typeof field.required).toBe('boolean');
			expect(typeof field.defaultMatch).toBe('boolean');
			expect(typeof field.canBeUsedToMatch).toBe('boolean');
			expect(typeof field.display).toBe('boolean');
		});

		it('should always include base fields', async () => {
			const resources = ['account', 'device', 'site', 'alert', 'unknown'];

			for (const resource of resources) {
				const result = await getResourceMapperFields.call(
					mockLoadOptionsFunctions as ILoadOptionsFunctions,
					resource,
				);

				// Every resource should have these base fields
				const hasId = result.fields.some((field) => field.id === 'id');
				const hasCreated = result.fields.some((field) => field.id === 'createdDate');
				const hasModified = result.fields.some((field) => field.id === 'lastModified');

				expect(hasId).toBe(true);
				expect(hasCreated).toBe(true);
				expect(hasModified).toBe(true);
			}
		});
	});
});
