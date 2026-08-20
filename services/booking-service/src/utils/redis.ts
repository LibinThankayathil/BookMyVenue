import Redis from 'ioredis';
import { env } from '../config/env';

// Resilient Redis client with an in-memory Map fallback
class ResilientRedis {
  private client: Redis | null = null;
  private isFallbackMode = false;
  private memoryCache = new Map<string, string>();

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      console.log(`[REDIS] Attempting to connect to ${redisUrl}...`);
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000, // 2 seconds connect timeout
        retryStrategy(times) {
          // Do not retry endlessly to prevent clogging app start
          return null;
        },
      });

      this.client.on('error', (err) => {
        if (!this.isFallbackMode) {
          console.warn(
            '[REDIS] Connection failed. Falling back to local in-memory store.',
          );
          this.isFallbackMode = true;
        }
      });

      this.client.on('connect', () => {
        console.log('[REDIS] Connected successfully.');
        this.isFallbackMode = false;
      });
    } catch (err) {
      console.warn(
        '[REDIS] Initialization failed. Falling back to local in-memory store.',
        err,
      );
      this.isFallbackMode = true;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isFallbackMode || !this.client) {
      return this.memoryCache.get(key) || null;
    }
    try {
      return await this.client.get(key);
    } catch (err) {
      this.isFallbackMode = true;
      return this.memoryCache.get(key) || null;
    }
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (this.isFallbackMode || !this.client) {
      this.memoryCache.set(key, value);
      return;
    }
    try {
      if (expireSeconds) {
        await this.client.set(key, value, 'EX', expireSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.isFallbackMode = true;
      this.memoryCache.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (this.isFallbackMode || !this.client) {
      this.memoryCache.delete(key);
      return;
    }
    try {
      await this.client.del(key);
    } catch (err) {
      this.isFallbackMode = true;
      this.memoryCache.delete(key);
    }
  }
}

export const redis = new ResilientRedis();
