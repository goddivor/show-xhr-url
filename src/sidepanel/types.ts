/**
 * The side panel speaks the shared vocabulary. This file exists so panel modules can keep
 * importing `../types` while the definitions stay in one place for all three contexts.
 */
export type {
  DetailedRequest,
  ExportFormat,
  ExportOptions,
  HttpMethod,
  RequestFilters,
  RequestStatus,
  RequestType,
} from '@shared/types';
