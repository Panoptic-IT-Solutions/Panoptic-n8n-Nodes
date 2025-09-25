/**
 * Type definitions for Datto RMM Activity Log operations
 */

export interface IActivityLog {
	/** Unique identifier for the activity */
	id?: string;

	/** Timestamp when the activity occurred */
	activityTime: string;

	/** Type of activity that occurred */
	activityType: string;

	/** User who performed the activity */
	userName?: string;

	/** User ID who performed the activity */
	userId?: string;

	/** Device involved in the activity */
	deviceName?: string;

	/** Device ID involved in the activity */
	deviceId?: string;

	/** Site where the activity occurred */
	siteName?: string;

	/** Site ID where the activity occurred */
	siteId?: string;

	/** Human-readable message describing the activity */
	message: string;

	/** Severity level of the activity */
	severity?: 'low' | 'medium' | 'high' | 'critical';

	/** Current status of the activity */
	status?: string;

	/** Result of the activity if applicable */
	activityResult?: 'success' | 'failure' | 'pending' | 'cancelled';

	/** Priority level of the activity */
	priority?: 'none' | 'low' | 'medium' | 'high' | 'critical';

	/** Source configuration UID that triggered the activity */
	sourceConfigUid?: string;

	/** Name of the source that triggered the activity */
	sourceName?: string;

	/** Subject or title of the activity */
	subject?: string;

	/** Additional data related to the activity */
	data?: Record<string, any>;

	/** Series UID for related activities */
	seriesUid?: string;

	/** Status code for the activity */
	statusCode?: string;

	/** Type classification */
	type?: string;
}

export interface IActivityLogFilters {
	/** Start date for filtering activities */
	dateFrom?: string;

	/** End date for filtering activities */
	dateTo?: string;

	/** Filter by activity types */
	activityType?: string[];

	/** Filter by user ID */
	userId?: string;

	/** Filter by device ID */
	deviceId?: string;

	/** Filter by site ID */
	siteId?: string;

	/** Filter by severity level */
	severity?: 'low' | 'medium' | 'high' | 'critical';

	/** Field to sort results by */
	sortBy?: 'activityTime' | 'activityType' | 'userName' | 'deviceName' | 'siteName' | 'severity';

	/** Sort order */
	sortOrder?: 'asc' | 'desc';

	/** Maximum number of results to return */
	limit?: number;

	/** Offset for pagination */
	offset?: number;
}

export interface IActivityLogSearchOptions extends IActivityLogFilters {
	/** Text to search for in activity logs */
	search: string;

	/** Whether the search should be case sensitive */
	caseSensitive?: boolean;
}

export interface IActivityLogResponse {
	/** Array of activity log entries */
	data: IActivityLog[];

	/** Total number of activities found */
	total?: number;

	/** Number of activities returned in this response */
	count?: number;

	/** Pagination information */
	pagination?: {
		offset: number;
		limit: number;
		hasMore: boolean;
	};
}

export interface IDeviceActivityOptions {
	/** Device UID to get activities for */
	deviceUid: string;

	/** Whether to return all results */
	returnAll?: boolean;

	/** Maximum number of results */
	limit?: number;

	/** Date range and filtering options */
	dateFrom?: string;
	dateTo?: string;
	activityType?: string[];
}

export interface ISiteActivityOptions {
	/** Site UID to get activities for */
	siteUid: string;

	/** Whether to return all results */
	returnAll?: boolean;

	/** Maximum number of results */
	limit?: number;

	/** Date range and filtering options */
	dateFrom?: string;
	dateTo?: string;
	activityType?: string[];

	/** Whether to include device activities from this site */
	includeDevices?: boolean;
}

export interface IUserActivityOptions {
	/** User ID to get activities for */
	userId: string;

	/** Whether to return all results */
	returnAll?: boolean;

	/** Maximum number of results */
	limit?: number;

	/** Date range and filtering options */
	dateFrom?: string;
	dateTo?: string;
	activityType?: string[];
}

export interface IActivityLogOutputOptions {
	/** Include detailed user information */
	includeUserDetails?: boolean;

	/** Include detailed device information */
	includeDeviceDetails?: boolean;

	/** Include detailed site information */
	includeSiteDetails?: boolean;

	/** Specific columns to select */
	fields?: string[];
}

/**
 * Common activity types found in Datto RMM
 */
export enum ActivityType {
	LOGIN = 'login',
	LICENSING = 'licensing',
	PASSWORD_RESET = 'password_reset',
	TWO_FACTOR_RESET = 'two_factor_reset',
	SUPPORT_ACCESS = 'support_access',
	USER_MANAGEMENT = 'user_management',
	DEVICE_MANAGEMENT = 'device_management',
	SITE_MANAGEMENT = 'site_management',
	POLICY_DEPLOYMENT = 'policy_deployment',
	MONITOR_MANAGEMENT = 'monitor_management',
	COMPONENT_ACTIVITY = 'component_activity',
	JOB_EXECUTION = 'job_execution',
	REPORT_ACTIVITY = 'report_activity',
	DEVICE_CONNECTION = 'device_connection',
	DEVICE_CONFIGURATION = 'device_configuration',
	MONITOR_ACTIVITY = 'monitor_activity',
	COMPONENT_EXECUTION = 'component_execution',
	POLICY_CHANGES = 'policy_changes',
	SOFTWARE_CHANGES = 'software_changes',
	HARDWARE_CHANGES = 'hardware_changes',
}

/**
 * Device-specific activity types
 */
export enum DeviceActivityType {
	CONNECTION = 'device_connection',
	CONFIGURATION = 'device_configuration',
	MONITOR_ACTIVITY = 'monitor_activity',
	COMPONENT_EXECUTION = 'component_execution',
	JOB_EXECUTION = 'job_execution',
	POLICY_CHANGES = 'policy_changes',
	SOFTWARE_CHANGES = 'software_changes',
	HARDWARE_CHANGES = 'hardware_changes',
}

/**
 * Site-specific activity types
 */
export enum SiteActivityType {
	SITE_MANAGEMENT = 'site_management',
	DEVICE_MANAGEMENT = 'device_management',
	POLICY_DEPLOYMENT = 'policy_deployment',
	USER_ACCESS = 'user_access',
	MONITOR_ACTIVITY = 'monitor_activity',
	COMPONENT_ACTIVITY = 'component_activity',
	JOB_EXECUTION = 'job_execution',
}

/**
 * User-specific activity types
 */
export enum UserActivityType {
	LOGIN = 'login',
	PASSWORD_CHANGES = 'password_changes',
	TWO_FACTOR_ACTIVITY = 'two_factor_activity',
	USER_MANAGEMENT = 'user_management',
	DEVICE_ACCESS = 'device_access',
	SITE_ACCESS = 'site_access',
	CONFIGURATION_CHANGES = 'configuration_changes',
	REPORT_ACTIVITY = 'report_activity',
}

/**
 * Severity levels for activities
 */
export enum ActivitySeverity {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical',
}

/**
 * Activity results
 */
export enum ActivityResult {
	SUCCESS = 'success',
	FAILURE = 'failure',
	PENDING = 'pending',
	CANCELLED = 'cancelled',
}

/**
 * Priority levels
 */
export enum ActivityPriority {
	NONE = 'none',
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical',
}
