import { create } from 'zustand';
import type { DetailedRequest, RequestFilters } from '../types';

interface RequestState {
  requests: DetailedRequest[];
  selectedRequest: DetailedRequest | null;
  filters: RequestFilters;
  isLoading: boolean;

  // Actions
  setRequests: (requests: DetailedRequest[]) => void;
  addRequest: (request: DetailedRequest) => void;
  selectRequest: (request: DetailedRequest | null) => void;
  setFilters: (filters: Partial<RequestFilters>) => void;
  clearRequests: () => void;
  setLoading: (loading: boolean) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  requests: [],
  selectedRequest: null,
  filters: {
    method: 'all',
    search: '',
    statusCode: '',
    contentType: '',
    requestType: '',
  },
  isLoading: false,

  setRequests: (requests) => set({ requests }),

  addRequest: (request) => set((state) => ({
    requests: [request, ...state.requests],
  })),

  selectRequest: (request) => set({ selectedRequest: request }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearRequests: () => set({ requests: [], selectedRequest: null }),

  setLoading: (isLoading) => set({ isLoading }),
}));

// Selector for filtered requests
export const useFilteredRequests = () => {
  const { requests, filters } = useRequestStore();

  return requests.filter((req) => {
    // Filter by method
    if (filters.method !== 'all' && req.method.toUpperCase() !== filters.method.toUpperCase()) {
      return false;
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesUrl = req.url.toLowerCase().includes(search);
      const matchesReferer = req.referer?.toLowerCase().includes(search);
      const matchesOrigin = req.origin?.toLowerCase().includes(search);
      if (!matchesUrl && !matchesReferer && !matchesOrigin) {
        return false;
      }
    }

    // Filter by status code
    if (filters.statusCode) {
      const statusPrefix = filters.statusCode;
      if (!req.statusCode?.toString().startsWith(statusPrefix)) {
        return false;
      }
    }

    // Filter by content type
    if (filters.contentType) {
      if (!req.contentType?.toLowerCase().includes(filters.contentType.toLowerCase())) {
        return false;
      }
    }

    // Filter by request type (XHR, Fetch, etc.)
    if (filters.requestType) {
      if (req.requestType !== filters.requestType) {
        return false;
      }
    }

    return true;
  });
};
