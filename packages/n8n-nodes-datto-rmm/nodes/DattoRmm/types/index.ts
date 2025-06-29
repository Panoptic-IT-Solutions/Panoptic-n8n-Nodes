/**
 * Datto RMM Node Type Definitions
 *
 * This file exports all types for the Datto RMM node.
 * It follows a barrel file pattern for easy importing.
 */

// -----------------------------------------------------------------------------
// API Communication and Base Types
// -----------------------------------------------------------------------------

export * from './base/auth.types';
export * from './base/http.types';
export * from './base/errors';
export * from './base/pagination.types';

// -----------------------------------------------------------------------------
// Export types for each API resource
// -----------------------------------------------------------------------------

export * from './account.types';
export * from './activity-logs.types';
export * from './alert.types';
export * from './audit.types';
export * from './device.types';
export * from './filter.types';
export * from './job.types';
export * from './site.types';
export * from './system.types';
export * from './user.types';

// -----------------------------------------------------------------------------
// Export types for each API resource
// (These would be populated from the generated types)
// -----------------------------------------------------------------------------

/*
 * Example:
 *
 * export * from './account.types';
 * export * from './alert.types';
 * export * from './device.types';
 * export * from './job.types';
 * export * from './site.types';
 *
 */

// Export everything from the auto-generated file for now.
// You will later replace this with individual file exports
// once you've organized them as described in Phase 1.
export * from './datto-rmm-api';
