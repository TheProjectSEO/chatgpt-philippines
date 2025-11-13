# Enterprise Scaling Architecture Documentation

## Overview

This document describes the comprehensive enterprise scaling architecture implemented for the ChatGPT Philippines application. The architecture is designed to handle high traffic volumes, ensure reliability, and provide extensive monitoring capabilities.

## Architecture Components

### 1. API Layer Scaling

#### Multiple API Key Management (`lib/scaling/apiKeyManager.ts`)

**Features:**
- Token bucket algorithm for request distribution
- Automatic key rotation and load balancing
- Circuit breaker pattern for failed keys
- Real-time usage tracking and alerts

**Usage:**
```typescript
import { getAPIKeyManager } from '@/lib/scaling/apiKeyManager';

const apiKeyManager = getAPIKeyManager();
const apiKey = await apiKeyManager.getAvailableKey();

// Record success/failure
apiKeyManager.recordSuccess(apiKey, latencyMs);
apiKeyManager.recordError(apiKey, errorMessage);

// Get metrics
const metrics = apiKeyManager.getMetrics();
const capacity = apiKeyManager.getTotalCapacity();
```

**Configuration:**
- Set `ANTHROPIC_API_KEYS` environment variable with comma-separated keys
- Default limits: 50 RPM, 1000 RPH, 10000 RPD per key
- Circuit breaker opens after 5 consecutive errors

**Quota Alerts:**
- Warning at 70% usage
- Critical at 85% and 95% usage
- Alerts logged and can be integrated with notification systems

### 2. Rate Limit Handling (`lib/scaling/rateLimitHandler.ts`)

**Features:**
- Exponential backoff with jitter
- Automatic retry up to 8 attempts
- Maximum retry delay: 5 minutes
- Smart error detection (rate limits, connection errors)

**Usage:**
```typescript
import { callAnthropicWithRetry } from '@/lib/scaling/rateLimitHandler';

const response = await callAnthropicWithRetry(
  anthropicClient,
  messageParams,
  apiKey,
  (error) => apiKeyManager.recordError(apiKey, error.message),
  (latency) => apiKeyManager.recordSuccess(apiKey, latency)
);
```

**Retry Strategy:**
1. Initial delay: 1 second
2. Exponential backoff with 2x multiplier
3. Random jitter (±30%)
4. Max delay capped at 5 minutes

### 3. Multi-Level Caching

#### Standard Cache (`lib/scaling/cacheManager.ts`)

**Features:**
- In-memory LRU cache
- Automatic TTL management
- Cache versioning for API updates
- Hit/miss rate tracking

**Usage:**
```typescript
import { withCache } from '@/lib/scaling/cacheManager';

const result = await withCache(
  cacheKey,
  async () => {
    // Expensive operation
    return await fetchData();
  },
  ttl // optional TTL in seconds
);
```

**Configuration:**
- `CACHE_TTL`: Default time-to-live (default: 3600s)
- `MAX_CACHE_SIZE`: Maximum cache entries (default: 10000)
- `API_VERSION`: Cache version for invalidation

#### Semantic Cache (`lib/scaling/semanticCache.ts`)

**Features:**
- Similarity-based caching
- Cosine similarity matching
- Configurable similarity threshold
- Automatic cache warming

**Usage:**
```typescript
import { withSemanticCache } from '@/lib/scaling/semanticCache';

const response = await withSemanticCache(
  userPrompt,
  async () => {
    return await callAPI(userPrompt);
  }
);
```

**Configuration:**
- `SEMANTIC_CACHE_THRESHOLD`: Similarity threshold (default: 0.92)
- `SEMANTIC_CACHE_MAX_ENTRIES`: Max entries (default: 5000)
- `SEMANTIC_CACHE_TTL`: Time-to-live (default: 86400s)

**Benefits:**
- Matches similar questions ("What is AI?" ≈ "Explain artificial intelligence")
- Reduces duplicate API calls
- Improves response time

### 4. Queue System (`lib/scaling/queueManager.ts`)

**Features:**
- Priority queue implementation
- Dead letter queue (DLQ) for failed jobs
- Automatic retries with exponential backoff
- Job status tracking

**Usage:**
```typescript
import { getQueue, QueuePriority } from '@/lib/scaling/queueManager';

const queue = getQueue('ai-requests');

// Enqueue job
const jobId = await queue.enqueue(requestData, QueuePriority.HIGH);

// Check status
const job = await queue.getJob(jobId);

// Get statistics
const stats = queue.getStats();
```

**Priority Levels:**
- `CRITICAL`: 10 (premium users, urgent requests)
- `HIGH`: 8 (authenticated users)
- `NORMAL`: 5 (default)
- `LOW`: 0 (background tasks)

**Configuration:**
- Max concurrent: 10 jobs
- Max retry attempts: 3
- Retry delay: 5 seconds (exponential backoff)
- Job timeout: 5 minutes

### 5. Worker Management (`lib/scaling/workerManager.ts`)

**Features:**
- Multi-worker architecture
- Auto-scaling based on queue depth
- Health checks and auto-recovery
- Graceful shutdown

**Usage:**
```typescript
import { getWorkerManager } from '@/lib/scaling/workerManager';

const workerManager = getWorkerManager(
  'ai-workers',
  queue,
  async (data) => {
    // Process job
    return await processAIRequest(data);
  },
  { concurrency: 5 }
);

await workerManager.start();

// Scale workers
await workerManager.scale(10);

// Get statistics
const stats = workerManager.getAggregateStats();
```

**Configuration:**
- Default concurrency: 5 workers
- Poll interval: 1 second
- Health check interval: 30 seconds
- Auto-restart on errors: enabled

### 6. Health Monitoring (`lib/scaling/healthMonitor.ts`)

**Features:**
- Comprehensive health checks
- Component-level status tracking
- Automatic alerting on critical issues
- Uptime tracking

**Usage:**
```typescript
import { getHealthMonitor } from '@/lib/scaling/healthMonitor';

const healthMonitor = getHealthMonitor();
const health = await healthMonitor.checkHealth();

// Get formatted report
const report = healthMonitor.getHealthReport();
console.log(report);
```

**Health Status Levels:**
- `HEALTHY`: All systems operational
- `DEGRADED`: Some components experiencing issues
- `UNHEALTHY`: Multiple components failing
- `CRITICAL`: System-wide critical issues

**Monitored Components:**
- API key health and quota
- Cache performance
- Queue depth and DLQ size
- Worker status
- Metrics collection

### 7. Metrics Collection (`lib/scaling/metricsCollector.ts`)

**Features:**
- Prometheus-compatible metrics
- Counters, gauges, and histograms
- Automatic metric aggregation
- JSON and Prometheus export formats

**Usage:**
```typescript
import {
  recordAPIRequest,
  recordAPIKeyUsage,
  recordCacheOperation,
  recordModelUsage
} from '@/lib/scaling/metricsCollector';

// Record API request
recordAPIRequest('/api/chat', 'POST', 200, latencyMs);

// Record API key usage
recordAPIKeyUsage(keyId, true, latencyMs);

// Record cache operation
recordCacheOperation('hit', 'standard');

// Record model usage
recordModelUsage(model, inputTokens, outputTokens, costUSD);
```

**Available Metrics:**
- `api_requests_total`: Total API requests
- `api_errors_total`: Total API errors
- `api_request_duration_ms`: Request latency histogram
- `api_key_requests_total`: Requests per API key
- `cache_operations_total`: Cache hits/misses
- `queue_size`: Current queue depth
- `worker_count`: Workers by status
- `model_requests_total`: Requests per model
- `model_cost_usd_total`: Total API costs

## Monitoring Endpoints

### Health Check
```
GET /api/monitoring/health
```

Returns system health status and component checks.

**Response:**
```json
{
  "overall": "healthy",
  "checks": [
    {
      "component": "api_keys",
      "status": "healthy",
      "message": "API keys healthy",
      "details": {...}
    }
  ],
  "uptime": 3600000,
  "timestamp": 1234567890
}
```

### Metrics
```
GET /api/monitoring/metrics?format=json
GET /api/monitoring/metrics (Prometheus format)
```

Returns application metrics.

### Dashboard
```
GET /api/monitoring/dashboard
```

Returns comprehensive system status for monitoring dashboards.

## Deployment

### Local Development with Docker Compose

1. **Set environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

2. **Start services:**
```bash
docker-compose up -d
```

3. **Access services:**
- Application: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Production Deployment with Kubernetes

1. **Build Docker image:**
```bash
docker build -t chatgpt-philippines:latest .
```

2. **Create Kubernetes secrets:**
```bash
kubectl create secret generic api-secrets \
  --from-literal=anthropic-api-key=sk-ant-... \
  --from-literal=anthropic-api-keys=sk-ant-1,sk-ant-2,sk-ant-3
```

3. **Deploy to Kubernetes:**
```bash
# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Deploy application
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml

# Deploy workers
kubectl apply -f k8s/worker-deployment.yaml

# Deploy monitoring
kubectl apply -f k8s/monitoring-deployment.yaml
```

4. **Verify deployment:**
```bash
kubectl get pods
kubectl get services
kubectl get hpa
```

### Auto-Scaling Configuration

The application includes Horizontal Pod Autoscaler (HPA) configurations:

**Application Pods:**
- Min replicas: 3
- Max replicas: 50
- CPU target: 75%
- Memory target: 80%

**Worker Pods:**
- Min replicas: 5
- Max replicas: 50
- CPU target: 75%
- Queue-based scaling

## Load Testing

### Using Locust

```bash
cd loadtesting
pip install locust

# Run with UI
locust -f locustfile.py --host=http://localhost:3000

# Run headless
locust -f locustfile.py \
  --host=http://localhost:3000 \
  --users 100 \
  --spawn-rate 10 \
  --run-time 5m \
  --headless
```

### Using k6

```bash
# Install k6
brew install k6  # macOS
# OR download from https://k6.io

# Run test
k6 run --vus 100 --duration 5m loadtesting/k6-test.js
```

### Automated Test Runner

```bash
cd loadtesting
chmod +x run-loadtest.sh
./run-loadtest.sh
```

## Performance Tuning

### API Key Configuration

For optimal performance with multiple API keys:

```env
# Single key (basic)
ANTHROPIC_API_KEY=sk-ant-...

# Multiple keys (recommended for scale)
ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2,sk-ant-key3,sk-ant-key4
```

**Recommended setup:**
- 3-5 keys for moderate traffic (< 1000 req/day)
- 5-10 keys for high traffic (1000-10000 req/day)
- 10+ keys for enterprise scale (> 10000 req/day)

### Cache Optimization

```env
# Standard cache
CACHE_TTL=3600              # 1 hour (balance freshness vs hits)
MAX_CACHE_SIZE=10000        # Adjust based on memory

# Semantic cache
SEMANTIC_CACHE_THRESHOLD=0.92  # Higher = stricter matching
SEMANTIC_CACHE_MAX_ENTRIES=5000
SEMANTIC_CACHE_TTL=86400       # 24 hours
```

**Recommendations:**
- Lower threshold (0.85-0.90) for better hit rate
- Higher threshold (0.95-0.98) for more accurate matching
- Adjust based on your use case

### Worker Scaling

Adjust worker count based on load:

```typescript
// In production, monitor queue depth
const queueDepth = queue.getStats().queueSize;
if (queueDepth > 100) {
  await workerManager.scale(10);
} else if (queueDepth < 20) {
  await workerManager.scale(5);
}
```

## Monitoring and Alerts

### Prometheus Alerts

Configured in `monitoring/alerts.yml`:
- High error rate (> 10%)
- API quota warnings (70%, 85%, 95%)
- High latency (> 5s p95)
- Large queue size (> 1000)
- Worker errors

### Grafana Dashboards

Access at http://localhost:3001 after deploying:
- System Overview
- API Performance
- Cache Analytics
- Queue Metrics
- Cost Tracking

## Cost Optimization

### Track API Costs

```typescript
import { recordModelUsage } from '@/lib/scaling/metricsCollector';

// After each API call
recordModelUsage(model, inputTokens, outputTokens, estimatedCost);
```

### View Cost Metrics

```bash
# Prometheus query
sum(rate(model_cost_usd_total[1h])) by (model)

# Dashboard API
curl http://localhost:3000/api/monitoring/dashboard | jq '.metrics'
```

### Cost Reduction Strategies

1. **Enable caching aggressively** - Can reduce costs by 40-60%
2. **Use semantic caching** - Catches similar queries
3. **Route simple queries to Haiku** - 20x cheaper than Sonnet
4. **Set appropriate TTLs** - Balance freshness vs cost
5. **Monitor and alert on quota** - Prevent unexpected bills

## Troubleshooting

### High Error Rate

1. Check API key health:
```bash
curl http://localhost:3000/api/monitoring/dashboard | jq '.apiKeys'
```

2. Check circuit breakers:
```typescript
const metrics = apiKeyManager.getMetrics();
// Look for circuitBreakerOpen: true
```

3. Scale workers if queue is backing up:
```bash
kubectl scale deployment chatgpt-philippines-worker --replicas=10
```

### Poor Cache Performance

1. Check cache hit rate:
```bash
curl http://localhost:3000/api/monitoring/dashboard | jq '.cache'
```

2. Adjust cache TTL or size
3. Enable semantic cache
4. Pre-warm cache for common queries

### Memory Issues

1. Reduce cache size
2. Lower semantic cache entries
3. Increase pod memory limits
4. Enable Redis for distributed caching

## Security Considerations

1. **Never commit API keys** - Use Kubernetes secrets
2. **Rotate keys regularly** - Update secrets and redeploy
3. **Monitor for abuse** - Check rate limit logs
4. **Use HTTPS** - Always encrypt traffic
5. **Implement authentication** - Protect monitoring endpoints

## Future Enhancements

- [ ] Redis integration for distributed caching
- [ ] Real embedding model for semantic cache
- [ ] Distributed tracing with OpenTelemetry
- [ ] Multi-region deployment
- [ ] Advanced cost attribution
- [ ] A/B testing framework
- [ ] Request deduplication
- [ ] Adaptive model selection

## Support

For issues or questions:
1. Check logs: `kubectl logs -f deployment/chatgpt-philippines-app`
2. View health: `/api/monitoring/health`
3. Check metrics: `/api/monitoring/dashboard`
4. Review alerts: Prometheus/Grafana

## License

See LICENSE file for details.
