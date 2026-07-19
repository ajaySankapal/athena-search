import { Request, Response, NextFunction } from 'express';
import { productLoader } from '../services/productLoader.service';
import { productService } from '../services/product.service';
import { logger } from '../utils/logger';

export const uploadDataset = async (req: Request, res: Response, next: NextFunction) => {
  // NOTE: This upload route was added specifically for testing purposes.
  // It allows developers/reviewers to dynamically swap out the dataset on the fly 
  // without having to replace the local JSON/CSV files and restart the server.
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { buffer, mimetype } = req.file;
    logger.info(`Received dataset upload: ${mimetype}, size: ${buffer.length} bytes`);

    // 1. Process and validate the uploaded dataset
    const newProducts = productLoader.processUploadedFile(buffer, mimetype);

    // 2. Reindex the new dataset asynchronously or immediately
    // For this take home, doing it immediately. The UI will wait.
    await productService.reindex(newProducts);

    res.json({ message: 'Dataset updated and re-indexed successfully', count: newProducts.length });
  } catch (error) {
    next(error);
  }
};
