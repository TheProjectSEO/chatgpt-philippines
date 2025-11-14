/**
 * Custom MCP Tools (In-Process)
 * These tools give agents access to your infrastructure
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase MCP Tools
 * Gives agents access to your database
 */
export const supabaseTools = [
  {
    name: 'query_usage_stats',
    description: 'Query model usage statistics from the database. Returns usage data including tokens and costs.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'Optional user ID to filter by',
        },
        start_date: {
          type: 'string',
          description: 'Start date in ISO format (e.g., 2024-01-01)',
        },
        end_date: {
          type: 'string',
          description: 'End date in ISO format (e.g., 2024-12-31)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 100,
        },
      },
    },
    execute: async (params: any) => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { user_id, start_date, end_date, limit = 100 } = params;

        let query = supabase
          .from('model_usage')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (user_id) query = query.eq('user_id', user_id);
        if (start_date) query = query.gte('created_at', start_date);
        if (end_date) query = query.lte('created_at', end_date);

        const { data, error } = await query;

        if (error) {
          console.error('[MCP] Supabase query error:', error);
          return { error: error.message, results: [] };
        }

        // Calculate summary stats
        const totalCost = data?.reduce((sum, row) => sum + (row.cost_usd || 0), 0) || 0;
        const totalInputTokens = data?.reduce((sum, row) => sum + (row.input_tokens || 0), 0) || 0;
        const totalOutputTokens = data?.reduce((sum, row) => sum + (row.output_tokens || 0), 0) || 0;

        return {
          success: true,
          count: data?.length || 0,
          results: data,
          summary: {
            totalCost: totalCost.toFixed(4),
            totalInputTokens,
            totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
          },
        };
      } catch (error: any) {
        console.error('[MCP] Tool execution error:', error);
        return { error: error.message, results: [] };
      }
    },
  },
  {
    name: 'get_user_info',
    description: 'Get information about a user from the database',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID to look up',
        },
      },
      required: ['user_id'],
    },
    execute: async (params: any) => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', params.user_id)
          .single();

        if (error) {
          return { error: error.message };
        }

        return { success: true, user: data };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  },
];

/**
 * Redis Cache MCP Tools
 * Gives agents access to cache statistics
 */
export const redisCacheTools = [
  {
    name: 'get_cache_stats',
    description: 'Get cache performance statistics including hit rate and memory usage',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      try {
        const { getCacheManager } = await import('../cache');
        const cache = await getCacheManager();
        const stats = await cache.getStats();

        return {
          success: true,
          ...stats,
        };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  },
  {
    name: 'clear_cache',
    description: 'Clear all cache entries (use with caution)',
    inputSchema: {
      type: 'object',
      properties: {
        confirm: {
          type: 'boolean',
          description: 'Must be true to confirm cache clearing',
        },
      },
      required: ['confirm'],
    },
    execute: async (params: any) => {
      if (!params.confirm) {
        return { error: 'Cache clear not confirmed' };
      }

      try {
        const { getCacheManager } = await import('../cache');
        const cache = await getCacheManager();
        await cache.clear();

        return { success: true, message: 'Cache cleared successfully' };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  },
];

/**
 * API Key Manager Tools
 * Gives agents visibility into API key health
 */
export const apiKeyTools = [
  {
    name: 'get_api_key_health',
    description: 'Get health status of all API keys including circuit breaker status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      try {
        const { getAPIKeyManager } = await import('../apiKeyManager');
        const manager = getAPIKeyManager();
        const health = manager.getHealthStatus();
        const alerts = manager.getUsageAlerts();

        return {
          success: true,
          health,
          alerts,
        };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  },
];

/**
 * Analytics Tools
 * Gives agents ability to query analytics data
 */
export const analyticsTools = [
  {
    name: 'get_cost_summary',
    description: 'Get cost summary for a date range',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in ISO format',
        },
        end_date: {
          type: 'string',
          description: 'End date in ISO format',
        },
        group_by: {
          type: 'string',
          enum: ['model', 'user', 'day'],
          description: 'How to group the results',
          default: 'model',
        },
      },
    },
    execute: async (params: any) => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { start_date, end_date, group_by = 'model' } = params;

        let query = supabase.from('model_usage').select('*');

        if (start_date) query = query.gte('created_at', start_date);
        if (end_date) query = query.lte('created_at', end_date);

        const { data, error } = await query;

        if (error) {
          return { error: error.message };
        }

        // Group and summarize data
        const grouped: any = {};

        data?.forEach((row) => {
          let key: string;

          if (group_by === 'model') {
            key = row.model;
          } else if (group_by === 'user') {
            key = row.user_id || 'anonymous';
          } else if (group_by === 'day') {
            key = new Date(row.created_at).toISOString().split('T')[0];
          } else {
            key = 'total';
          }

          if (!grouped[key]) {
            grouped[key] = {
              count: 0,
              totalCost: 0,
              inputTokens: 0,
              outputTokens: 0,
            };
          }

          grouped[key].count++;
          grouped[key].totalCost += row.cost_usd || 0;
          grouped[key].inputTokens += row.input_tokens || 0;
          grouped[key].outputTokens += row.output_tokens || 0;
        });

        return {
          success: true,
          groupBy: group_by,
          results: grouped,
          totalRecords: data?.length || 0,
        };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  },
];

/**
 * Get all available custom tools
 */
export function getAllCustomTools() {
  return [
    ...supabaseTools,
    ...redisCacheTools,
    ...apiKeyTools,
    ...analyticsTools,
  ];
}

/**
 * Get safe tools (read-only, no mutations)
 */
export function getSafeTools() {
  return [
    ...supabaseTools.filter((t) => t.name === 'query_usage_stats' || t.name === 'get_user_info'),
    ...redisCacheTools.filter((t) => t.name === 'get_cache_stats'),
    ...apiKeyTools,
    ...analyticsTools,
  ];
}
