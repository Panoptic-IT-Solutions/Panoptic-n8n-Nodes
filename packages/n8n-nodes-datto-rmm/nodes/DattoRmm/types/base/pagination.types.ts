export interface IPaginationData {
	count: number;
	totalCount: number;
	prevPageUrl: string | null;
	nextPageUrl: string | null;
}

// For endpoints like /activity-logs
export interface IActivityLogPagination {
	searchAfter: string[];
	// ...other relevant properties
}
