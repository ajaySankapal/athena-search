import { SearchFilters, SearchResult } from '../types/search';
import { IndexedProduct } from './product.service';
import { cosineSimilarity, normalizeScore } from '../utils/similarity';

export class RankingService {
  public rankProducts(
    products: IndexedProduct[],
    queryEmbedding: number[],
    filters: SearchFilters,
    rawQuery: string
  ): SearchResult[] {
    const results: SearchResult[] = [];

    for (const product of products) {
      // 1. Apply Hard Filters
      if (filters.maxPrice && product.price > filters.maxPrice) continue;
      if (filters.minPrice && product.price < filters.minPrice) continue;
      // Category filter if strictly applied (we'll just use it for business score here to not drop slightly mismatched searches)
      
      // 2. Semantic Similarity Score
      const sim = cosineSimilarity(queryEmbedding, product.embedding);
      const semanticScore = normalizeScore(sim);

      // 3. Keyword Match Score
      let keywordScore = 0;
      let matchedKeywords = 0;
      const titleLower = product.title.toLowerCase();
      const descLower = product.description.toLowerCase();
      const catLower = product.category.toLowerCase();

      if (filters.keywords.length > 0) {
        for (const kw of filters.keywords) {
          const kwLower = kw.toLowerCase();
          if (titleLower.includes(kwLower) || descLower.includes(kwLower) || catLower.includes(kwLower)) {
            matchedKeywords++;
          }
        }
        keywordScore = matchedKeywords / filters.keywords.length;
      } else {
        keywordScore = semanticScore; // Fallback if no keywords parsed
      }

      // 4. Business Score
      let businessScore = 0;
      const reasons: string[] = [];

      if (semanticScore > 0.6) {
        reasons.push('Strong semantic match');
      }

      if (filters.category && catLower === filters.category.toLowerCase()) {
        businessScore += 0.5;
        reasons.push(`Matches ${filters.category} category`);
      }

      if (filters.maxPrice || filters.minPrice) {
        businessScore += 0.5;
        reasons.push('Price is within the specified budget');
      }

      // Exact title match boost
      if (titleLower.includes(rawQuery.toLowerCase().trim())) {
        businessScore += 0.5;
        reasons.push('Exact title match');
      }

      businessScore = normalizeScore(businessScore);

      // Calculate Final Hybrid Score
      // Formula: 0.70 * semantic + 0.20 * keyword + 0.10 * business
      const finalScore = (0.70 * semanticScore) + (0.20 * keywordScore) + (0.10 * businessScore);

      // We only return items that have at least some relevance
      if (finalScore > 0.15) {
        // Strip out the embedding from the final result to reduce payload size
        const { embedding, ...productData } = product;
        results.push({
          ...productData,
          score: Number(finalScore.toFixed(4)),
          reasons: reasons.length > 0 ? reasons : ['Matches search intent']
        });
      }
    }

    // Sort descending by score
    return results.sort((a, b) => b.score - a.score);
  }
}

export const rankingService = new RankingService();
