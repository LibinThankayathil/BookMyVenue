import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

async function bootstrap() {
  const server = app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
  });

  const gracefulShutdown = () => {
    console.log('API Gateway shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

void bootstrap();
