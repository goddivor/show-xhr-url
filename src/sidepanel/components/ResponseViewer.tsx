import { useState } from 'react';
import { Copy, Check, Download, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '../hooks/useTheme';
import type { SimulationResult } from '../lib/requestSimulator';
import { formatResponseData } from '../lib/requestSimulator';

interface ResponseViewerProps {
  result: SimulationResult;
  onClose: () => void;
}

type Tab = 'body' | 'headers';

export function ResponseViewer({ result, onClose }: ResponseViewerProps) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('body');
  const [copied, setCopied] = useState(false);

  const iconColor = isDark ? '#9aa0a6' : '#5f6368';
  const formattedData = result.data ? formatResponseData(result.data) : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'body', label: 'Response Body' },
    { id: 'headers', label: 'Headers' },
  ];

  const statusClass = result.success
    ? 'status-success'
    : 'status-error';

  return (
    <div className="response-viewer">
      <div className="response-viewer-header">
        <div className="response-viewer-status">
          <span className={`response-status-badge ${statusClass}`}>
            {result.status || 'Error'} {result.statusText || ''}
          </span>
          {result.duration && (
            <span className="response-duration">{result.duration}ms</span>
          )}
        </div>
        <div className="response-viewer-actions">
          <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy response">
            {copied ? (
              <Check size={14} color="#34a853" />
            ) : (
              <Copy size={14} color={iconColor} />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download JSON">
            <Download size={14} color={iconColor} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close">
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

      <div className="response-viewer-content">
        {result.error ? (
          <div className="response-error">
            <strong>Error:</strong> {result.error}
          </div>
        ) : (
          <>
            {activeTab === 'body' && (
              <pre className="response-body">{formattedData}</pre>
            )}
            {activeTab === 'headers' && result.headers && (
              <div className="request-details-table">
                {Object.entries(result.headers).map(([key, value]) => (
                  <div key={key} className="request-details-row">
                    <div className="request-details-key">{key}</div>
                    <div className="request-details-value">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
