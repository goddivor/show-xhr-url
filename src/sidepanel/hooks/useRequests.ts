import { useEffect, useCallback } from 'react';
import { useRequestStore } from '../stores/requestStore';
import { saveRequests, getRecentRequests, clearAllRequests } from '../lib/storage';
import type { DetailedRequest } from '../types';

// Generate unique ID for requests
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useRequests() {
  const { setRequests, clearRequests, setLoading } = useRequestStore();

  // Fetch requests from background script
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // First, load from IndexedDB for persistence
      const storedRequests = await getRecentRequests();
      if (storedRequests.length > 0) {
        setRequests(storedRequests);
      }

      // Then fetch current tab requests from background
      const response = await chrome.runtime.sendMessage({ type: 'GET_DETAILED_REQUESTS' });
      if (response && Array.isArray(response.requests)) {
        const requestsWithIds = response.requests.map((req: DetailedRequest) => ({
          ...req,
          id: req.id || generateId(),
        }));
        setRequests(requestsWithIds);
        // Save to IndexedDB for persistence
        await saveRequests(requestsWithIds);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [setRequests, setLoading]);

  // Clear all requests
  const handleClearRequests = useCallback(async () => {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        // Clear in background
        await chrome.runtime.sendMessage({
          type: 'CLEAR_TAB_REQUESTS',
          payload: { tabId: tab.id },
        });
      }
      // Clear in IndexedDB
      await clearAllRequests();
      // Clear in store
      clearRequests();
    } catch (error) {
      console.error('Error clearing requests:', error);
    }
  }, [clearRequests]);

  // Listen for new requests from background
  useEffect(() => {
    const handleMessage = (message: { type: string; payload?: { requests?: DetailedRequest[]; tabId?: number } }) => {
      if (message.type === 'UPDATE_REQUESTS' && message.payload?.requests) {
        const requestsWithIds = message.payload.requests.map((req: DetailedRequest) => ({
          ...req,
          id: req.id || generateId(),
        }));
        setRequests(requestsWithIds);
        // Save to IndexedDB
        saveRequests(requestsWithIds).catch(console.error);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [setRequests]);

  // Fetch on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    fetchRequests,
    clearRequests: handleClearRequests,
  };
}
