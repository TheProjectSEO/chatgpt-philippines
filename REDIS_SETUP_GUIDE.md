# Redis Setup Guide - Upstash Free Tier

This guide will help you set up Redis using Upstash's free tier for the security system (rate limiting and abuse detection).

## Why Redis?

The security system uses Redis for:
- **Rate Limiting**: Sliding window algorithm for precise rate limiting
- **Abuse Detection**: Pattern tracking and risk scoring
- **IP Blocking**: Temporary IP bans for malicious activity
- **Performance**: Fast in-memory operations
- **Graceful Degradation**: Automatic fallback to in-memory storage if Redis is unavailable

## Option 1: Upstash (Recommended - FREE)

Upstash offers a generous free tier that's perfect for this application.

### Step 1: Create Upstash Account

1. Go to [https://upstash.com/](https://upstash.com/)
2. Click "Sign Up" (can use GitHub, Google, or email)
3. Verify your email address

### Step 2: Create Redis Database

1. After logging in, click "Create Database"
2. Configure your database:
   - **Name**: `chatgpt-ph-security` (or any name you prefer)
   - **Type**: Regional
   - **Region**: Choose closest to your deployment (e.g., `ap-southeast-1` for Singapore/Asia)
   - **Primary Region**: Same as above
   - **Read Regions**: None needed for free tier
   - **TLS**: Enabled (recommended)
   - **Eviction**: Select `noeviction` (prevents data loss)

3. Click "Create"

### Step 3: Get Connection Details

After creation, you'll see your database details:

1. Click on your database name
2. Scroll to "REST API" section (NOT "Redis Client")
3. Copy the following:
   - **UPSTASH_REDIS_REST_URL**: `https://...upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: Your authentication token

### Step 4: Configure Environment Variables

Add to your `.env.local` file:

```env
# Upstash Redis Configuration
REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT

# Alternative: Use REST API (recommended for serverless)
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**For standard Redis client (Node.js):**

1. In Upstash dashboard, go to "Details" tab
2. Find "Redis Connect" section
3. Copy the connection string that looks like:
   ```
   redis://default:AbCdEf123456@us1-perfect-shark-12345.upstash.io:6379
   ```
4. Use this as `REDIS_URL`

**For REST API (serverless/edge functions):**

Use the REST URL and token from Step 3.

### Step 5: Test Connection

Create a test file to verify connection:

```javascript
// test-redis.js
const { createClient } = require('redis');

async function testRedis() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on('error', (err) => console.error('Redis error:', err));
  client.on('connect', () => console.log('✅ Redis connected successfully!'));

  try {
    await client.connect();
    await client.set('test-key', 'Hello from Redis!');
    const value = await client.get('test-key');
    console.log('✅ Test value:', value);
    await client.quit();
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
}

testRedis();
```

Run: `node test-redis.js`

## Option 2: Local Redis (Development)

For local development, you can run Redis locally.

### macOS (using Homebrew)

```bash
# Install Redis
brew install redis

# Start Redis server
brew services start redis

# Or run manually
redis-server
```

Environment variable:
```env
REDIS_URL=redis://localhost:6379
```

### Windows (using WSL)

```bash
# Install Redis in WSL
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo service redis-server start
```

### Docker

```bash
# Pull and run Redis
docker run -d -p 6379:6379 --name redis-security redis:7-alpine

# Stop Redis
docker stop redis-security

# Start Redis
docker start redis-security
```

Environment variable:
```env
REDIS_URL=redis://localhost:6379
```

## Upstash Free Tier Limits

The free tier includes:
- **10,000 commands/day** - Perfect for small to medium traffic
- **256 MB storage** - More than enough for rate limiting data
- **Concurrent connections**: 100
- **Max request size**: 1 MB
- **Max record size**: 100 MB
- **TLS/SSL**: Included
- **Global replication**: Upgrade required

### Is Free Tier Enough?

For a typical application:
- Rate limit checks: ~2-3 commands per API request
- 10,000 commands/day = ~3,000-5,000 API requests/day
- Storage: Rate limit data is time-limited and auto-expires

If you exceed limits, Upstash offers:
- **Pay-as-you-go**: $0.20 per 100K commands
- **Pro plan**: 1M commands/day for $10/month

## Graceful Degradation

**Important**: The security system automatically falls back to in-memory storage if Redis is unavailable.

This means:
- Your app won't crash if Redis fails
- Rate limiting still works (limited to single server instance)
- Perfect for development without Redis setup

However, in-memory fallback has limitations:
- Data doesn't persist across server restarts
- Not shared across multiple server instances
- Higher memory usage on the server

## Monitoring Redis Usage

### Upstash Dashboard

1. Go to [console.upstash.com](https://console.upstash.com)
2. Click on your database
3. View "Metrics" tab:
   - Daily commands
   - Storage usage
   - Latency

### Using Redis CLI

```bash
# Connect to Upstash
redis-cli -h your-host.upstash.io -p 6379 -a your-password --tls

# View stats
INFO stats

# View memory usage
INFO memory

# View key count
DBSIZE

# View specific keys
KEYS ratelimit:*
KEYS abuse:*
```

## Security Best Practices

1. **Never commit credentials**: Add `.env.local` to `.gitignore`
2. **Use TLS**: Always enable TLS/SSL for production
3. **Rotate tokens**: Regenerate Upstash tokens periodically
4. **Monitor usage**: Set up alerts in Upstash dashboard
5. **Restrict access**: Use Upstash IP allowlist if needed

## Troubleshooting

### Connection Timeout

**Problem**: Redis connection times out

**Solution**:
- Check if `REDIS_URL` is correct
- Verify TLS is enabled if using Upstash
- Check firewall/network restrictions
- Ensure Upstash region is accessible

### Authentication Error

**Problem**: "ERR invalid password"

**Solution**:
- Verify password in connection string
- Check if password contains special characters (URL encode them)
- Regenerate password in Upstash dashboard

### Commands Limit Exceeded

**Problem**: Rate limiting stops working

**Solution**:
- Check Upstash dashboard for usage
- Upgrade to Pay-as-you-go or Pro plan
- Optimize Redis usage (increase TTL on keys)
- The system will automatically fall back to in-memory

### Connection Pool Exhausted

**Problem**: "All connections in pool are in use"

**Solution**:
- Increase connection pool size
- Check for connection leaks
- Ensure connections are properly closed

## Verification Checklist

After setup, verify:

- [ ] Upstash database created
- [ ] `REDIS_URL` added to `.env.local`
- [ ] Connection test successful
- [ ] Rate limiting works (test API endpoint)
- [ ] Abuse detection logs appear in console
- [ ] Dashboard shows connection

## Next Steps

1. ✅ Set up Redis (this guide)
2. ⏭️ Integrate security system into your API routes
3. ⏭️ Configure rate limits for your use case
4. ⏭️ Set up monitoring and alerts
5. ⏭️ Deploy to production

## Support

- **Upstash Docs**: https://docs.upstash.com/redis
- **Upstash Discord**: https://upstash.com/discord
- **Redis Docs**: https://redis.io/docs/

## Environment Variable Reference

Required for security system:

```env
# Option 1: Standard Redis URL (recommended for Node.js apps)
REDIS_URL=redis://default:password@host:port

# Option 2: Upstash REST API (for serverless/edge)
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Optional: Supabase (for legacy rate limiting)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

The security system will automatically detect which configuration is available and use the appropriate method.
