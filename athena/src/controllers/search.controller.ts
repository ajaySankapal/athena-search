import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const result = await searchService.search(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
