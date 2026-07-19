import express from 'express';
import cors from 'cors';
import path from 'path';
import healthRoutes from './routes/health.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api', searchRoutes);
app.use('/api', uploadRoutes);

// Serve Frontend Build Statically
const frontendPath = path.join(__dirname, '../../athena-ui/dist');
app.use(express.static(frontendPath));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error Handler (must be after routes)
app.use(errorHandler);

export default app;
