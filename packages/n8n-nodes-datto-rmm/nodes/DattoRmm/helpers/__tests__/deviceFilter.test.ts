import {
	applyAdvancedFilters,
	validateFilterConditions,
	type FilterCondition,
} from '../deviceFilter';

// Mock device data based on the user's example
const mockDevices = [
	{
		id: 12981455,
		uid: 'de8702e9-a32a-ea22-3cb0-9062d6e9f18e',
		hostname: 'DESKTOP-15E8BG3',
		deviceType: {
			category: 'Desktop',
			type: 'Desktop',
		},
		operatingSystem: 'Microsoft Windows 10 Home 10.0.19045',
		intIpAddress: '192.168.101.162',
		extIpAddress: '194.46.230.133',
		domain: 'WORKGROUP',
		description: 'Reception PC 1',
		online: true,
		suspended: false,
		deleted: false,
		rebootRequired: false,
		a64Bit: true,
		antivirus: {
			antivirusProduct: 'Datto AV',
			antivirusStatus: 'RunningAndUpToDate',
		},
		patchManagement: {
			patchStatus: 'FullyPatched',
			patchesApprovedPending: 0,
			patchesNotApproved: 8,
			patchesInstalled: 6,
		},
		softwareStatus: 'Not Compliant',
		udf: {
			udf1: 'Kernel version : Windows 10 Build 21H1 (May 2021 Update), build 2006 ',
			udf4: 'AEB: Online | Backup Size: 82.30 GB | Last completed: Today |',
		},
	},
	{
		id: 12981456,
		uid: 'de8702e9-a32a-ea22-3cb0-9062d6e9f18f',
		hostname: 'SERVER-01',
		deviceType: {
			category: 'Server',
			type: 'Server',
		},
		operatingSystem: 'Microsoft Windows Server 2019',
		intIpAddress: '192.168.101.100',
		extIpAddress: '194.46.230.133',
		domain: 'COMPANY.LOCAL',
		description: 'Main file server',
		online: true,
		suspended: false,
		deleted: false,
		rebootRequired: true,
		a64Bit: true,
		antivirus: {
			antivirusProduct: 'Windows Defender',
			antivirusStatus: 'RunningAndUpToDate',
		},
		patchManagement: {
			patchStatus: 'PendingReboot',
			patchesApprovedPending: 3,
			patchesNotApproved: 2,
			patchesInstalled: 15,
		},
		softwareStatus: 'Compliant',
		udf: {
			udf1: 'Server OS version',
			udf4: 'AEB: Offline | Last completed: Never |',
		},
	},
	{
		id: 12981457,
		uid: 'de8702e9-a32a-ea22-3cb0-9062d6e9f18g',
		hostname: 'LAPTOP-USER01',
		deviceType: {
			category: 'Desktop',
			type: 'Laptop',
		},
		operatingSystem: 'Microsoft Windows 11 Pro',
		intIpAddress: '192.168.101.200',
		extIpAddress: null,
		domain: 'COMPANY.LOCAL',
		description: '',
		online: false,
		suspended: false,
		deleted: false,
		rebootRequired: false,
		a64Bit: true,
		antivirus: {
			antivirusProduct: 'Bitdefender',
			antivirusStatus: 'OutOfDate',
		},
		patchManagement: {
			patchStatus: 'NotCompliant',
			patchesApprovedPending: 12,
			patchesNotApproved: 5,
			patchesInstalled: 2,
		},
		softwareStatus: 'Not Compliant',
		udf: {
			udf1: null,
			udf4: '',
		},
	},
];

describe('DeviceFilter', () => {
	describe('validateFilterConditions', () => {
		it('should validate and return proper filter conditions', () => {
			const input = [
				{ field: 'hostname', operator: 'contains', value: 'test' },
				{ field: 'online', operator: 'equals', booleanValue: true },
				{ invalid: 'condition' }, // Should be filtered out
				{ field: 'patchCount', operator: 'greaterThan', numericValue: 5 },
			];

			const result = validateFilterConditions(input);

			expect(result).toHaveLength(3);
			expect(result[0]).toEqual({
				field: 'hostname',
				operator: 'contains',
				value: 'test',
				numericValue: undefined,
				booleanValue: undefined,
			});
		});

		it('should return empty array for invalid input', () => {
			expect(validateFilterConditions(null as any)).toEqual([]);
			expect(validateFilterConditions('invalid' as any)).toEqual([]);
			expect(validateFilterConditions([])).toEqual([]);
		});
	});

	describe('applyAdvancedFilters', () => {
		it('should filter devices by hostname contains', () => {
			const conditions: FilterCondition[] = [
				{ field: 'hostname', operator: 'contains', value: 'DESKTOP' },
			];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(1);
			expect(result[0].hostname).toBe('DESKTOP-15E8BG3');
		});

		it('should filter devices by boolean field', () => {
			const conditions: FilterCondition[] = [
				{ field: 'online', operator: 'equals', booleanValue: true },
			];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(2);
			expect(result.every((device) => device.online === true)).toBe(true);
		});

		it('should filter devices by nested field', () => {
			const conditions: FilterCondition[] = [
				{ field: 'deviceType.category', operator: 'equals', value: 'Desktop' },
			];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(2);
			expect(result.every((device) => device.deviceType.category === 'Desktop')).toBe(true);
		});

		it('should filter devices by numeric comparison', () => {
			const conditions: FilterCondition[] = [
				{
					field: 'patchManagement.patchesApprovedPending',
					operator: 'greaterThan',
					numericValue: 5,
				},
			];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(1);
			expect(result[0].hostname).toBe('LAPTOP-USER01');
		});

		it('should apply AND logic correctly', () => {
			const conditions: FilterCondition[] = [
				{ field: 'online', operator: 'equals', booleanValue: true },
				{ field: 'deviceType.category', operator: 'equals', value: 'Desktop' },
			];

			const result = applyAdvancedFilters(mockDevices, conditions, 'AND');

			expect(result).toHaveLength(1);
			expect(result[0].hostname).toBe('DESKTOP-15E8BG3');
		});

		it('should apply OR logic correctly', () => {
			const conditions: FilterCondition[] = [
				{ field: 'hostname', operator: 'contains', value: 'SERVER' },
				{ field: 'hostname', operator: 'contains', value: 'LAPTOP' },
			];

			const result = applyAdvancedFilters(mockDevices, conditions, 'OR');

			expect(result).toHaveLength(2);
			expect(result.some((device) => device.hostname.includes('SERVER'))).toBe(true);
			expect(result.some((device) => device.hostname.includes('LAPTOP'))).toBe(true);
		});

		it('should handle isEmpty and isNotEmpty operators', () => {
			const conditions: FilterCondition[] = [{ field: 'description', operator: 'isEmpty' }];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(1);
			expect(result[0].hostname).toBe('LAPTOP-USER01');
		});

		it('should handle regex operators', () => {
			const conditions: FilterCondition[] = [
				{
					field: 'intIpAddress',
					operator: 'regex',
					value: '^192\\.168\\.101\\.(1[0-9][0-9]|200)$',
				},
			];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(2);
			expect(result.some((device) => device.intIpAddress === '192.168.101.162')).toBe(true);
			expect(result.some((device) => device.intIpAddress === '192.168.101.200')).toBe(true);
		});

		it('should handle UDF field filtering', () => {
			const conditions: FilterCondition[] = [
				{ field: 'udf.udf4', operator: 'contains', value: 'AEB: Online' },
			];

			const result = applyAdvancedFilters(mockDevices, conditions);

			expect(result).toHaveLength(1);
			expect(result[0].hostname).toBe('DESKTOP-15E8BG3');
		});

		it('should return original array when no conditions provided', () => {
			const result = applyAdvancedFilters(mockDevices, []);

			expect(result).toHaveLength(mockDevices.length);
			expect(result).toEqual(mockDevices);
		});

		it('should handle complex multi-condition filtering', () => {
			const conditions: FilterCondition[] = [
				{ field: 'online', operator: 'equals', booleanValue: true },
				{ field: 'rebootRequired', operator: 'equals', booleanValue: false },
				{ field: 'patchManagement.patchStatus', operator: 'equals', value: 'FullyPatched' },
			];

			const result = applyAdvancedFilters(mockDevices, conditions, 'AND');

			expect(result).toHaveLength(1);
			expect(result[0].hostname).toBe('DESKTOP-15E8BG3');
		});
	});
});
