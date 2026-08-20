import { z } from 'zod';
import 'dotenv/config';
import fs from 'fs';

const isDocker = fs.existsSync('/.dockerenv');

if (isDocker) {
  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
      /@localhost(:\d+)?/,
      '@bmv_db:5432',
    );
  }
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5003';
  process.env.AUTH_SERVICE_URL = authUrl.replace(
    '//localhost:',
    '//auth-service:',
  );
  const venueUrl = process.env.VENUE_SERVICE_URL || 'http://localhost:5001';
  process.env.VENUE_SERVICE_URL = venueUrl.replace(
    '//localhost:',
    '//venue-service:',
  );
}

const envSchema = z.object({
  PORT: z.coerce.number().default(5002),
  DATABASE_URL: z.string().url(),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:5003'),
  VENUE_SERVICE_URL: z.string().url().default('http://localhost:5001'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_mockkeyid123'),
  RAZORPAY_KEY_SECRET: z.string().default('mocksecret123'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('mockwebhooksecret123'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    '❌ Invalid Environment Variables for booking-service:',
    parsed.error.format(),
  );
  process.exit(1);
}

export const env = parsed.data;
