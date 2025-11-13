-- Create model_usage table for tracking AI model usage and costs
CREATE TABLE IF NOT EXISTS model_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_model_usage_user ON model_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_created ON model_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_model_usage_model ON model_usage(model);
CREATE INDEX IF NOT EXISTS idx_model_usage_user_created ON model_usage(user_id, created_at);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_model_usage_user_model ON model_usage(user_id, model);

-- Add comment to table
COMMENT ON TABLE model_usage IS 'Tracks AI model usage, token consumption, and associated costs for analytics and billing';

-- Add comments to columns
COMMENT ON COLUMN model_usage.user_id IS 'User ID from Auth0 (nullable for guest users)';
COMMENT ON COLUMN model_usage.model IS 'The AI model used (e.g., claude-3-5-haiku-20241022)';
COMMENT ON COLUMN model_usage.input_tokens IS 'Number of input tokens consumed';
COMMENT ON COLUMN model_usage.output_tokens IS 'Number of output tokens generated';
COMMENT ON COLUMN model_usage.cost_usd IS 'Estimated cost in USD based on token usage';
COMMENT ON COLUMN model_usage.created_at IS 'Timestamp when the request was made';
