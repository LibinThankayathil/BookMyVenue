import { z } from 'zod';
import 'dotenv/config';
import fs from 'fs';

const isDocker = fs.existsSync('/.dockerenv');

if (isDocker && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    /@localhost(:\d+)?/,
    '@bmv_db:5432',
  );
}

const envSchema = z.object({
  PORT: z.coerce.number().default(5003),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(6),
  JWT_EXPIRES_IN: z.string().default('24h'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    '❌ Invalid Environment Variables for auth-service:',
    parsed.error.format(),
  );
  process.exit(1);
}

export const env = parsed.data;
