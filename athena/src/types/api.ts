import { SearchFilters, SearchResult } from './search';

export interface SearchResponse {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
}

export interface ErrorResponse {
  message: string;
}
