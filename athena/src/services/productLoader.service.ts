import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Product } from '../types/product';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class ProductLoaderService {
  private readonly dataDir = path.join(__dirname, '..', 'data');

  public loadProducts(): Product[] {
    const source = env.DATA_SOURCE;
    let products: Product[] = [];

    try {
      if (source === 'json') {
        products = this.loadFromJson();
      } else if (source === 'csv') {
        products = this.loadFromCsv();
      } else {
        throw new Error(`Unsupported DATA_SOURCE: ${source}`);
      }

      this.validateProducts(products);
      logger.info(`Successfully loaded ${products.length} products from ${source}`);
      return products;
    } catch (error: any) {
      logger.error('Failed to load products dataset', error.message);
      throw error;
    }
  }

  private loadFromJson(): Product[] {
    const filePath = path.join(this.dataDir, 'products.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`JSON dataset missing at ${filePath}`);
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  }

  private loadFromCsv(): Product[] {
    const filePath = path.join(this.dataDir, 'products.csv');
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV dataset missing at ${filePath}`);
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(rawData, {
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (context.column === 'price') return Number(value);
        return value;
      }
    });
    return records as Product[];
  }

  public processUploadedFile(buffer: Buffer, mimetype: string): Product[] {
    let rawProducts: Product[] = [];
    try {
      if (mimetype === 'application/json' || mimetype === 'text/json') {
        rawProducts = JSON.parse(buffer.toString('utf-8'));
      } else if (mimetype === 'text/csv' || mimetype === 'application/csv') {
        const records = parse(buffer.toString('utf-8'), {
          columns: true,
          skip_empty_lines: true,
          cast: (value, context) => {
            if (context.column === 'price') return Number(value);
            return value;
          }
        });
        rawProducts = records as Product[];
      } else {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }
      this.validateProducts(rawProducts);
      
      // We are just processing it in memory for this take-home instead of saving permanently.
      return rawProducts;
    } catch (e: any) {
      throw new Error(`Failed to process uploaded file: ${e.message}`);
    }
  }

  private validateProducts(products: any[]) {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Dataset is empty or invalid');
    }

    products.forEach((p, index) => {
      if (!p.id || !p.title || !p.description || !p.category || typeof p.price !== 'number') {
        throw new Error(`Invalid product data at index ${index}: ${JSON.stringify(p)}`);
      }
    });
  }
}

export const productLoader = new ProductLoaderService();
