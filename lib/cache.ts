/**
 * Multi-level caching system with Redis and semantic similarity
 */

import { createClient, RedisClientType } from 'redis';
import crypto from 'crypto';

interface CacheEntry {
  response: any;
  timestamp: number;
  hits: number;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: string;
  totalEntries: number;
  memoryUsage: string;
}

export class CacheManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private stats = {
    hits: 0,
    misses: 0,
  };

  // In-memory fallback cache if Redis is not available
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly MAX_MEMORY_CACHE_SIZE = 100;

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      // Support multiple Redis URL formats
      const redisUrl =
        process.env.REDIS_URL ||
        process.env.REDIS_CONNECTION_STRING ||
        'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('[Cache] Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('[Cache] Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('[Cache] Redis connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('[Cache] Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('[Cache] Failed to connect to Redis:', error);
      console.log('[Cache] Falling back to in-memory cache');
      this.isConnected = false;
    }
  }

  /**
   * Generate cache key from prompt and model
   */
  private generateCacheKey(prompt: string, model: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${model}:${prompt}`)
      .digest('hex');
    return `chat:${hash}`;
  }

  /**
   * Get cached response
   */
  async get(prompt: string, model: string): Promise<CacheEntry | null> {
    const key = this.generateCacheKey(prompt, model);

    try {
      if (this.isConnected && this.client) {
        // Try Redis first
        const cached = await this.client.get(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          entry.hits++;
          // Update hit count
          await this.client.setEx(key, this.getTTL(entry), JSON.stringify(entry));
          this.stats.hits++;
          console.log('[Cache] HIT - Redis', { key: key.substring(0, 20) });
          return entry;
        }
      } else {
        // Use memory cache
        const cached = this.memoryCache.get(key);
        if (cached) {
          cached.hits++;
          this.stats.hits++;
          console.log('[Cache] HIT - Memory', { key: key.substring(0, 20) });
          return cached;
        }
      }

      this.stats.misses++;
      console.log('[Cache] MISS', { key: key.substring(0, 20) });
      return null;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set cached response
   */
  async set(
    prompt: string,
    model: string,
    response: any,
    tokens: { input: number; output: number }
  ): Promise<void> {
    const key = this.generateCacheKey(prompt, model);
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      hits: 0,
      model,
      tokens,
    };

    try {
      if (this.isConnected && this.client) {
        // Store in Redis with TTL
        const ttl = this.getTTL(entry);
        await this.client.setEx(key, ttl, JSON.stringify(entry));
        console.log('[Cache] SET - Redis', { key: key.substring(0, 20), ttl });
      } else {
        // Store in memory cache
        if (this.memoryCache.size >= this.MAX_MEMORY_CACHE_SIZE) {
          // Remove oldest entry
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(key, entry);
        console.log('[Cache] SET - Memory', { key: key.substring(0, 20) });
      }
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }

  /**
   * Get TTL based on content type and usage
   */
  private getTTL(entry: CacheEntry): number {
    // Base TTL: 1 hour
    let ttl = 3600;

    // Increase TTL for frequently accessed content
    if (entry.hits > 10) {
      ttl = 86400; // 24 hours
    } else if (entry.hits > 5) {
      ttl = 43200; // 12 hours
    }

    return ttl;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        const keys = await this.client.keys('chat:*');
        if (keys.length > 0) {
          await this.client.del(keys);
        }
        console.log(`[Cache] Cleared ${keys.length} entries from Redis`);
      }
      this.memoryCache.clear();
      console.log('[Cache] Cleared memory cache');
    } catch (error) {
      console.error('[Cache] Clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : '0.00';

    let totalEntries = this.memoryCache.size;
    let memoryUsage = 'N/A';

    try {
      if (this.isConnected && this.client) {
        const keys = await this.client.keys('chat:*');
        totalEntries = keys.length;

        const info = await this.client.info('memory');
        const match = info.match(/used_memory_human:(\S+)/);
        if (match) {
          memoryUsage = match[1];
        }
      } else {
        memoryUsage = `${(this.memoryCache.size * 1024).toLocaleString()}B (estimated)`;
      }
    } catch (error) {
      console.error('[Cache] Stats error:', error);
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      totalEntries,
      memoryUsage,
    };
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('[Cache] Disconnected from Redis');
    }
  }

  /**
   * Pre-warm cache with common queries
   */
  async prewarm(queries: Array<{ prompt: string; model: string; response: any }>): Promise<void> {
    console.log(`[Cache] Pre-warming cache with ${queries.length} entries`);
    for (const query of queries) {
      await this.set(query.prompt, query.model, query.response, { input: 0, output: 0 });
    }
    console.log('[Cache] Pre-warming complete');
  }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null;

/**
 * Get the singleton cache manager instance
 */
export async function getCacheManager(): Promise<CacheManager> {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
    await cacheManagerInstance.connect();
  }
  return cacheManagerInstance;
}

/**
 * Helper function to get cached response or execute function
 */
export async function withCache<T>(
  key: string,
  model: string,
  fn: () => Promise<T>
): Promise<T> {
  const cache = await getCacheManager();
  const cached = await cache.get(key, model);

  if (cached) {
    return cached.response as T;
  }

  const result = await fn();
  await cache.set(key, model, result, { input: 0, output: 0 });
  return result;
}
