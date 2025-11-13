/**
 * Semantic Caching with Embeddings
 * Cache by semantic similarity instead of exact matches
 */

import { createHash } from 'crypto';

interface EmbeddingVector {
  vector: number[];
  text: string;
  response: any;
  timestamp: number;
  hits: number;
}

interface SemanticCacheConfig {
  similarityThreshold: number; // 0.0 to 1.0
  maxEntries: number;
  ttl: number;
  enableFastCache: boolean; // Use in-memory cache for embeddings
}

export class SemanticCache {
  private embeddings: Map<string, EmbeddingVector>;
  private config: SemanticCacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    nearHits: 0, // Semantic matches
  };

  constructor(config: Partial<SemanticCacheConfig> = {}) {
    this.embeddings = new Map();
    this.config = {
      similarityThreshold: config.similarityThreshold || 0.92,
      maxEntries: config.maxEntries || 5000,
      ttl: config.ttl || 86400, // 24 hours
      enableFastCache: config.enableFastCache !== false,
    };

    console.log('[SemanticCache] Initialized with config:', this.config);
  }

  /**
   * Find similar cached prompt using cosine similarity
   */
  async findSimilar(prompt: string): Promise<any | null> {
    // Generate embedding for the input prompt
    const promptEmbedding = await this.generateEmbedding(prompt);

    let bestMatch: { key: string; similarity: number; entry: EmbeddingVector } | null = null;

    // Search through all cached embeddings
    for (const [key, entry] of this.embeddings.entries()) {
      // Check if entry is expired
      const age = (Date.now() - entry.timestamp) / 1000;
      if (age > this.config.ttl) {
        this.embeddings.delete(key);
        continue;
      }

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(promptEmbedding, entry.vector);

      if (similarity > this.config.similarityThreshold) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { key, similarity, entry };
        }
      }
    }

    if (bestMatch) {
      // Update hit count
      bestMatch.entry.hits++;
      this.stats.hits++;
      this.stats.nearHits++;

      console.log(
        `[SemanticCache] Semantic HIT: similarity ${(bestMatch.similarity * 100).toFixed(1)}% ` +
        `"${bestMatch.entry.text.substring(0, 50)}..." -> "${prompt.substring(0, 50)}..."`
      );

      return bestMatch.entry.response;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Cache response with semantic embedding
   */
  async cache(prompt: string, response: any): Promise<void> {
    // Evict old entries if cache is full
    if (this.embeddings.size >= this.config.maxEntries) {
      this.evictOldest(Math.floor(this.config.maxEntries * 0.1));
    }

    const embedding = await this.generateEmbedding(prompt);
    const key = this.generateKey(prompt);

    this.embeddings.set(key, {
      vector: embedding,
      text: prompt,
      response,
      timestamp: Date.now(),
      hits: 0,
    });

    console.log(`[SemanticCache] Cached: "${prompt.substring(0, 50)}..."`);
  }

  /**
   * Generate embedding vector for text (simplified version)
   * In production, use a proper embedding model like sentence-transformers
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // This is a simplified embedding - in production, use:
    // - OpenAI embeddings API
    // - Sentence Transformers
    // - Custom embedding model

    // For now, use a simple TF-IDF-like approach
    const tokens = this.tokenize(text.toLowerCase());
    const embedding = new Array(384).fill(0); // Standard embedding size

    // Simple hash-based embedding (for demonstration)
    tokens.forEach((token, index) => {
      const hash = this.hashString(token);
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] += Math.sin(hash * (i + 1) * (index + 1));
      }
    });

    // Normalize
    return this.normalize(embedding);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Normalize vector
   */
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  /**
   * Generate cache key
   */
  private generateKey(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(count: number): void {
    const entries = Array.from(this.embeddings.entries())
      .sort((a, b) => {
        // Sort by hits (ascending) and timestamp (ascending)
        const hitsCompare = a[1].hits - b[1].hits;
        if (hitsCompare !== 0) return hitsCompare;
        return a[1].timestamp - b[1].timestamp;
      })
      .slice(0, count);

    entries.forEach(([key]) => {
      this.embeddings.delete(key);
    });

    console.log(`[SemanticCache] Evicted ${count} old entries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : '0.00';
    const semanticHitRate = this.stats.hits > 0
      ? ((this.stats.nearHits / this.stats.hits) * 100).toFixed(2)
      : '0.00';

    return {
      totalEntries: this.embeddings.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      nearHits: this.stats.nearHits,
      hitRate: hitRate + '%',
      semanticHitRate: semanticHitRate + '%',
      threshold: this.config.similarityThreshold,
    };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.embeddings.clear();
    console.log('[SemanticCache] Cache cleared');
  }
}

// Singleton instance
let semanticCache: SemanticCache | null = null;

/**
 * Get the singleton Semantic Cache instance
 */
export function getSemanticCache(): SemanticCache {
  if (!semanticCache) {
    semanticCache = new SemanticCache({
      similarityThreshold: parseFloat(process.env.SEMANTIC_CACHE_THRESHOLD || '0.92'),
      maxEntries: parseInt(process.env.SEMANTIC_CACHE_MAX_ENTRIES || '5000'),
      ttl: parseInt(process.env.SEMANTIC_CACHE_TTL || '86400'),
    });
  }
  return semanticCache;
}

/**
 * Use semantic cache for API calls
 */
export async function withSemanticCache<T>(
  prompt: string,
  generator: () => Promise<T>
): Promise<T> {
  const cache = getSemanticCache();

  // Try to find similar cached response
  const cached = await cache.findSimilar(prompt);
  if (cached !== null) {
    return cached as T;
  }

  // Generate new response
  const response = await generator();

  // Cache the response
  await cache.cache(prompt, response);

  return response;
}
