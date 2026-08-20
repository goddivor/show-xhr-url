import { Search, X, Filter } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useRequestStore } from '../stores/requestStore';
import { useTheme } from '../hooks/useTheme';

const HTTP_METHODS = ['all', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

interface ToolbarProps {
  onOpenFilters: () => void;
}

export function Toolbar({ onOpenFilters }: ToolbarProps) {
  const { filters, setFilters } = useRequestStore();
  const { isDark } = useTheme();
  const iconColor = isDark ? '#9aa0a6' : '#5f6368';
  const accentColor = isDark ? '#8ab4f8' : '#1a73e8';

  const hasActiveFilters = Boolean(filters.statusCode || filters.contentType);

  return (
    <div className="toolbar">
      <div className="toolbar-search">
        <div className="toolbar-search-input">
          <Input
            type="text"
            placeholder="Filter by URL, referer, origin..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            icon={<Search size={14} color={iconColor} />}
          />
        </div>
        {filters.search && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '' })}>
            <X size={14} color={iconColor} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenFilters}
          active={hasActiveFilters}
          title="Advanced filters"
        >
          <Filter size={14} color={hasActiveFilters ? accentColor : iconColor} />
        </Button>
      </div>

      <div className="toolbar-methods">
        {HTTP_METHODS.map((method) => (
          <Button
            key={method}
            variant="ghost"
            size="sm"
            active={filters.method === method}
            onClick={() => setFilters({ method })}
          >
            {method === 'all' ? 'All' : method}
          </Button>
        ))}
      </div>
    </div>
  );
}
