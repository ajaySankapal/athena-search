/**
 * Calculates the cosine similarity between two numeric vectors.
 * @param vecA Array of numbers representing the first vector
 * @param vecB Array of numbers representing the second vector
 * @returns A number between -1 and 1
 */
export function cosineSimilarity(vecA: number[] | Float32Array, vecB: number[] | Float32Array): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Normalizes a score to a 0-1 range, ensuring it doesn't drop below 0.
 * In Cosine similarity, values are between -1 and 1. We can clamp it to 0-1 for this context.
 */
export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}
