import { useCallback, useEffect, useRef } from 'react';
import { isBroadcastMessage } from '@shared/messaging';
import { useRequestStore } from '../stores/requestStore';
import { fetchRequests, getActiveTabId, saveRequests } from '../lib/requestActions';
import { getRecentRequests, pruneExpiredRequests } from '../lib/storage';

/**
 * Keeps the store in sync with the service worker. Mount it exactly once, at the panel
 * root: it registers `chrome.runtime` and `chrome.tabs` listeners, and a second mount
 * would double every update.
 */
export function useRequestSync() {
  const setRequests = useRequestStore((state) => state.setRequests);
  const setLoading = useRequestStore((state) => state.setLoading);
  const activeTabIdRef = useRef<number | undefined>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      activeTabIdRef.current = await getActiveTabId();

      // The service worker may have been evicted since the panel was last open, so the
      // IndexedDB mirror is shown first and replaced as soon as live data arrives.
      const stored = await getRecentRequests();
      if (stored.length > 0) setRequests(stored);

      const live = await fetchRequests(activeTabIdRef.current);
      setRequests(live);
      await saveRequests(live);
    } catch (error) {
      console.error('Cannot refresh requests:', error);
    } finally {
      setLoading(false);
    }
  }, [setRequests, setLoading]);

  useEffect(() => {
    const handleMessage = (message: unknown) => {
      // Other extension pages share this port; the payload is narrowed before it is used.
      if (!isBroadcastMessage(message)) return;
      if (message.payload.tabId !== activeTabIdRef.current) return;

      setRequests(message.payload.requests);
      saveRequests(message.payload.requests).catch((error: unknown) =>
        console.error('Cannot persist requests:', error),
      );
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [setRequests]);

  useEffect(() => {
    const handleActivated = (activeInfo: chrome.tabs.OnActivatedInfo) => {
      activeTabIdRef.current = activeInfo.tabId;
      void refresh();
    };

    const handleUpdated = (tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo) => {
      if (changeInfo.status === 'loading' && tabId === activeTabIdRef.current) {
        void refresh();
      }
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
    };
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Once per mount: the mirror is append-only otherwise and grows without bound.
  useEffect(() => {
    pruneExpiredRequests().catch((error: unknown) =>
      console.error('Cannot prune the request mirror:', error),
    );
  }, []);

  return { refresh };
}
