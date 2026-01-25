import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DetailedRequest } from '../types';

interface RequestDB extends DBSchema {
  requests: {
    key: string;
    value: DetailedRequest;
    indexes: {
      'by-timestamp': number;
      'by-tab': number;
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'showxhrurl';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RequestDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<RequestDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RequestDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Requests store
        if (!db.objectStoreNames.contains('requests')) {
          const requestStore = db.createObjectStore('requests', { keyPath: 'id' });
          requestStore.createIndex('by-timestamp', 'timestamp');
          requestStore.createIndex('by-tab', 'tabId');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// Request storage functions
export async function saveRequest(request: DetailedRequest): Promise<void> {
  const db = await getDB();
  await db.put('requests', request);
}

export async function saveRequests(requests: DetailedRequest[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('requests', 'readwrite');
  await Promise.all([
    ...requests.map((req) => tx.store.put(req)),
    tx.done,
  ]);
}

export async function getRequests(tabId?: number): Promise<DetailedRequest[]> {
  const db = await getDB();
  if (tabId !== undefined) {
    return db.getAllFromIndex('requests', 'by-tab', tabId);
  }
  return db.getAll('requests');
}

export async function getRecentRequests(limit: number = 1000): Promise<DetailedRequest[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('requests', 'by-timestamp');
  // Return most recent first
  return all.reverse().slice(0, limit);
}

export async function deleteRequest(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('requests', id);
}

export async function deleteRequestsByTab(tabId: number): Promise<void> {
  const db = await getDB();
  const requests = await db.getAllFromIndex('requests', 'by-tab', tabId);
  const tx = db.transaction('requests', 'readwrite');
  await Promise.all([
    ...requests.map((req) => tx.store.delete(req.id)),
    tx.done,
  ]);
}

export async function clearAllRequests(): Promise<void> {
  const db = await getDB();
  await db.clear('requests');
}

export async function cleanOldRequests(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
  const db = await getDB();
  const cutoff = Date.now() - maxAge;
  const all = await db.getAll('requests');
  const toDelete = all.filter((req) => req.timestamp < cutoff);

  if (toDelete.length > 0) {
    const tx = db.transaction('requests', 'readwrite');
    await Promise.all([
      ...toDelete.map((req) => tx.store.delete(req.id)),
      tx.done,
    ]);
  }
}

// Settings storage functions
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDB();
  const value = await db.get('settings', key);
  return (value as T) ?? defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}
