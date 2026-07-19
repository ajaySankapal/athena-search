import { SearchFilters } from '../types/search';

export function parseQuery(query: string, knownCategories: string[] = []): SearchFilters {
  const q = query.toLowerCase().trim();
  const filters: SearchFilters = {
    keywords: [],
  };

  // Price parsing regexes
  const underRegex = /(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i;
  const aboveRegex = /(?:above|greater than|more than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i;
  const betweenRegex = /(?:between)\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:and|to)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i;

  let cleanedQuery = q;

  // Extract between price
  const betweenMatch = cleanedQuery.match(betweenRegex);
  if (betweenMatch) {
    filters.minPrice = parseInt(betweenMatch[1], 10);
    filters.maxPrice = parseInt(betweenMatch[2], 10);
    cleanedQuery = cleanedQuery.replace(betweenRegex, '');
  } else {
    // Extract max price
    const underMatch = cleanedQuery.match(underRegex);
    if (underMatch) {
      filters.maxPrice = parseInt(underMatch[1], 10);
      cleanedQuery = cleanedQuery.replace(underRegex, '');
    }

    // Extract min price
    const aboveMatch = cleanedQuery.match(aboveRegex);
    if (aboveMatch) {
      filters.minPrice = parseInt(aboveMatch[1], 10);
      cleanedQuery = cleanedQuery.replace(aboveRegex, '');
    }
  }

  // Category extraction based on known dynamic categories
  for (const cat of knownCategories) {
    if (cleanedQuery.includes(cat)) {
      filters.category = cat;
      // We don't remove it from keywords because it's still useful for semantic search
    }
  }

  // Tokenize remaining query into keywords, removing stop words and symbols
  const stopWords = new Set(['for', 'the', 'a', 'an', 'with', 'in', 'of', 'and', 'to']);
  const tokens = cleanedQuery
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopWords.has(word));

  filters.keywords = tokens;

  return filters;
}
