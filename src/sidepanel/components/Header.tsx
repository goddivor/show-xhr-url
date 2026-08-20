import { Moon, Sun, Trash2, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '../hooks/useTheme';
import { useRequestStore } from '../stores/requestStore';
import { clearRequestsEverywhere } from '../lib/requestActions';

interface HeaderProps {
  onExport: () => void;
}

export function Header({ onExport }: HeaderProps) {
  const { toggleTheme, isDark } = useTheme();
  const requests = useRequestStore((state) => state.requests);
  const clearRequests = useRequestStore((state) => state.clearRequests);

  // Clearing only the store would let the next broadcast restore everything.
  const handleClear = () => void clearRequestsEverywhere(clearRequests);

  const iconColor = isDark ? '#9aa0a6' : '#5f6368';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Network Requests</h1>
        <span className="header-count">({requests.length})</span>
      </div>

      <div className="header-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          title="Export requests"
          disabled={requests.length === 0}
        >
          <Download size={14} color={iconColor} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          title="Clear requests"
          disabled={requests.length === 0}
        >
          <Trash2 size={14} color={iconColor} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={14} color="#9aa0a6" /> : <Moon size={14} color="#5f6368" />}
        </Button>
      </div>
    </header>
  );
}
