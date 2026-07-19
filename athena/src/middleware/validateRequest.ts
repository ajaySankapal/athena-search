import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as any;
        logger.warn('Validation error', zodError.errors);
        // Special case requested: Empty query -> "Search query is required"
        if (zodError.errors.some((e: any) => e.path.includes('q') && e.code === 'too_small')) {
           res.status(400).json({ message: 'Search query is required' });
           return;
        }
        res.status(400).json({ message: 'Invalid request data', errors: zodError.errors });
        return;
      }
      next(error);
    }
  };
};
