import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../config/env';

let prisma: PrismaClient;
let pool: Pool | undefined;

const databaseUrl = env.DATABASE_URL;

const needsSsl = databaseUrl.includes('sslmode=require');
const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');

pool = new Pool({
  connectionString: cleanUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
prisma = new PrismaClient({ adapter });

export { prisma };

export async function connectDb() {
  await prisma.$connect();
  console.log('Venue DB connected successfully.');
}

export async function disconnectDb() {
  await prisma.$disconnect();
  if (pool) {
    await pool.end();
  }
  console.log('Venue DB disconnected.');
}

