import { parseQuery } from '../utils/queryParser';
import { embeddingService } from './embedding.service';
import { productService } from './product.service';
import { rankingService } from './ranking.service';
import { SearchResponse } from '../types/api';

export class SearchService {
  public async search(rawQuery: string): Promise<SearchResponse> {
    const categories = productService.getCategories();
    // 1. Query Parsing
    const filters = parseQuery(rawQuery, categories);

    // 2. Generate Query Embedding
    const queryEmbedding = await embeddingService.getEmbedding(rawQuery);

    // 3. Get Indexed Products
    const products = productService.getProducts();

    // 4. Semantic Similarity Search & Apply Filters & Hybrid Ranking
    const results = rankingService.rankProducts(products, queryEmbedding, filters, rawQuery);

    return {
      query: rawQuery,
      filters,
      results
    };
  }
}

export const searchService = new SearchService();
