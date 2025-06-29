import type { IDataObject } from 'n8n-workflow';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface IRequestConfig {
	method: HttpMethod;
	endpoint: string;
	body?: IDataObject;
	query?: IDataObject;
}

export interface IHttpResponse<T = IDataObject> {
	data: T;
	headers: Record<string, string>;
	status: number;
}
