import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(
  cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:'],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res
    .status(200)
    .json({ success: true, status: 'UP', service: 'auth-service' });
});

// Generic 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Register global error handler middleware (must be registered last)
app.use(errorHandler);

export default app;
