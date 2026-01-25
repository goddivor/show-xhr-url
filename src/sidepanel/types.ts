export interface DetailedRequest {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  statusCode?: number;
  responseSize?: number;
  contentType?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  ip?: string;
  tabId: number;
  tabUrl?: string;
  referer?: string;
  origin?: string;
}

export interface RequestFilters {
  method: string;
  search: string;
  statusCode: string;
  contentType: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type ExportFormat = 'json' | 'har' | 'curl';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeBody: boolean;
}
