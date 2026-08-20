/** Header helpers shared by the webRequest listeners. */

/**
 * Flattens Chrome's `{name, value}[]` header list into a lookup object.
 * Names are lower-cased because HTTP header names are case-insensitive and every
 * consumer in this codebase looks them up in lower case.
 */
export function headersToRecord(
  headers: chrome.webRequest.HttpHeader[] | undefined,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headers) return result;

  for (const header of headers) {
    if (header.name && typeof header.value === 'string') {
      result[header.name.toLowerCase()] = header.value;
    }
  }
  return result;
}

/** Reads `content-length` defensively — servers send it malformed often enough to matter. */
export function parseContentLength(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
