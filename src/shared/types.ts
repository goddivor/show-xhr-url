/**
 * The single source of truth for the shapes exchanged between the three extension
 * contexts (service worker, content scripts, side panel). Nothing here may import
 * from a context-specific module: it would drag that context's globals into the others.
 */

/** How the browser classified the resource behind a request. */
export type RequestType =
  | 'xmlhttprequest'
  | 'fetch'
  | 'document'
  | 'sub_frame'
  | 'script'
  | 'stylesheet'
  | 'image'
  | 'font'
  | 'media'
  | 'websocket'
  | 'ping'
  | 'csp_report'
  | 'object'
  | 'other';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/** Where the lifecycle of a captured request currently sits. */
export type RequestStatus = 'pending' | 'complete' | 'failed';

/**
 * One captured network request, enriched progressively as the webRequest lifecycle
 * fires. `id` is the browser's own `requestId`, which is stable across every stage of
 * a single request and is what correlates the events together.
 */
export interface DetailedRequest {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  status: RequestStatus;
  tabId: number;
  requestType: RequestType;
  /** Set only when the MAIN-world hook saw the page call `fetch` or `XMLHttpRequest`. */
  initiator?: 'xhr' | 'fetch' | undefined;
  statusCode?: number | undefined;
  statusLine?: string | undefined;
  responseSize?: number | undefined;
  contentType?: string | undefined;
  requestHeaders?: Record<string, string> | undefined;
  responseHeaders?: Record<string, string> | undefined;
  requestBody?: string | undefined;
  ip?: string | undefined;
  fromCache?: boolean | undefined;
  durationMs?: number | undefined;
  error?: string | undefined;
  tabUrl?: string | undefined;
  referer?: string | undefined;
  origin?: string | undefined;
}

export interface RequestFilters {
  method: string;
  search: string;
  statusCode: string;
  contentType: string;
  requestType: string;
}

export type ExportFormat = 'json' | 'har' | 'curl' | 'postman';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeBody: boolean;
}
