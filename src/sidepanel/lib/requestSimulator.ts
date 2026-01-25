import type { DetailedRequest } from '../types';

export interface SimulationResult {
  success: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: unknown;
  error?: string;
  duration?: number;
}

// Extract CSRF token from request headers
function extractCsrfToken(headers?: Record<string, string>): string | null {
  if (!headers) return null;

  const csrfHeaderNames = [
    'csrf-token',
    'x-csrf-token',
    'xsrf-token',
    'x-xsrf-token',
    '_csrf',
    '_csrftoken',
  ];

  for (const name of csrfHeaderNames) {
    if (headers[name]) {
      return headers[name];
    }
  }

  return null;
}

// Store abort controller for current request
let currentAbortController: AbortController | null = null;

// Cancel ongoing request
export function cancelSimulation(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

// Simulate a request with timeout
export async function simulateRequest(request: DetailedRequest, timeoutMs = 30000): Promise<SimulationResult> {
  // Cancel any ongoing request
  cancelSimulation();

  const startTime = performance.now();
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  // Create timeout
  const timeoutId = setTimeout(() => {
    currentAbortController?.abort();
  }, timeoutMs);

  try {
    // Build headers
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
    };

    // Add CSRF token if present
    const csrfToken = extractCsrfToken(request.requestHeaders);
    if (csrfToken) {
      headers['Csrf-token'] = csrfToken;
    }

    // Copy important headers from original request
    if (request.requestHeaders) {
      const headersToForward = [
        'authorization',
        'content-type',
        'accept',
        'accept-language',
        'x-requested-with',
      ];

      for (const header of headersToForward) {
        if (request.requestHeaders[header]) {
          headers[header] = request.requestHeaders[header];
        }
      }
    }

    // Make the request
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      signal,
      mode: 'cors',
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase()) && request.requestBody) {
      fetchOptions.body = request.requestBody;
    }

    const response = await fetch(request.url, fetchOptions);
    clearTimeout(timeoutId);
    const duration = performance.now() - startTime;

    // Get response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Try to parse response as JSON, fallback to text
    let data: unknown;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    currentAbortController = null;

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      duration: Math.round(duration),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = performance.now() - startTime;
    currentAbortController = null;

    // Check if it was aborted
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request cancelled or timed out',
        duration: Math.round(duration),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Math.round(duration),
    };
  }
}

// Format response data for display
export function formatResponseData(data: unknown): string {
  if (typeof data === 'string') {
    // Try to parse and pretty print if it's JSON string
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  }

  return JSON.stringify(data, null, 2);
}
