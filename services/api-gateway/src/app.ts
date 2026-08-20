import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { env } from './config/env';
import { authenticateJWT } from './middlewares/auth.middleware';

const app = express();

app.use(cors({
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
}));

app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// JWT Middleware
app.use(authenticateJWT);

// Setup Proxies
const createServiceProxy = (targetUrl: string, prefix: string) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: { '^/': `/${prefix}/` },
    on: {
      proxyReq: (proxyReq, req, res) => {
        fixRequestBody(proxyReq, req);
        if ((req as any).user) {
          proxyReq.setHeader('x-user-id', (req as any).user.id.toString());
          proxyReq.setHeader('x-user-roles', (req as any).user.roles.join(','));
          proxyReq.setHeader('x-user-is-kyc-verified', (req as any).user.isKycVerified.toString());
          proxyReq.setHeader('x-user-created-at', (req as any).user.accountCreatedAt);
        }
      }
    }
  });
};

app.use('/api/auth', createServiceProxy(env.AUTH_SERVICE_URL, 'auth'));
app.use('/api/admin/users', createServiceProxy(env.AUTH_SERVICE_URL, 'admin/users'));
app.use('/api/admin/venues', createServiceProxy(env.VENUE_SERVICE_URL, 'admin/venues'));
app.use('/api/admin/bookings', createServiceProxy(env.BOOKING_SERVICE_URL, 'bookings/admin'));
app.use('/api/venues', createServiceProxy(env.VENUE_SERVICE_URL, 'venues'));
app.use('/api/bookings', createServiceProxy(env.BOOKING_SERVICE_URL, 'bookings'));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'UP', service: 'api-gateway' });
});

export default app;
