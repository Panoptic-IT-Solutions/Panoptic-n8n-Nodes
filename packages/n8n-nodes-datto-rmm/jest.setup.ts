// Jest setup file
import 'jest';

// Configure Jest globals
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeFunction(): R;
			toBeArray(): R;
		}
	}
}

// Add custom matchers if needed
expect.extend({
	toBeFunction(received) {
		const pass = typeof received === 'function';
		if (pass) {
			return {
				message: () => `expected ${received} not to be a function`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${received} to be a function`,
				pass: false,
			};
		}
	},
	toBeArray(received) {
		const pass = Array.isArray(received);
		if (pass) {
			return {
				message: () => `expected ${received} not to be an array`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${received} to be an array`,
				pass: false,
			};
		}
	},
});
