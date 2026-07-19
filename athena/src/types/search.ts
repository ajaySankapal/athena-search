import { Product } from './product';

export interface SearchFilters {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  keywords: string[];
}

export interface SearchResult extends Product {
  score: number;
  reasons: string[];
}
