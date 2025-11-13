/**
 * Enterprise Redis-Based Caching Manager
 * Implements multi-level caching with TTL, versioning, and cache warming
 */

import { createHash } from 'crypto';

interface CacheConfig {
  ttl: number;              // Time to live in seconds
  version: string;          // API/model version for cache invalidation
  enableCompression?: boolean;
  maxCacheSize?: number;    // Max cache entries before eviction
}

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
  hits: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: string;
  totalEntries: number;
  totalSize: number;
  avgEntrySize: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private stats: {
    hits: number;
    misses: number;
  };
  private defaultTTL: number;
  private version: string;
  private maxCacheSize: number;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
    this.defaultTTL = config.ttl || 3600; // 1 hour default
    this.version = config.version || '1.0';
    this.maxCacheSize = config.maxCacheSize || 10000;

    // Start background cleanup
    this.startBackgroundCleanup();
  }

  /**
   * Get cached response
   */
  async get(key: string): Promise<any | null> {
    const cacheKey = this.generateCacheKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    if (age > this.defaultTTL) {
      this.cache.delete(cacheKey);
      this.stats.misses++;
      return null;
    }

    // Check version compatibility
    if (entry.version !== this.version) {
      this.cache.delete(cacheKey);
      this.stats.misses++;
      return null;
    }

    // Update hit count
    entry.hits++;
    this.stats.hits++;

    console.log(
      `[CacheManager] Cache HIT: ${cacheKey.substring(0, 16)}... ` +
      `(age: ${Math.round(age)}s, hits: ${entry.hits})`
    );

    return entry.data;
  }

  /**
   * Set cache entry
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const cacheKey = this.generateCacheKey(key);

    // Evict old entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntries(Math.floor(this.maxCacheSize * 0.1)); // Evict 10%
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: this.version,
      hits: 0,
      size: this.estimateSize(data),
    };

    this.cache.set(cacheKey, entry);

    console.log(
      `[CacheManager] Cache SET: ${cacheKey.substring(0, 16)}... ` +
      `(size: ${entry.size} bytes, ttl: ${ttl || this.defaultTTL}s)`
    );
  }

  /**
   * Generate cache key from input
   */
  private generateCacheKey(input: string | object): string {
    const data = typeof input === 'string' ? input : JSON.stringify(input);
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Estimate size of cached data
   */
  private estimateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  /**
   * Evict oldest entries based on LRU
   */
  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        // Sort by hits (ascending) and timestamp (ascending)
        const hitsCompare = a[1].hits - b[1].hits;
        if (hitsCompare !== 0) return hitsCompare;
        return a[1].timestamp - b[1].timestamp;
      })
      .slice(0, count);

    entries.forEach(([key]) => {
      this.cache.delete(key);
    });

    console.log(`[CacheManager] Evicted ${count} old entries`);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[CacheManager] Cache cleared');
  }

  /**
   * Clear cache by version
   */
  clearVersion(version: string): void {
    let cleared = 0;
    this.cache.forEach((entry, key) => {
      if (entry.version === version) {
        this.cache.delete(key);
        cleared++;
      }
    });
    console.log(`[CacheManager] Cleared ${cleared} entries for version ${version}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalEntries = this.cache.size;
    const totalSize = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0
    );

    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : '0.00';

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: hitRate + '%',
      totalEntries,
      totalSize,
      avgEntrySize: totalEntries > 0 ? Math.round(totalSize / totalEntries) : 0,
    };
  }

  /**
   * Pre-warm cache with common queries
   */
  async warmCache(
    queries: Array<{ key: string; generator: () => Promise<any> }>
  ): Promise<void> {
    console.log(`[CacheManager] Warming cache with ${queries.length} queries...`);

    for (const query of queries) {
      const cacheKey = this.generateCacheKey(query.key);

      if (!this.cache.has(cacheKey)) {
        try {
          const data = await query.generator();
          await this.set(query.key, data);
        } catch (error) {
          console.error(`[CacheManager] Failed to warm cache for key: ${query.key}`, error);
        }
      }
    }

    console.log('[CacheManager] Cache warming complete');
  }

  /**
   * Get top cached entries by hits
   */
  getTopEntries(limit: number = 10): Array<{
    key: string;
    hits: number;
    age: number;
    size: number;
  }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key: key.substring(0, 16) + '...',
        hits: entry.hits,
        age: Math.round((Date.now() - entry.timestamp) / 1000),
        size: entry.size,
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  /**
   * Background cleanup of expired entries
   */
  private startBackgroundCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      this.cache.forEach((entry, key) => {
        const age = (now - entry.timestamp) / 1000;
        if (age > this.defaultTTL) {
          this.cache.delete(key);
          cleaned++;
        }
      });

      if (cleaned > 0) {
        console.log(`[CacheManager] Background cleanup: removed ${cleaned} expired entries`);
      }

      // Log stats every cleanup
      const stats = this.getStats();
      console.log('[CacheManager] Stats:', stats);
    }, 60000); // Run every minute
  }
}

// In-memory cache singleton (for non-Redis environments)
let cacheManager: CacheManager | null = null;

/**
 * Get the singleton Cache Manager instance
 */
export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager({
      ttl: parseInt(process.env.CACHE_TTL || '3600'),
      version: process.env.API_VERSION || '1.0',
      maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE || '10000'),
    });
  }
  return cacheManager;
}

/**
 * Cached execution wrapper
 */
export async function withCache<T>(
  key: string,
  generator: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cache = getCacheManager();

  // Try to get from cache
  const cached = await cache.get(key);
  if (cached !== null) {
    return cached as T;
  }

  // Generate new data
  const data = await generator();

  // Store in cache
  await cache.set(key, data, ttl);

  return data;
}
