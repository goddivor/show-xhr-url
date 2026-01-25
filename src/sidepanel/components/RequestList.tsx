import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RequestItem } from './RequestItem';
import { useRequestStore, useFilteredRequests } from '../stores/requestStore';
import type { DetailedRequest } from '../types';

export function RequestList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const filteredRequests = useFilteredRequests();
  const { selectedRequest, selectRequest } = useRequestStore();

  // Sort by timestamp (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => b.timestamp - a.timestamp);

  const virtualizer = useVirtualizer({
    count: sortedRequests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  const handleSelect = useCallback((request: DetailedRequest) => {
    selectRequest(selectedRequest?.id === request.id ? null : request);
  }, [selectRequest, selectedRequest?.id]);

  if (sortedRequests.length === 0) {
    return (
      <div className="request-list-empty">
        <div className="request-list-empty-text">
          <p>No requests captured</p>
          <p>Browse a page to see network requests</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="request-list">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const request = sortedRequests[virtualItem.index];
          return (
            <div
              key={request.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <RequestItem
                request={request}
                isSelected={selectedRequest?.id === request.id}
                onClick={() => handleSelect(request)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
