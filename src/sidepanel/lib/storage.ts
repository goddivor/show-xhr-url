import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DetailedRequest } from '@shared/types';

/**
 * The side panel's durable mirror of what the service worker captured.
 *
 * A Manifest V3 service worker is evicted after roughly thirty seconds of inactivity and
 * loses everything it held, so the panel writes each update here and reads it back on the
 * next open. IndexedDB rather than `chrome.storage.local`, because a busy page produces
 * tens of megabytes of headers and bodies, far past what the sync-style storage areas hold.
 */

interface RequestDB extends DBSchema {
  requests: {
    key: string;
    value: DetailedRequest;
    indexes: {
      'by-timestamp': number;
      'by-tab': number;
    };
  };
}

const DB_NAME = 'showxhrurl';
const DB_VERSION = 1;

/** Requests older than this are dropped on open. Anything older is not being debugged. */
const RETENTION_MS = 24 * 60 * 60 * 1000;

let dbPromise: Promise<IDBPDatabase<RequestDB>> | null = null;

function getDB(): Promise<IDBPDatabase<RequestDB>> {
  dbPromise ??= openDB<RequestDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
        store.createIndex('by-tab', 'tabId');
      }
    },
  });
  return dbPromise;
}

export async function saveRequests(requests: DetailedRequest[]): Promise<void> {
  if (requests.length === 0) return;

  const db = await getDB();
  const tx = db.transaction('requests', 'readwrite');
  await Promise.all([...requests.map((request) => tx.store.put(request)), tx.done]);
}

/** Most recent first, which is the order the list renders in. */
export async function getRecentRequests(limit = 1000): Promise<DetailedRequest[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('requests', 'by-timestamp');
  return all.reverse().slice(0, limit);
}

export async function clearAllRequests(): Promise<void> {
  const db = await getDB();
  await db.clear('requests');
}

/**
 * Drops everything past the retention window. Without this the database only ever grows:
 * the panel writes on every broadcast and only a manual clear ever deletes anything.
 */
export async function pruneExpiredRequests(now = Date.now()): Promise<number> {
  const db = await getDB();
  const cutoff = now - RETENTION_MS;
  const expired = await db.getAll('requests');
  const doomed = expired.filter((request) => request.timestamp < cutoff);
  if (doomed.length === 0) return 0;

  const tx = db.transaction('requests', 'readwrite');
  await Promise.all([...doomed.map((request) => tx.store.delete(request.id)), tx.done]);
  return doomed.length;
}
