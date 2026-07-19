import { pipeline, env as xenovaEnv } from '@xenova/transformers';
import { logger } from '../utils/logger';

// Do not use local models, always download or use cache
xenovaEnv.allowLocalModels = false;

export class EmbeddingService {
  private extractor: any = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';

  public async init() {
    if (!this.extractor) {
      logger.info(`Initializing embedding model: ${this.modelName}...`);
      try {
        this.extractor = await pipeline('feature-extraction', this.modelName);
        logger.info('Embedding model initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize embedding model', error);
        throw error;
      }
    }
  }

  public async getEmbedding(text: string): Promise<number[]> {
    if (!this.extractor) {
      await this.init();
    }
    
    // Create embedding
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    
    // Return as array of numbers
    return Array.from(output.data);
  }
}

export const embeddingService = new EmbeddingService();
