import { useState } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { RequestList } from './components/RequestList';
import { RequestDetails } from './components/RequestDetails';
import { FilterPanel } from './components/FilterPanel';
import { ExportModal } from './components/ExportModal';
import { useRequests } from './hooks/useRequests';
import { useRequestStore } from './stores/requestStore';

export default function App() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { isLoading } = useRequestStore();

  // Initialize request fetching and listeners
  useRequests();

  return (
    <div className="app">
      <Header onExport={() => setIsExportModalOpen(true)} />
      <Toolbar onOpenFilters={() => setIsFilterPanelOpen(!isFilterPanelOpen)} />
      <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} />

      {isLoading ? (
        <div className="app-loading">Loading requests...</div>
      ) : (
        <RequestList />
      )}

      <RequestDetails />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
}
