/**
 * Device filtering helper functions for Datto RMM
 */

export interface FilterCondition {
	field: string;
	operator: string;
	value?: string;
	numericValue?: number;
	booleanValue?: boolean;
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, key) => {
		return current && current[key] !== undefined ? current[key] : undefined;
	}, obj);
}

/**
 * Evaluate a single filter condition against a device
 */
function evaluateCondition(device: any, condition: FilterCondition): boolean {
	const { field, operator, value, numericValue, booleanValue } = condition;
	const fieldValue = getNestedValue(device, field);

	// Handle null/undefined values
	if (fieldValue === null || fieldValue === undefined) {
		switch (operator) {
			case 'isEmpty':
				return true;
			case 'isNotEmpty':
				return false;
			default:
				return false;
		}
	}

	// Convert to string for text operations
	const fieldStr = String(fieldValue).toLowerCase();
	const compareStr = String(value || '').toLowerCase();

	switch (operator) {
		case 'equals':
			// Handle boolean fields
			if (typeof fieldValue === 'boolean') {
				return fieldValue === booleanValue;
			}
			return fieldStr === compareStr;

		case 'contains':
			return fieldStr.includes(compareStr);

		case 'startsWith':
			return fieldStr.startsWith(compareStr);

		case 'endsWith':
			return fieldStr.endsWith(compareStr);

		case 'notEquals':
			// Handle boolean fields
			if (typeof fieldValue === 'boolean') {
				return fieldValue !== booleanValue;
			}
			return fieldStr !== compareStr;

		case 'notContains':
			return !fieldStr.includes(compareStr);

		case 'isEmpty':
			return fieldStr === '' || fieldStr === 'null' || fieldStr === 'undefined';

		case 'isNotEmpty':
			return fieldStr !== '' && fieldStr !== 'null' && fieldStr !== 'undefined';

		case 'greaterThan': {
			const numValue = Number(fieldValue);
			return !isNaN(numValue) && numValue > (numericValue || 0);
		}

		case 'lessThan': {
			const numValueLT = Number(fieldValue);
			return !isNaN(numValueLT) && numValueLT < (numericValue || 0);
		}

		case 'greaterThanOrEqual': {
			const numValueGTE = Number(fieldValue);
			return !isNaN(numValueGTE) && numValueGTE >= (numericValue || 0);
		}

		case 'lessThanOrEqual': {
			const numValueLTE = Number(fieldValue);
			return !isNaN(numValueLTE) && numValueLTE <= (numericValue || 0);
		}

		case 'regex': {
			try {
				const regex = new RegExp(value || '', 'i'); // Case insensitive
				return regex.test(fieldStr);
			} catch {
				// Invalid regex, return false
				return false;
			}
		}

		default:
			return false;
	}
}

/**
 * Apply advanced filters to device array
 */
export function applyAdvancedFilters(
	devices: any[],
	filterConditions: FilterCondition[],
	filterLogic: 'AND' | 'OR' = 'AND',
): any[] {
	if (!filterConditions || filterConditions.length === 0) {
		return devices;
	}

	return devices.filter((device) => {
		const results = filterConditions.map((condition) => evaluateCondition(device, condition));

		if (filterLogic === 'AND') {
			return results.every((result) => result);
		} else {
			return results.some((result) => result);
		}
	});
}

/**
 * Validate filter conditions array
 */
export function validateFilterConditions(conditions: any[]): FilterCondition[] {
	if (!Array.isArray(conditions)) {
		return [];
	}

	return conditions
		.filter((condition) => condition && condition.field && condition.operator)
		.map((condition) => ({
			field: condition.field,
			operator: condition.operator,
			value: condition.value,
			numericValue: condition.numericValue,
			booleanValue: condition.booleanValue,
		}));
}
