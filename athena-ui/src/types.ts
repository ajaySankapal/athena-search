export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
}

export interface SearchResult extends Product {
  score: number;
  reasons: string[];
}

export interface SearchFilters {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  keywords: string[];
}

export interface SearchResponse {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
}
