-- ============================================================================
-- Analytics Tables Schema for Supabase
-- ============================================================================
-- This script creates analytics tracking tables for web vitals, page views,
-- user behavior, and event tracking with proper indexing and RLS policies.
-- Data is anonymized and privacy-compliant.
-- ============================================================================

-- ============================================================================
-- Table: web_vitals
-- Stores Core Web Vitals metrics (LCP, FCP, CLS, INP, TTFB)
-- ============================================================================
CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metric Information
  metric_name TEXT NOT NULL CHECK (
    metric_name IN ('LCP', 'FCP', 'CLS', 'INP', 'TTFB', 'FID')
  ),
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT NOT NULL CHECK (
    metric_rating IN ('good', 'needs-improvement', 'poor')
  ),
  metric_delta NUMERIC,
  metric_id TEXT NOT NULL,

  -- Page Information (anonymized)
  page_url TEXT NOT NULL,
  page_path TEXT NOT NULL,
  navigation_type TEXT,

  -- Anonymized User Information
  session_id TEXT, -- Anonymous session identifier
  user_agent_hash TEXT, -- Hashed user agent for privacy
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser_name TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Table: page_views
-- Tracks page view events
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Page Information
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,

  -- Session Information (anonymized)
  session_id TEXT NOT NULL,
  visitor_id TEXT, -- Anonymous visitor ID

  -- Device & Location (anonymized)
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  country_code TEXT, -- Only country, not precise location

  -- Engagement Metrics
  time_on_page INTEGER, -- seconds
  scroll_depth INTEGER, -- percentage

  -- Timestamps
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Table: user_events
-- Tracks user interaction events
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event Information
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'click', 'form_submit', 'tool_usage', 'download',
      'search', 'share', 'copy', 'error'
    )
  ),
  event_name TEXT NOT NULL,
  event_data JSONB, -- Flexible event-specific data

  -- Page Context
  page_path TEXT NOT NULL,

  -- Session Information (anonymized)
  session_id TEXT NOT NULL,
  visitor_id TEXT,

  -- Timestamps
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Table: tool_usage_analytics
-- Tracks specific tool usage and performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS tool_usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tool Information
  tool_name TEXT NOT NULL,
  tool_action TEXT NOT NULL, -- e.g., 'generate', 'analyze', 'check'

  -- Usage Metrics
  input_length INTEGER,
  output_length INTEGER,
  processing_time INTEGER, -- milliseconds
  success BOOLEAN DEFAULT true,
  error_type TEXT,

  -- Session Information (anonymized)
  session_id TEXT NOT NULL,
  visitor_id TEXT,

  -- Model Information (if applicable)
  model_used TEXT,

  -- Timestamps
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Table: analytics_summary_daily
-- Daily aggregated analytics for dashboard performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_summary_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Date
  date DATE NOT NULL UNIQUE,

  -- Page View Metrics
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page NUMERIC,
  avg_scroll_depth NUMERIC,

  -- Web Vitals Averages
  avg_lcp NUMERIC,
  avg_fcp NUMERIC,
  avg_cls NUMERIC,
  avg_inp NUMERIC,
  avg_ttfb NUMERIC,

  -- Tool Usage
  total_tool_usage INTEGER DEFAULT 0,
  unique_tool_users INTEGER DEFAULT 0,

  -- Event Counts
  total_events INTEGER DEFAULT 0,

  -- Top Pages (JSONB array of {path, views})
  top_pages JSONB,

  -- Top Tools (JSONB array of {tool, uses})
  top_tools JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Web Vitals Indexes
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at
  ON web_vitals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name
  ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_path
  ON web_vitals(page_path);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating
  ON web_vitals(metric_rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_session
  ON web_vitals(session_id);

-- Page Views Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at
  ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path
  ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session
  ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor
  ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at
  ON page_views(viewed_at DESC);

-- User Events Indexes
CREATE INDEX IF NOT EXISTS idx_user_events_created_at
  ON user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type
  ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_page_path
  ON user_events(page_path);
CREATE INDEX IF NOT EXISTS idx_user_events_session
  ON user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name
  ON user_events(event_name);

-- Tool Usage Indexes
CREATE INDEX IF NOT EXISTS idx_tool_usage_created_at
  ON tool_usage_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_name
  ON tool_usage_analytics(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_usage_session
  ON tool_usage_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_success
  ON tool_usage_analytics(success);

-- Analytics Summary Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date
  ON analytics_summary_daily(date DESC);

-- ============================================================================
-- Triggers for Updated At
-- ============================================================================

DROP TRIGGER IF EXISTS update_analytics_summary_updated_at ON analytics_summary_daily;
CREATE TRIGGER update_analytics_summary_updated_at
  BEFORE UPDATE ON analytics_summary_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary_daily ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Web Vitals Policies
DROP POLICY IF EXISTS "Allow public insert web vitals" ON web_vitals;
CREATE POLICY "Allow public insert web vitals"
  ON web_vitals
  FOR INSERT
  WITH CHECK (true); -- Allow anonymous metric submission

DROP POLICY IF EXISTS "Allow authenticated read web vitals" ON web_vitals;
CREATE POLICY "Allow authenticated read web vitals"
  ON web_vitals
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Page Views Policies
DROP POLICY IF EXISTS "Allow public insert page views" ON page_views;
CREATE POLICY "Allow public insert page views"
  ON page_views
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read page views" ON page_views;
CREATE POLICY "Allow authenticated read page views"
  ON page_views
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- User Events Policies
DROP POLICY IF EXISTS "Allow public insert user events" ON user_events;
CREATE POLICY "Allow public insert user events"
  ON user_events
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read user events" ON user_events;
CREATE POLICY "Allow authenticated read user events"
  ON user_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Tool Usage Policies
DROP POLICY IF EXISTS "Allow public insert tool usage" ON tool_usage_analytics;
CREATE POLICY "Allow public insert tool usage"
  ON tool_usage_analytics
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read tool usage" ON tool_usage_analytics;
CREATE POLICY "Allow authenticated read tool usage"
  ON tool_usage_analytics
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Analytics Summary Policies
DROP POLICY IF EXISTS "Allow authenticated all analytics summary" ON analytics_summary_daily;
CREATE POLICY "Allow authenticated all analytics summary"
  ON analytics_summary_daily
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Helper Functions for Analytics
-- ============================================================================

-- Function to get web vitals summary for a date range
CREATE OR REPLACE FUNCTION get_web_vitals_summary(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  metric_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  metric_name TEXT,
  avg_value NUMERIC,
  p50_value NUMERIC,
  p75_value NUMERIC,
  p95_value NUMERIC,
  good_count BIGINT,
  needs_improvement_count BIGINT,
  poor_count BIGINT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wv.metric_name,
    ROUND(AVG(wv.metric_value)::numeric, 2) as avg_value,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY wv.metric_value)::numeric, 2) as p50_value,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY wv.metric_value)::numeric, 2) as p75_value,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY wv.metric_value)::numeric, 2) as p95_value,
    COUNT(*) FILTER (WHERE wv.metric_rating = 'good') as good_count,
    COUNT(*) FILTER (WHERE wv.metric_rating = 'needs-improvement') as needs_improvement_count,
    COUNT(*) FILTER (WHERE wv.metric_rating = 'poor') as poor_count,
    COUNT(*) as total_count
  FROM web_vitals wv
  WHERE
    wv.created_at >= start_date
    AND wv.created_at <= end_date
    AND (metric_filter IS NULL OR wv.metric_name = metric_filter)
  GROUP BY wv.metric_name
  ORDER BY wv.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get page views by path
CREATE OR REPLACE FUNCTION get_page_views_by_path(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  page_path TEXT,
  view_count BIGINT,
  unique_visitors BIGINT,
  avg_time_on_page NUMERIC,
  avg_scroll_depth NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.page_path,
    COUNT(*) as view_count,
    COUNT(DISTINCT pv.visitor_id) as unique_visitors,
    ROUND(AVG(pv.time_on_page)::numeric, 2) as avg_time_on_page,
    ROUND(AVG(pv.scroll_depth)::numeric, 2) as avg_scroll_depth
  FROM page_views pv
  WHERE
    pv.created_at >= start_date
    AND pv.created_at <= end_date
  GROUP BY pv.page_path
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get tool usage statistics
CREATE OR REPLACE FUNCTION get_tool_usage_stats(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  tool_name TEXT,
  usage_count BIGINT,
  unique_users BIGINT,
  avg_processing_time NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tua.tool_name,
    COUNT(*) as usage_count,
    COUNT(DISTINCT tua.visitor_id) as unique_users,
    ROUND(AVG(tua.processing_time)::numeric, 2) as avg_processing_time,
    ROUND((COUNT(*) FILTER (WHERE tua.success = true)::numeric / COUNT(*)::numeric * 100), 2) as success_rate
  FROM tool_usage_analytics tua
  WHERE
    tua.created_at >= start_date
    AND tua.created_at <= end_date
  GROUP BY tua.tool_name
  ORDER BY usage_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user behavior funnel
CREATE OR REPLACE FUNCTION get_user_funnel(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  step_name TEXT,
  user_count BIGINT,
  conversion_rate NUMERIC
) AS $$
DECLARE
  total_visitors BIGINT;
BEGIN
  -- Get total unique visitors
  SELECT COUNT(DISTINCT visitor_id) INTO total_visitors
  FROM page_views
  WHERE created_at >= start_date AND created_at <= end_date;

  RETURN QUERY
  WITH funnel_steps AS (
    SELECT
      'Visited Site' as step_name,
      COUNT(DISTINCT visitor_id) as user_count,
      1 as step_order
    FROM page_views
    WHERE created_at >= start_date AND created_at <= end_date

    UNION ALL

    SELECT
      'Used Tool' as step_name,
      COUNT(DISTINCT visitor_id) as user_count,
      2 as step_order
    FROM tool_usage_analytics
    WHERE created_at >= start_date AND created_at <= end_date

    UNION ALL

    SELECT
      'Clicked Action' as step_name,
      COUNT(DISTINCT visitor_id) as user_count,
      3 as step_order
    FROM user_events
    WHERE
      created_at >= start_date
      AND created_at <= end_date
      AND event_type IN ('click', 'form_submit')
  )
  SELECT
    fs.step_name,
    fs.user_count,
    ROUND((fs.user_count::numeric / NULLIF(total_visitors, 0)::numeric * 100), 2) as conversion_rate
  FROM funnel_steps fs
  ORDER BY fs.step_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT ON web_vitals TO authenticated;
GRANT SELECT ON page_views TO authenticated;
GRANT SELECT ON user_events TO authenticated;
GRANT SELECT ON tool_usage_analytics TO authenticated;
GRANT ALL ON analytics_summary_daily TO authenticated;

GRANT INSERT ON web_vitals TO anon;
GRANT INSERT ON page_views TO anon;
GRANT INSERT ON user_events TO anon;
GRANT INSERT ON tool_usage_analytics TO anon;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE web_vitals IS 'Core Web Vitals metrics tracking (anonymized)';
COMMENT ON TABLE page_views IS 'Page view analytics (anonymized, privacy-compliant)';
COMMENT ON TABLE user_events IS 'User interaction event tracking';
COMMENT ON TABLE tool_usage_analytics IS 'Tool-specific usage and performance metrics';
COMMENT ON TABLE analytics_summary_daily IS 'Daily aggregated analytics for dashboard performance';

COMMENT ON COLUMN web_vitals.session_id IS 'Anonymous session identifier (no PII)';
COMMENT ON COLUMN web_vitals.user_agent_hash IS 'Hashed user agent for privacy';
COMMENT ON COLUMN page_views.visitor_id IS 'Anonymous visitor ID (no PII)';
COMMENT ON COLUMN page_views.country_code IS 'ISO country code only (no precise location)';

-- ============================================================================
-- End of Analytics Schema
-- ============================================================================
