# Quick Start Guide - Enterprise Scaling Architecture

Get the enterprise scaling architecture up and running in minutes.

## 🚀 Quick Start (Docker)

The fastest way to get started:

```bash
# 1. Clone and navigate
cd chatgpt-philippines

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start all services (Redis, Web, Workers, Prometheus, Grafana)
npm run docker:up

# 4. Access the application
# Web: http://localhost:3000
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

That's it! You now have:
- ✅ Web application with 3 replicas
- ✅ 4 worker processes
- ✅ Redis cache & queue
- ✅ Prometheus monitoring
- ✅ Grafana dashboards

## 📋 Prerequisites

### Required
- Node.js 18+ (`node --version`)
- Docker & Docker Compose (`docker --version`)

### Recommended
- Redis 7+ (for local development)
- Kubernetes cluster (for production)
- kubectl (`kubectl version`)

## ⚡ Installation Steps

### Option 1: Docker (Recommended)

**Advantages:** Everything configured, no manual setup needed

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# Required: Add your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional: Add more keys for load balancing
ANTHROPIC_API_KEY_2=sk-ant-yyyyy
ANTHROPIC_API_KEY_3=sk-ant-zzzzz

# 3. Build Docker images
npm run docker:build
npm run docker:build:worker

# 4. Start services
npm run docker:up

# 5. Check status
docker ps
npm run docker:logs
```

### Option 2: Local Development

**Advantages:** Faster iteration, easier debugging

```bash
# 1. Install dependencies
npm install

# 2. Start Redis
docker run -d -p 6379:6379 redis:7-alpine
# Or: brew install redis && redis-server

# 3. Configure environment
cp .env.example .env
# Edit with your API keys and set:
REDIS_URL=redis://localhost:6379

# 4. Start application
npm run dev

# 5. (Optional) Start workers in separate terminals
npm run worker
```

### Option 3: Production (Kubernetes)

**Advantages:** Auto-scaling, high availability, production-ready

```bash
# 1. Create namespace
kubectl create namespace chatgpt-philippines

# 2. Create secrets
kubectl create secret generic chatgpt-philippines-secrets \
  --from-literal=anthropic-api-key=$ANTHROPIC_API_KEY \
  --from-literal=redis-url=redis://chatgpt-philippines-redis:6379 \
  --from-literal=supabase-anon-key=$SUPABASE_ANON_KEY \
  --from-literal=supabase-service-role-key=$SUPABASE_SERVICE_ROLE_KEY \
  -n chatgpt-philippines

# 3. Create configmap
kubectl create configmap chatgpt-philippines-config \
  --from-literal=supabase-url=$SUPABASE_URL \
  -n chatgpt-philippines

# 4. Deploy application
kubectl apply -f k8s/ -n chatgpt-philippines

# 5. Check status
kubectl get pods -n chatgpt-philippines
kubectl get svc -n chatgpt-philippines

# 6. Access application
kubectl port-forward svc/chatgpt-philippines-web 3000:80 -n chatgpt-philippines
```

## 🔧 Configuration

### Minimum Configuration (.env)

```bash
# API Keys (Required)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Redis (Required for scaling)
REDIS_URL=redis://localhost:6379

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Auth0 (Optional, but recommended)
AUTH0_SECRET=xxx
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://xxx.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
```

### Recommended Configuration (.env)

```bash
# Multiple API Keys for load balancing
ANTHROPIC_API_KEY=sk-ant-key1
ANTHROPIC_API_KEY_2=sk-ant-key2
ANTHROPIC_API_KEY_3=sk-ant-key3
ANTHROPIC_API_KEY_FALLBACK_1=sk-ant-fallback

# Redis with password
REDIS_URL=redis://:password@localhost:6379

# Worker configuration
WORKER_CONCURRENCY=5
WORKER_ID=worker-1

# Monitoring
GRAFANA_PASSWORD=secure_password
```

## 🧪 Testing the Setup

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "apiKeys": { "status": "healthy" },
    "cache": { "status": "healthy" },
    "queue": { "status": "healthy" }
  }
}
```

### 2. Test Chat API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "claude-3-7-sonnet-20250219"
  }'
```

### 3. Check Metrics

```bash
curl http://localhost:3000/api/metrics
```

### 4. View Admin Status

```bash
curl http://localhost:3000/api/admin/status
```

## 📊 Monitoring

### Grafana Dashboards

1. **Access:** http://localhost:3001
2. **Login:** admin / admin (change password on first login)
3. **Dashboards:**
   - System Overview
   - API Key Health
   - Cache Performance
   - Queue Statistics

### Prometheus

1. **Access:** http://localhost:9090
2. **Query examples:**
   ```
   api_keys_healthy
   cache_hit_rate
   queue_pending
   rate(queue_completed_total[5m])
   ```

### Logs

```bash
# Docker logs
npm run docker:logs

# Kubernetes logs
kubectl logs -f deployment/chatgpt-philippines-web -n chatgpt-philippines
kubectl logs -f deployment/chatgpt-philippines-worker -n chatgpt-philippines

# Worker logs
tail -f /var/log/supervisor/chat_worker_01.log
```

## 🔥 Load Testing

### Quick Test (1000 users)

```bash
# Using Locust
cd load-testing
pip install -r requirements.txt
locust -f locustfile.py --users 1000 --spawn-rate 50 --host http://localhost:3000

# Using k6
k6 run --vus 1000 --duration 5m load-testing/k6-script.js
```

### Stress Test (10,000 users)

```bash
# Locust with headless mode
locust -f load-testing/locustfile.py \
  --users 10000 \
  --spawn-rate 100 \
  --host http://localhost:3000 \
  --headless \
  --run-time 10m

# k6 with stages
k6 run load-testing/k6-script.js
```

## 🐛 Troubleshooting

### Issue: "No API keys available"

**Solution:**
```bash
# Check API key in .env
echo $ANTHROPIC_API_KEY

# Verify key is loaded
curl http://localhost:3000/api/admin/status | jq '.apiKeys'
```

### Issue: "Cache not available"

**Solution:**
```bash
# Check Redis is running
redis-cli ping
# Should respond: PONG

# Check Redis connection
docker logs chatgpt-philippines-redis

# Restart Redis
docker restart chatgpt-philippines-redis
```

### Issue: "Queue backlog building up"

**Solution:**
```bash
# Scale up workers
docker-compose up -d --scale worker=8

# Or in Kubernetes
kubectl scale deployment chatgpt-philippines-worker --replicas=10 -n chatgpt-philippines
```

### Issue: "High memory usage"

**Solution:**
```bash
# Clear cache
curl -X POST http://localhost:3000/api/admin/status \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_cache"}'

# Restart services
npm run docker:down
npm run docker:up
```

## 📈 Scaling Guide

### Small Scale (500 concurrent users)

```yaml
# docker-compose.yml
services:
  worker:
    deploy:
      replicas: 5
```

**Resources needed:**
- 2 CPU cores
- 4 GB RAM
- $10-20/month

### Medium Scale (5,000 concurrent users)

```yaml
# k8s/hpa.yaml
minReplicas: 10
maxReplicas: 30
```

**Resources needed:**
- 8 CPU cores
- 16 GB RAM
- $100-200/month

### Large Scale (10,000+ concurrent users)

```yaml
# k8s/hpa.yaml
minReplicas: 20
maxReplicas: 50
```

**Resources needed:**
- 32+ CPU cores
- 64+ GB RAM
- $500-1000/month

## 🎯 Next Steps

1. **Enable Authentication**
   ```typescript
   // app/api/chat/route.ts
   const session = await getSession(); // Uncomment this
   ```

2. **Configure Budget Limits**
   ```typescript
   // Set daily spending limits in apiKeyManager.ts
   dailyLimit: 50000 // requests per day
   ```

3. **Deploy to Production**
   ```bash
   # Build production images
   docker build -t registry.your-domain.com/chatgpt-philippines .
   docker push registry.your-domain.com/chatgpt-philippines

   # Deploy to K8s
   kubectl apply -f k8s/ -n production
   ```

4. **Set Up Alerts**
   - Configure PagerDuty/Slack webhooks
   - Set up Prometheus alerting rules
   - Configure uptime monitoring

5. **Performance Tuning**
   - Analyze cache hit rates
   - Optimize model selection
   - Fine-tune worker concurrency

## 📚 Additional Resources

- [Full Architecture Documentation](./SCALING_ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Kubernetes Guide](./k8s/README.md)
- [Load Testing Guide](./load-testing/README.md)

## 💡 Tips

1. **Start small:** Begin with Docker Compose, scale to Kubernetes later
2. **Monitor early:** Set up Grafana from day 1
3. **Cache aggressively:** Can reduce costs by 60-80%
4. **Use multiple API keys:** Better rate limits and reliability
5. **Test before scaling:** Run load tests to understand limits

## 🆘 Getting Help

- **GitHub Issues:** https://github.com/TheProjectSEO/chatgpt-philippines/issues
- **Documentation:** See [SCALING_ARCHITECTURE.md](./SCALING_ARCHITECTURE.md)
- **Health Check:** `curl http://localhost:3000/api/health`

---

**Ready to scale?** Start with Docker, then move to Kubernetes as your traffic grows! 🚀
