import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Analytics] Missing Supabase credentials');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export interface ModelUsageData {
  user_id?: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

export async function trackModelUsage(data: ModelUsageData): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.log('[Analytics] Skipping tracking - Supabase not configured');
      return;
    }

    const { error } = await supabase.from('model_usage').insert({
      user_id: data.user_id || null,
      model: data.model,
      input_tokens: data.input_tokens,
      output_tokens: data.output_tokens,
      cost_usd: data.cost_usd,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Analytics] Failed to track model usage:', error);
    } else {
      console.log('[Analytics] Model usage tracked successfully');
    }
  } catch (error) {
    console.error('[Analytics] Error tracking model usage:', error);
  }
}

export interface UsageStats {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  modelBreakdown: {
    [model: string]: {
      count: number;
      cost: number;
      tokens: number;
    };
  };
}

export async function getUserUsageStats(userId: string, days: number = 30): Promise<UsageStats | null> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.log('[Analytics] Skipping stats - Supabase not configured');
      return null;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('model_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('[Analytics] Failed to get usage stats:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalCost: 0,
        totalTokens: 0,
        requestCount: 0,
        modelBreakdown: {},
      };
    }

    const stats: UsageStats = {
      totalCost: 0,
      totalTokens: 0,
      requestCount: data.length,
      modelBreakdown: {},
    };

    data.forEach((record) => {
      const tokens = record.input_tokens + record.output_tokens;
      stats.totalCost += record.cost_usd;
      stats.totalTokens += tokens;

      if (!stats.modelBreakdown[record.model]) {
        stats.modelBreakdown[record.model] = {
          count: 0,
          cost: 0,
          tokens: 0,
        };
      }

      stats.modelBreakdown[record.model].count++;
      stats.modelBreakdown[record.model].cost += record.cost_usd;
      stats.modelBreakdown[record.model].tokens += tokens;
    });

    return stats;
  } catch (error) {
    console.error('[Analytics] Error getting usage stats:', error);
    return null;
  }
}

export async function getGlobalUsageStats(days: number = 30): Promise<UsageStats | null> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.log('[Analytics] Skipping stats - Supabase not configured');
      return null;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('model_usage')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('[Analytics] Failed to get global stats:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalCost: 0,
        totalTokens: 0,
        requestCount: 0,
        modelBreakdown: {},
      };
    }

    const stats: UsageStats = {
      totalCost: 0,
      totalTokens: 0,
      requestCount: data.length,
      modelBreakdown: {},
    };

    data.forEach((record) => {
      const tokens = record.input_tokens + record.output_tokens;
      stats.totalCost += record.cost_usd;
      stats.totalTokens += tokens;

      if (!stats.modelBreakdown[record.model]) {
        stats.modelBreakdown[record.model] = {
          count: 0,
          cost: 0,
          tokens: 0,
        };
      }

      stats.modelBreakdown[record.model].count++;
      stats.modelBreakdown[record.model].cost += record.cost_usd;
      stats.modelBreakdown[record.model].tokens += tokens;
    });

    return stats;
  } catch (error) {
    console.error('[Analytics] Error getting global stats:', error);
    return null;
  }
}
