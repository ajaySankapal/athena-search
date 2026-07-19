import { Product } from '../types/product';
import { productLoader } from './productLoader.service';
import { embeddingService } from './embedding.service';
import { logger } from '../utils/logger';

export interface IndexedProduct extends Product {
  embedding: number[];
}

export class ProductService {
  private products: IndexedProduct[] = [];
  private isInitialized = false;

  public async init() {
    if (this.isInitialized) return;

    logger.info('Initializing product index...');
    const rawProducts = productLoader.loadProducts();
    
    await embeddingService.init();

    logger.info('Generating embeddings for products...');
    for (const p of rawProducts) {
      // Create a rich text representation for semantic search
      const textToEmbed = `${p.title}. ${p.description}. Category: ${p.category}`;
      const embedding = await embeddingService.getEmbedding(textToEmbed);
      this.products.push({ ...p, embedding });
    }

    this.isInitialized = true;
    logger.info(`Product index initialized with ${this.products.length} products`);
  }

  public getProducts(): IndexedProduct[] {
    if (!this.isInitialized) {
      throw new Error('ProductService is not initialized');
    }
    return this.products;
  }

  public getCategories(): string[] {
    if (!this.isInitialized) {
      return [];
    }
    const categories = new Set(this.products.map(p => p.category.toLowerCase()));
    return Array.from(categories);
  }

  public async reindex(rawProducts: Product[]) {
    logger.info(`Reindexing ${rawProducts.length} products...`);
    const newProducts: IndexedProduct[] = [];
    
    for (const p of rawProducts) {
      const textToEmbed = `${p.title}. ${p.description}. Category: ${p.category}`;
      const embedding = await embeddingService.getEmbedding(textToEmbed);
      newProducts.push({ ...p, embedding });
    }

    // Replace the old index with the new one
    this.products = newProducts;
    logger.info(`Product index successfully replaced with ${this.products.length} products`);
  }
}

export const productService = new ProductService();
