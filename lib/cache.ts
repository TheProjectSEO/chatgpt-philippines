/**
 * Multi-level caching system with Redis and in-memory fallback
 *
 * Features:
 * - Redis as primary cache (optional)
 * - In-memory fallback when Redis unavailable
 * - SHA256 cache key generation
 * - Adaptive TTL based on hit count
 * - Cache statistics tracking
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
  cacheType: 'redis' | 'memory';
}

export class CacheManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private stats = {
    hits: 0,
    misses: 0,
  };

  // In-memory fallback cache (always available)
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly MAX_MEMORY_CACHE_SIZE = 100;

  /**
   * Initialize cache connection (Redis optional)
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    // Only attempt Redis if URL is configured
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;

    if (!redisUrl) {
      console.log('[Cache] No Redis URL configured, using in-memory cache only');
      return;
    }

    try {
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
        console.log('[Cache] Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('[Cache] Redis disconnected, falling back to memory');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('[Cache] Failed to connect to Redis:', error);
      console.log('[Cache] Using in-memory cache as fallback');
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Generate SHA256 cache key from prompt and model
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
      // Try Redis first if available
      if (this.isConnected && this.client) {
        const cached = await this.client.get(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          entry.hits++;

          // Update hit count and TTL
          const ttl = this.getTTL(entry);
          await this.client.setEx(key, ttl, JSON.stringify(entry));

          this.stats.hits++;
          console.log('[Cache] HIT - Redis', {
            key: key.substring(0, 20),
            hits: entry.hits,
            ttl
          });
          return entry;
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(key);
      if (cached) {
        cached.hits++;
        this.stats.hits++;
        console.log('[Cache] HIT - Memory', {
          key: key.substring(0, 20),
          hits: cached.hits
        });
        return cached;
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
      // Store in Redis if available
      if (this.isConnected && this.client) {
        const ttl = this.getTTL(entry);
        await this.client.setEx(key, ttl, JSON.stringify(entry));
        console.log('[Cache] SET - Redis', {
          key: key.substring(0, 20),
          ttl
        });
      } else {
        // Store in memory cache with size limit
        if (this.memoryCache.size >= this.MAX_MEMORY_CACHE_SIZE) {
          // Remove oldest entry (FIFO)
          const firstKey = this.memoryCache.keys().next().value;
          if (firstKey) {
            this.memoryCache.delete(firstKey);
          }
        }
        this.memoryCache.set(key, entry);
        console.log('[Cache] SET - Memory', {
          key: key.substring(0, 20),
          size: this.memoryCache.size
        });
      }
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }

  /**
   * Get adaptive TTL based on hit count
   * More hits = longer TTL (hot content stays cached longer)
   */
  private getTTL(entry: CacheEntry): number {
    if (entry.hits > 10) {
      return 86400; // 24 hours for very popular content
    } else if (entry.hits > 5) {
      return 43200; // 12 hours for popular content
    } else if (entry.hits > 2) {
      return 7200;  // 2 hours for moderately popular
    }
    return 3600; // 1 hour default
  }

  /**
   * Clear all cache entries
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

      // Reset stats
      this.stats.hits = 0;
      this.stats.misses = 0;
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
    const cacheType = this.isConnected ? 'redis' : 'memory';

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
        // Estimate memory usage for in-memory cache
        const estimatedBytes = this.memoryCache.size * 1024; // Rough estimate
        memoryUsage = `${(estimatedBytes / 1024).toFixed(2)} KB (estimated)`;
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
      cacheType,
    };
  }

  /**
   * Disconnect from Redis gracefully
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('[Cache] Disconnected from Redis');
    }
  }

  /**
   * Pre-warm cache with common queries (optional optimization)
   */
  async prewarm(
    queries: Array<{ prompt: string; model: string; response: any; tokens?: { input: number; output: number } }>
  ): Promise<void> {
    console.log(`[Cache] Pre-warming cache with ${queries.length} entries`);

    for (const query of queries) {
      await this.set(
        query.prompt,
        query.model,
        query.response,
        query.tokens || { input: 0, output: 0 }
      );
    }

    console.log('[Cache] Pre-warming complete');
  }

  /**
   * Check if cache is using Redis or memory
   */
  isUsingRedis(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null;

/**
 * Get the singleton cache manager instance
 * Automatically connects on first access
 */
export async function getCacheManager(): Promise<CacheManager> {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
    await cacheManagerInstance.connect();
  }
  return cacheManagerInstance;
}

/**
 * Helper function to use cache with any async function
 *
 * @example
 * const result = await withCache('my-prompt', 'gpt-4', async () => {
 *   return await callExpensiveAPI();
 * });
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

/**
 * Export default instance for convenience
 */
export default getCacheManager;
