import app from './app';
import { env } from './config/env';
import { connectDb, disconnectDb } from './prisma/prisma';

const PORT = env.PORT;

async function bootstrap() {
  try {
    await connectDb();
    const server = app.listen(PORT, () => {
      console.log(`Auth Service listening on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        await disconnectDb();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

void bootstrap();
