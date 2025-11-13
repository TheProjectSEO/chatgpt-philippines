/**
 * Enterprise Metrics Collector
 * Prometheus-compatible metrics collection and monitoring
 */

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

interface HistogramBucket {
  le: number; // Less than or equal
  count: number;
}

interface HistogramMetric {
  buckets: HistogramBucket[];
  sum: number;
  count: number;
}

export class MetricsCollector {
  private counters: Map<string, number>;
  private gauges: Map<string, number>;
  private histograms: Map<string, HistogramMetric>;
  private labels: Map<string, Record<string, string>>;

  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.labels = new Map();

    console.log('[MetricsCollector] Initialized');
  }

  /**
   * Increment counter
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Increment gauge
   */
  incrementGauge(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.setGauge(name, current + value, labels);
  }

  /**
   * Decrement gauge
   */
  decrementGauge(name: string, value: number = 1, labels?: Record<string, string>): void {
    this.incrementGauge(name, -value, labels);
  }

  /**
   * Observe histogram value (for latency, size, etc.)
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    let histogram = this.histograms.get(key);

    if (!histogram) {
      // Default buckets for latency (ms)
      histogram = {
        buckets: [
          { le: 10, count: 0 },
          { le: 50, count: 0 },
          { le: 100, count: 0 },
          { le: 250, count: 0 },
          { le: 500, count: 0 },
          { le: 1000, count: 0 },
          { le: 2500, count: 0 },
          { le: 5000, count: 0 },
          { le: 10000, count: 0 },
          { le: Infinity, count: 0 },
        ],
        sum: 0,
        count: 0,
      };
      this.histograms.set(key, histogram);
    }

    // Update buckets
    for (const bucket of histogram.buckets) {
      if (value <= bucket.le) {
        bucket.count++;
      }
    }

    histogram.sum += value;
    histogram.count++;

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Get metric key with labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelStr}}`;
  }

  /**
   * Get all metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Counters
    this.counters.forEach((value, key) => {
      const [name, labelStr] = this.parseMetricKey(key);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name}${labelStr} ${value}`);
    });

    // Gauges
    this.gauges.forEach((value, key) => {
      const [name, labelStr] = this.parseMetricKey(key);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name}${labelStr} ${value}`);
    });

    // Histograms
    this.histograms.forEach((histogram, key) => {
      const [name, labelStr] = this.parseMetricKey(key);
      lines.push(`# TYPE ${name} histogram`);

      // Buckets
      for (const bucket of histogram.buckets) {
        const bucketLabel = labelStr
          ? labelStr.slice(0, -1) + `,le="${bucket.le}"}`
          : `{le="${bucket.le}"}`;
        lines.push(`${name}_bucket${bucketLabel} ${bucket.count}`);
      }

      // Sum and count
      lines.push(`${name}_sum${labelStr} ${histogram.sum}`);
      lines.push(`${name}_count${labelStr} ${histogram.count}`);
    });

    return lines.join('\n');
  }

  /**
   * Parse metric key back to name and labels
   */
  private parseMetricKey(key: string): [string, string] {
    const match = key.match(/^([^{]+)(\{.+\})?$/);
    if (!match) return [key, ''];
    return [match[1], match[2] || ''];
  }

  /**
   * Get all metrics as JSON
   */
  getMetricsJSON(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, any>;
  } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, histogram]) => [
          key,
          {
            avg: histogram.count > 0 ? histogram.sum / histogram.count : 0,
            p50: this.calculatePercentile(histogram, 0.5),
            p95: this.calculatePercentile(histogram, 0.95),
            p99: this.calculatePercentile(histogram, 0.99),
            sum: histogram.sum,
            count: histogram.count,
          },
        ])
      ),
    };
  }

  /**
   * Calculate percentile from histogram
   */
  private calculatePercentile(histogram: HistogramMetric, percentile: number): number {
    if (histogram.count === 0) return 0;

    const targetCount = histogram.count * percentile;
    let cumulativeCount = 0;

    for (const bucket of histogram.buckets) {
      cumulativeCount += bucket.count;
      if (cumulativeCount >= targetCount) {
        return bucket.le;
      }
    }

    return histogram.buckets[histogram.buckets.length - 1].le;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.labels.clear();
    console.log('[MetricsCollector] Metrics reset');
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalCounters: number;
    totalGauges: number;
    totalHistograms: number;
    topCounters: Array<{ name: string; value: number }>;
  } {
    const topCounters = Array.from(this.counters.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    return {
      totalCounters: this.counters.size,
      totalGauges: this.gauges.size,
      totalHistograms: this.histograms.size,
      topCounters,
    };
  }
}

// Singleton instance
let metricsCollector: MetricsCollector | null = null;

/**
 * Get the singleton Metrics Collector instance
 */
export function getMetricsCollector(): MetricsCollector {
  if (!metricsCollector) {
    metricsCollector = new MetricsCollector();
  }
  return metricsCollector;
}

/**
 * Convenience functions for common metrics
 */

// API request metrics
export function recordAPIRequest(
  endpoint: string,
  method: string,
  status: number,
  latency: number
): void {
  const metrics = getMetricsCollector();

  metrics.incrementCounter('api_requests_total', 1, {
    endpoint,
    method,
    status: status.toString(),
  });

  metrics.observeHistogram('api_request_duration_ms', latency, {
    endpoint,
    method,
  });

  if (status >= 400) {
    metrics.incrementCounter('api_errors_total', 1, {
      endpoint,
      method,
      status: status.toString(),
    });
  }
}

// API key usage metrics
export function recordAPIKeyUsage(keyId: string, successful: boolean, latency: number): void {
  const metrics = getMetricsCollector();

  metrics.incrementCounter('api_key_requests_total', 1, {
    key: keyId,
    success: successful.toString(),
  });

  if (successful) {
    metrics.observeHistogram('api_key_latency_ms', latency, { key: keyId });
  }
}

// Cache metrics
export function recordCacheOperation(operation: 'hit' | 'miss' | 'set', cacheType: string): void {
  const metrics = getMetricsCollector();

  metrics.incrementCounter('cache_operations_total', 1, {
    operation,
    type: cacheType,
  });
}

// Queue metrics
export function recordQueueOperation(
  queue: string,
  operation: 'enqueue' | 'dequeue' | 'complete' | 'fail'
): void {
  const metrics = getMetricsCollector();

  metrics.incrementCounter('queue_operations_total', 1, {
    queue,
    operation,
  });
}

export function setQueueSize(queue: string, size: number): void {
  const metrics = getMetricsCollector();
  metrics.setGauge('queue_size', size, { queue });
}

// Worker metrics
export function setWorkerCount(status: 'idle' | 'busy' | 'error', count: number): void {
  const metrics = getMetricsCollector();
  metrics.setGauge('worker_count', count, { status });
}

// Model usage metrics
export function recordModelUsage(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): void {
  const metrics = getMetricsCollector();

  metrics.incrementCounter('model_requests_total', 1, { model });
  metrics.incrementCounter('model_input_tokens_total', inputTokens, { model });
  metrics.incrementCounter('model_output_tokens_total', outputTokens, { model });
  metrics.incrementCounter('model_cost_usd_total', cost, { model });
}
