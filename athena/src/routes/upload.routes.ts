import { Router } from 'express';
import multer from 'multer';
import { uploadDataset } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('dataset'), uploadDataset);

export default router;
