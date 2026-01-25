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
      headers: options.includeHeaders && req.requestHeaders
        ? Object.entries(req.requestHeaders).map(([name, value]) => ({ name, value }))
        : [],
      queryString: [],
      headersSize: -1,
      bodySize: -1,
    },
    response: {
      status: req.statusCode || 0,
      statusText: '',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: options.includeHeaders && req.responseHeaders
        ? Object.entries(req.responseHeaders).map(([name, value]) => ({ name, value }))
        : [],
      content: {
        size: req.responseSize || 0,
        mimeType: req.contentType || '',
      },
      redirectURL: '',
      headersSize: -1,
      bodySize: req.responseSize || -1,
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

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
