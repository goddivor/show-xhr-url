import { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { useRequestStore } from '../stores/requestStore';
import { useTheme } from '../hooks/useTheme';
import type { DetailedRequest } from '../types';

type Tab = 'headers' | 'request' | 'response';

function HeadersTable({ headers }: { headers?: Record<string, string> }) {
  if (!headers || Object.keys(headers).length === 0) {
    return (
      <div className="request-details-table" style={{ padding: '8px', color: 'var(--text-secondary)' }}>
        No headers
      </div>
    );
  }

  return (
    <div className="request-details-table">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="request-details-row">
          <div className="request-details-key">{key}</div>
          <div className="request-details-value">{value}</div>
        </div>
      ))}
    </div>
  );
}

function GeneralInfo({ request }: { request: DetailedRequest }) {
  return (
    <div className="request-details-table">
      <div className="request-details-row">
        <div className="request-details-key">Request URL</div>
        <div className="request-details-value">{request.url}</div>
      </div>
      <div className="request-details-row">
        <div className="request-details-key">Request Method</div>
        <div className="request-details-value">{request.method}</div>
      </div>
      <div className="request-details-row">
        <div className="request-details-key">Status Code</div>
        <div className="request-details-value">{request.statusCode || 'Pending'}</div>
      </div>
      {request.contentType && (
        <div className="request-details-row">
          <div className="request-details-key">Content-Type</div>
          <div className="request-details-value">{request.contentType}</div>
        </div>
      )}
      {request.responseSize && (
        <div className="request-details-row">
          <div className="request-details-key">Size</div>
          <div className="request-details-value">{request.responseSize} bytes</div>
        </div>
      )}
      {request.referer && (
        <div className="request-details-row">
          <div className="request-details-key">Referer</div>
          <div className="request-details-value">{request.referer}</div>
        </div>
      )}
    </div>
  );
}

export function RequestDetails() {
  const { selectedRequest, selectRequest } = useRequestStore();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('headers');
  const [copied, setCopied] = useState(false);

  const iconColor = isDark ? '#9aa0a6' : '#5f6368';

  if (!selectedRequest) return null;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(selectedRequest.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInTab = () => {
    window.open(selectedRequest.url, '_blank');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'headers', label: 'Headers' },
    { id: 'request', label: 'Request Headers' },
    { id: 'response', label: 'Response Headers' },
  ];

  return (
    <div className="request-details">
      <div className="request-details-header">
        <span className="request-details-title">
          {selectedRequest.method} {new URL(selectedRequest.url).pathname}
        </span>
        <div className="request-details-actions">
          <Button variant="ghost" size="sm" onClick={handleCopyUrl} title="Copy URL">
            {copied ? (
              <Check size={14} color="#34a853" />
            ) : (
              <Copy size={14} color={iconColor} />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenInTab} title="Open in new tab">
            <ExternalLink size={14} color={iconColor} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectRequest(null)} title="Close">
            <X size={14} color={iconColor} />
          </Button>
        </div>
      </div>

      <div className="devtools-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`devtools-tab ${activeTab === tab.id ? 'devtools-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="request-details-content">
        {activeTab === 'headers' && <GeneralInfo request={selectedRequest} />}
        {activeTab === 'request' && <HeadersTable headers={selectedRequest.requestHeaders} />}
        {activeTab === 'response' && <HeadersTable headers={selectedRequest.responseHeaders} />}
      </div>
    </div>
  );
}
