import type { DetailedRequest, ExportOptions } from '../types';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsJson(requests: DetailedRequest[], options: ExportOptions) {
  const data = requests.map((req) => {
    const base = {
      url: req.url,
      method: req.method,
      statusCode: req.statusCode,
      timestamp: new Date(req.timestamp).toISOString(),
      contentType: req.contentType,
      responseSize: req.responseSize,
    };

    if (options.includeHeaders) {
      return {
        ...base,
        requestHeaders: req.requestHeaders,
        responseHeaders: req.responseHeaders,
      };
    }

    return base;
  });

  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(json, `requests-${timestamp}.json`, 'application/json');
}

export function exportAsHar(requests: DetailedRequest[], options: ExportOptions) {
  const entries = requests.map((req) => ({
    startedDateTime: new Date(req.timestamp).toISOString(),
    time: 0,
    request: {
      method: req.method,
      url: req.url,
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers:
        options.includeHeaders && req.requestHeaders
          ? Object.entries(req.requestHeaders).map(([name, value]) => ({ name, value }))
          : [],
      queryString: [],
      headersSize: -1,
      bodySize: -1,
    },
    response: {
      status: req.statusCode ?? 0,
      statusText: '',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers:
        options.includeHeaders && req.responseHeaders
          ? Object.entries(req.responseHeaders).map(([name, value]) => ({ name, value }))
          : [],
      content: {
        size: req.responseSize ?? 0,
        mimeType: req.contentType ?? '',
      },
      redirectURL: '',
      headersSize: -1,
      bodySize: req.responseSize ?? -1,
    },
    cache: {},
    timings: {
      send: 0,
      wait: 0,
      receive: 0,
    },
  }));

  const har = {
    log: {
      version: '1.2',
      creator: {
        name: 'ShowXhrUrl',
        version: '2.0.0',
      },
      entries,
    },
  };

  const json = JSON.stringify(har, null, 2);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(json, `requests-${timestamp}.har`, 'application/json');
}

export function exportAsCurl(requests: DetailedRequest[], options: ExportOptions) {
  const commands = requests.map((req) => {
    let cmd = `curl -X ${req.method} '${req.url}'`;

    if (options.includeHeaders && req.requestHeaders) {
      Object.entries(req.requestHeaders).forEach(([name, value]) => {
        // Skip some headers that curl handles automatically
        if (['host', 'content-length', 'connection'].includes(name.toLowerCase())) {
          return;
        }
        cmd += ` \\\n  -H '${name}: ${value.replace(/'/g, "'\\''")}'`;
      });
    }

    return cmd;
  });

  const content = commands.join('\n\n# ---\n\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(content, `requests-${timestamp}.sh`, 'text/plain');
}

export function exportAsPostman(requests: DetailedRequest[], options: ExportOptions) {
  const timestamp = new Date().toISOString().slice(0, 10);

  const items = requests.map((req) => {
    // Parse URL for query params
    const queryParams: { key: string; value: string }[] = [];

    try {
      const urlObj = new URL(req.url);

      urlObj.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });
    } catch {
      // Keep original URL if parsing fails
    }

    const headers: { key: string; value: string; type: string }[] = [];
    if (options.includeHeaders && req.requestHeaders) {
      Object.entries(req.requestHeaders).forEach(([key, value]) => {
        // Skip some headers that Postman handles automatically
        if (!['host', 'content-length', 'connection'].includes(key.toLowerCase())) {
          headers.push({ key, value, type: 'text' });
        }
      });
    }

    return {
      name: `${req.method} ${new URL(req.url).pathname}`,
      request: {
        method: req.method,
        header: headers,
        url: {
          raw: req.url,
          protocol: new URL(req.url).protocol.replace(':', ''),
          host: new URL(req.url).hostname.split('.'),
          path: new URL(req.url).pathname.split('/').filter(Boolean),
          query: queryParams.length > 0 ? queryParams : undefined,
        },
      },
      response: [],
    };
  });

  const collection = {
    info: {
      _postman_id: crypto.randomUUID(),
      name: `ShowXhrUrl Export - ${timestamp}`,
      description: `Exported ${requests.length} requests from ShowXhrUrl`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: items,
  };

  const json = JSON.stringify(collection, null, 2);
  downloadFile(json, `postman-collection-${timestamp}.json`, 'application/json');
}

/**
 * The `document.execCommand('copy')` fallback that used to live here was removed: it is
 * deprecated, and the async Clipboard API is available in every Chromium version that
 * supports Manifest V3 side panels, so the fallback was unreachable dead code.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Cannot write to the clipboard:', error);
    return false;
  }
}
