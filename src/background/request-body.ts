/** Decoding of the raw upload payload Chrome hands over with `extraInfoSpec: ['requestBody']`. */

const decoder = new TextDecoder('utf-8');

function decodeFormData(formData: Record<string, chrome.webRequest.FormDataItem[]>): string {
  const flattened: Record<string, string> = {};

  for (const [key, values] of Object.entries(formData)) {
    flattened[key] = values
      .map((value) => (typeof value === 'string' ? value : decoder.decode(value)))
      .join(', ');
  }
  return JSON.stringify(flattened);
}

function decodeRaw(raw: chrome.webRequest.UploadData[]): string {
  return raw.map((chunk) => (chunk.bytes ? decoder.decode(chunk.bytes) : '')).join('');
}

/**
 * Returns the request body as text, or `undefined` when there is none. Binary payloads
 * are reported as a placeholder rather than as mojibake, so the side panel can tell the
 * difference between "no body" and "a body we cannot show".
 */
export function extractRequestBody(
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody'],
): string | undefined {
  if (!requestBody) return undefined;

  if (requestBody.formData) {
    return decodeFormData(requestBody.formData);
  }

  if (requestBody.raw && requestBody.raw.length > 0) {
    try {
      return decodeRaw(requestBody.raw);
    } catch {
      return '[binary data]';
    }
  }

  return undefined;
}
