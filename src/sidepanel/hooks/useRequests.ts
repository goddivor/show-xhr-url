import { useEffect, useCallback, useRef } from 'react';
import { useRequestStore } from '../stores/requestStore';
import { saveRequests, getRecentRequests, clearAllRequests } from '../lib/storage';
import type { DetailedRequest } from '../types';

// Generate unique ID for requests
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useRequests() {
  const { setRequests, clearRequests, setLoading } = useRequestStore();
  const currentTabIdRef = useRef<number | null>(null);

  // Get and track current tab
  const getCurrentTab = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        currentTabIdRef.current = tab.id;
        return tab.id;
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
    return null;
  }, []);

  // Fetch requests from background script
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Get current tab ID
      await getCurrentTab();

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
  }, [setRequests, setLoading, getCurrentTab]);

  // Clear all requests
  const handleClearRequests = useCallback(async () => {
    try {
      // Get current tab
      const tabId = await getCurrentTab();
      if (tabId) {
        // Clear in background
        await chrome.runtime.sendMessage({
          type: 'CLEAR_TAB_REQUESTS',
          payload: { tabId },
        });
      }
      // Clear in IndexedDB
      await clearAllRequests();
      // Clear in store
      clearRequests();
    } catch (error) {
      console.error('Error clearing requests:', error);
    }
  }, [clearRequests, getCurrentTab]);

  // Listen for new requests from background
  useEffect(() => {
    const handleMessage = async (message: { type: string; payload?: { requests?: DetailedRequest[]; tabId?: number } }) => {
      if (message.type === 'UPDATE_REQUESTS' && message.payload?.requests) {
        // Get current tab to verify
        const currentTabId = currentTabIdRef.current || (await getCurrentTab());

        // Only update if this is for our current tab
        if (message.payload.tabId === currentTabId) {
          const requestsWithIds = message.payload.requests.map((req: DetailedRequest) => ({
            ...req,
            id: req.id || generateId(),
          }));
          setRequests(requestsWithIds);
          // Save to IndexedDB
          saveRequests(requestsWithIds).catch(console.error);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [setRequests, getCurrentTab]);

  // Track tab changes
  useEffect(() => {
    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      currentTabIdRef.current = activeInfo.tabId;
      // Fetch requests for new tab
      fetchRequests();
    };

    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      // When tab navigates, refresh requests
      if (changeInfo.status === 'loading' && tabId === currentTabIdRef.current) {
        // Small delay to allow background to capture initial requests
        setTimeout(() => {
          fetchRequests();
        }, 100);
      }
    };

    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    };
  }, [fetchRequests]);

  // Fetch on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    fetchRequests,
    clearRequests: handleClearRequests,
  };
}
