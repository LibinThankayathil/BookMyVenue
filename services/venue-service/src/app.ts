import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import healthRoutes from './routes/health.routes';
import uploadRoutes from './routes/upload.routes';
import venueRoutes from './routes/venue.routes';
import adminRoutes from './routes/admin.routes';
import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(
  cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/health', healthRoutes);
app.use('/venues', uploadRoutes);
app.use('/venues', venueRoutes);
app.use('/admin/venues', adminRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

app.use(errorHandler);

export default app;
