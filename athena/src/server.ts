import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { productService } from './services/product.service';

const startServer = async () => {
  try {
    // Initialize product index before starting the server
    await productService.init();

    app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start the server', error);
    process.exit(1);
  }
};

startServer();
