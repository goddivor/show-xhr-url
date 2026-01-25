import { memo } from 'react';
import { MethodBadge, StatusBadge } from './ui/Badge';
import type { DetailedRequest } from '../types';

interface RequestItemProps {
  request: DetailedRequest;
  isSelected: boolean;
  onClick: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getUrlPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

function getUrlDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.host;
  } catch {
    return '';
  }
}

export const RequestItem = memo(function RequestItem({
  request,
  isSelected,
  onClick,
}: RequestItemProps) {
  const path = getUrlPath(request.url);
  const domain = getUrlDomain(request.url);

  return (
    <div
      className={`devtools-row request-item ${isSelected ? 'devtools-row-selected' : ''}`}
      onClick={onClick}
    >
      <div className="request-method">
        <MethodBadge method={request.method} />
      </div>

      <div className="request-status">
        <StatusBadge status={request.statusCode} />
      </div>

      <div className="request-url">
        <span className="request-path">{path}</span>
        <span className="request-domain">{domain}</span>
      </div>

      <div className="request-size">
        {formatSize(request.responseSize)}
      </div>

      <div className="request-time">
        {formatTime(request.timestamp)}
      </div>
    </div>
  );
});
