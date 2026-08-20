import { z } from 'zod';
import 'dotenv/config';
import fs from 'fs';

const isDocker = fs.existsSync('/.dockerenv');

if (isDocker) {
  if (process.env.AUTH_SERVICE_URL) {
    process.env.AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL.replace('//localhost:', '//auth-service:');
  }
  if (process.env.VENUE_SERVICE_URL) {
    process.env.VENUE_SERVICE_URL = process.env.VENUE_SERVICE_URL.replace('//localhost:', '//venue-service:');
  }
  if (process.env.BOOKING_SERVICE_URL) {
    process.env.BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL.replace('//localhost:', '//booking-service:');
  }
}

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  JWT_SECRET: z.string().min(6),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:5003'),
  VENUE_SERVICE_URL: z.string().url().default('http://localhost:5001'),
  BOOKING_SERVICE_URL: z.string().url().default('http://localhost:5002'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid Environment Variables for api-gateway:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
