import { useState } from 'react';
import { X, Download, FileJson, Terminal, FileText, Send } from 'lucide-react';
import { Button } from './ui/Button';
import { useFilteredRequests } from '../stores/requestStore';
import { useTheme } from '../hooks/useTheme';
import { exportAsJson, exportAsHar, exportAsCurl, exportAsPostman } from '../lib/export';
import type { ExportFormat, ExportOptions } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPORT_OPTIONS: { format: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  {
    format: 'json',
    label: 'JSON',
    icon: <FileJson size={20} />,
    description: 'Export as JSON array',
  },
  {
    format: 'har',
    label: 'HAR',
    icon: <FileText size={20} />,
    description: 'HTTP Archive format',
  },
  {
    format: 'curl',
    label: 'cURL',
    icon: <Terminal size={20} />,
    description: 'cURL commands',
  },
  {
    format: 'postman',
    label: 'Postman',
    icon: <Send size={20} />,
    description: 'Postman collection',
  },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const filteredRequests = useFilteredRequests();
  const { isDark } = useTheme();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const iconColor = isDark ? '#9aa0a6' : '#5f6368';

  if (!isOpen) return null;

  const handleExport = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      includeHeaders,
      includeBody: false,
    };

    switch (selectedFormat) {
      case 'json':
        exportAsJson(filteredRequests, options);
        break;
      case 'har':
        exportAsHar(filteredRequests, options);
        break;
      case 'curl':
        exportAsCurl(filteredRequests, options);
        break;
      case 'postman':
        exportAsPostman(filteredRequests, options);
        break;
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Export Requests</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={14} color={iconColor} />
          </Button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Export {filteredRequests.length} requests
          </p>

          <div className="export-options">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.format}
                className={`export-option ${selectedFormat === option.format ? 'selected' : ''}`}
                onClick={() => setSelectedFormat(option.format)}
              >
                <span className="export-option-icon">{option.icon}</span>
                <div>
                  <div className="export-option-label">{option.label}</div>
                  <div className="export-option-description">{option.description}</div>
                </div>
              </button>
            ))}
          </div>

          <label className="export-checkbox">
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
            />
            <span>Include headers</span>
          </label>

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport}>
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
