-- Create rate_limits table for IP-based rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(ip, fingerprint)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip);
CREATE INDEX IF NOT EXISTS idx_rate_limits_fingerprint ON rate_limits(fingerprint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_reset ON rate_limits(last_reset);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_activity ON rate_limits(last_activity);

-- Create composite index for the OR query
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_fingerprint ON rate_limits(ip, fingerprint);

-- Auto-cleanup function for old entries (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE last_activity < NOW() - INTERVAL '7 days';
END;
$$;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- Note: If pg_cron is not available, you can run this manually or via a cron job
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_old_rate_limits()');

-- Add comment for documentation
COMMENT ON TABLE rate_limits IS 'Stores rate limiting data for guest users based on IP and browser fingerprint';
COMMENT ON COLUMN rate_limits.ip IS 'Client IP address (primary tracking method)';
COMMENT ON COLUMN rate_limits.fingerprint IS 'Browser fingerprint (secondary tracking method for VPN bypass detection)';
COMMENT ON COLUMN rate_limits.message_count IS 'Number of messages sent in current period';
COMMENT ON COLUMN rate_limits.last_reset IS 'When the rate limit counter was last reset (24-hour period)';
COMMENT ON COLUMN rate_limits.last_activity IS 'Last time this record was accessed';
