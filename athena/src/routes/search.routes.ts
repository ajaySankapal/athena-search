import { Router } from 'express';
import { z } from 'zod';
import { searchProducts } from '../controllers/search.controller';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation schema for search query
const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
  }),
});

router.get('/search', validateRequest(searchSchema), searchProducts);

export default router;
