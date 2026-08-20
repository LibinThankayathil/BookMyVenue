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
  PORT: z.coerce.number().default(5001),
  DATABASE_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('venue_preset'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    'Invalid Environment Variables for venue-service:',
    parsed.error.format(),
  );
  process.exit(1);
}

export const env = parsed.data;
