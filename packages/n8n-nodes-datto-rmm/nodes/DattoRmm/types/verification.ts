/* eslint-disable @typescript-eslint/no-unused-vars */

import {
	// Base types
	IDattoRmmCredentials,

	// Resource-specific types
	Account,
	Alert,
	Device,
	Job,
	Site,
	User,
} from './index';

console.log('--- Running Datto RMM Type Verification Script ---');

// This script verifies that the types generated and organized are correctly
// structured and exported. It does this by declaring variables with the
// imported types. If this file compiles without errors, the verification is successful.

// Verification for IDattoRmmCredentials
const credentials: IDattoRmmCredentials = {
	apiUrl: 'https://api.datto.com',
	apiKey: 'key123',
	apiSecretKey: 'secret456',
};
console.log('✅ IDattoRmmCredentials type verified.');

// Verification for Account
const account: Account = {
	uid: 'acc-uid-123',
	name: 'Test Account',
};
console.log('✅ Account type verified.');

// Verification for Site
const site: Site = {
	id: 1,
	uid: 'site-uid-456',
	name: 'Test Site',
	onDemand: false,
};
console.log('✅ Site type verified.');

// Verification for Device
const device: Device = {
	id: 101,
	uid: 'dev-uid-789',
	hostname: 'test-device-01',
	online: true,
	rebootRequired: false,
};
console.log('✅ Device type verified.');

// Verification for Alert
const alert: Alert = {
	alertUid: 'alert-uid-abc',
	priority: 'High',
	resolved: false,
	muted: false,
};
console.log('✅ Alert type verified.');

// Verification for Job
const job: Job = {
	id: 202,
	uid: 'job-uid-def',
	name: 'Test Job',
	status: 'completed',
};
console.log('✅ Job type verified.');

// Verification for User
const user: User = {
	id: 303,
	userName: 'test.user',
	firstName: 'Test',
	lastName: 'User',
};
console.log('✅ User type verified.');

console.log('\n--- Type Verification Complete: All types are correctly defined and exported. ---');
