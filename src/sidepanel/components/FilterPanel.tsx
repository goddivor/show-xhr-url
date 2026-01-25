import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { useRequestStore } from '../stores/requestStore';
import { useTheme } from '../hooks/useTheme';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: '2', label: '2xx Success' },
  { value: '3', label: '3xx Redirect' },
  { value: '4', label: '4xx Client Error' },
  { value: '5', label: '5xx Server Error' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'css', label: 'CSS' },
  { value: 'image', label: 'Image' },
  { value: 'font', label: 'Font' },
];

const REQUEST_TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'xmlhttprequest', label: 'XHR' },
  { value: 'fetch', label: 'Fetch' },
  { value: 'document', label: 'Document' },
  { value: 'script', label: 'Script' },
  { value: 'stylesheet', label: 'Stylesheet' },
  { value: 'image', label: 'Image' },
  { value: 'font', label: 'Font' },
];

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const { filters, setFilters } = useRequestStore();
  const { isDark } = useTheme();
  const iconColor = isDark ? '#9aa0a6' : '#5f6368';

  if (!isOpen) return null;

  const handleReset = () => {
    setFilters({
      statusCode: '',
      contentType: '',
      requestType: '',
    });
  };

  const hasFilters = filters.statusCode || filters.contentType || filters.requestType;

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <span className="filter-panel-title">Advanced Filters</span>
        <div className="filter-panel-actions">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={14} color={iconColor} />
          </Button>
        </div>
      </div>

      <div className="filter-panel-grid">
        <div className="filter-panel-field">
          <label>Status Code</label>
          <select
            value={filters.statusCode}
            onChange={(e) => setFilters({ statusCode: e.target.value })}
            className="devtools-input"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-panel-field">
          <label>Content Type</label>
          <select
            value={filters.contentType}
            onChange={(e) => setFilters({ contentType: e.target.value })}
            className="devtools-input"
          >
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-panel-field">
          <label>Request Type</label>
          <select
            value={filters.requestType}
            onChange={(e) => setFilters({ requestType: e.target.value })}
            className="devtools-input"
          >
            {REQUEST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
