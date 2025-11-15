/**
 * MCP Integration Usage Examples
 *
 * This file demonstrates how to use the MCP integration layer with the Anthropic SDK.
 * It shows various ways to discover, configure, and use MCP tools in your applications.
 */

import { AnthropicSDK } from './anthropicSDK';
import {
  getMCPTools,
  getMCPTool,
  getToolsByCategory,
  getToolsByServer,
  listMCPServers,
  getMCPServerStats,
  convertMCPToolsToSDKTools,
  builtInTools,
  webSearchTool,
  supabaseQueryTool,
  seoSearchResultsTool,
} from './mcpIntegration';

// ============================================================================
// Example 1: Basic MCP Tool Usage
// ============================================================================

async function example1_basicToolUsage() {
  console.log('\n=== Example 1: Basic MCP Tool Usage ===\n');

  // Initialize SDK
  const sdk = new AnthropicSDK();

  // Use the web search tool
  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'What are the latest developments in AI in 2025?',
      },
    ],
    {
      tools: [webSearchTool] as any,
      model: 'claude-sonnet-4-20250514',
      maxTokens: 2048,
    }
  );

  console.log('Response:', response.response);
  console.log('Tool Uses:', response.toolUses);
}

// ============================================================================
// Example 2: Using Built-in Tool Collections
// ============================================================================

async function example2_builtInCollections() {
  console.log('\n=== Example 2: Using Built-in Tool Collections ===\n');

  const sdk = new AnthropicSDK();

  // Use all web research tools (search + crawl)
  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Research the latest AI frameworks and get details from their documentation pages.',
      },
    ],
    {
      tools: builtInTools.webResearch as any,
      model: 'claude-sonnet-4-20250514',
    }
  );

  console.log('Response:', response.response);
}

// ============================================================================
// Example 3: Category-based Tool Discovery
// ============================================================================

async function example3_categoryDiscovery() {
  console.log('\n=== Example 3: Category-based Tool Discovery ===\n');

  // Get all SEO tools
  const seoTools = getToolsByCategory('seo');
  console.log('Available SEO Tools:', seoTools.map(t => t.name));

  // Get all database tools
  const dbTools = getToolsByCategory('database');
  console.log('Available Database Tools:', dbTools.map(t => t.name));

  // Use SEO tools with SDK
  const sdk = new AnthropicSDK();
  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Analyze the SEO performance of example.com',
      },
    ],
    {
      tools: convertMCPToolsToSDKTools(seoTools),
    }
  );

  console.log('SEO Analysis:', response.response);
}

// ============================================================================
// Example 4: Server-based Tool Discovery
// ============================================================================

async function example4_serverDiscovery() {
  console.log('\n=== Example 4: Server-based Tool Discovery ===\n');

  // Get all tools from a specific MCP server
  const supabaseTools = getToolsByServer('supabase');
  console.log('Supabase Tools:', supabaseTools.map(t => t.name));

  const dataForSEOTools = getToolsByServer('dataforseo');
  console.log('DataForSEO Tools:', dataForSEOTools.map(t => t.name));
}

// ============================================================================
// Example 5: MCP Server Statistics
// ============================================================================

async function example5_serverStats() {
  console.log('\n=== Example 5: MCP Server Statistics ===\n');

  const stats = getMCPServerStats();
  console.log('Total Servers:', stats.totalServers);
  console.log('Enabled Servers:', stats.enabledServers);
  console.log('Total Tools:', stats.totalTools);
  console.log('Tools by Category:', stats.toolsByCategory);
  console.log('Tools by Server:', stats.toolsByServer);

  // List all servers
  const servers = listMCPServers();
  console.log('\nEnabled MCP Servers:');
  servers.forEach(server => {
    console.log(`- ${server.name} (${server.category}): ${server.description}`);
  });
}

// ============================================================================
// Example 6: Multi-tool Conversation
// ============================================================================

async function example6_multiToolConversation() {
  console.log('\n=== Example 6: Multi-tool Conversation ===\n');

  const sdk = new AnthropicSDK();

  // Use multiple tool categories
  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Search for information about Next.js, then look up its official documentation, and analyze its SEO ranking.',
      },
    ],
    {
      tools: [
        webSearchTool,
        ...builtInTools.docs,
        seoSearchResultsTool,
      ],
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    }
  );

  console.log('Multi-tool Response:', response.response);
  console.log('Tools Used:', response.toolUses?.map(t => t.name));
}

// ============================================================================
// Example 7: Custom Tool Filtering
// ============================================================================

async function example7_customFiltering() {
  console.log('\n=== Example 7: Custom Tool Filtering ===\n');

  // Get tools from specific categories
  const tools = getMCPTools({
    categories: ['search', 'docs'],
  });

  console.log('Search & Docs Tools:', tools.map(t => `${t.name} (${t.mcpServer})`));

  // Get tools from specific servers
  const specificTools = getMCPTools({
    servers: ['langgraph-crawler', 'context7'],
  });

  console.log('Specific Server Tools:', specificTools.map(t => t.name));
}

// ============================================================================
// Example 8: Database Query with Supabase
// ============================================================================

async function example8_databaseQuery() {
  console.log('\n=== Example 8: Database Query with Supabase ===\n');

  const sdk = new AnthropicSDK();

  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'List all tables in the database and show me the recent chat messages.',
      },
    ],
    {
      tools: builtInTools.database as any,
      model: 'claude-sonnet-4-20250514',
    }
  );

  console.log('Database Response:', response.response);
}

// ============================================================================
// Example 9: Extended Thinking with Tools
// ============================================================================

async function example9_thinkingWithTools() {
  console.log('\n=== Example 9: Extended Thinking with Tools ===\n');

  const sdk = new AnthropicSDK();

  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Research the best practices for Next.js SEO and create a comprehensive guide.',
      },
    ],
    {
      tools: [webSearchTool, seoSearchResultsTool],
      model: 'claude-sonnet-4-20250514',
      enableThinking: true,
      thinkingBudget: 5000,
      maxTokens: 8192,
    }
  );

  console.log('Thinking Process:', response.thinking);
  console.log('Final Response:', response.response);
  console.log('Tools Used:', response.toolUses?.map(t => t.name));
}

// ============================================================================
// Example 10: Prompt Caching with Tools
// ============================================================================

async function example10_promptCachingWithTools() {
  console.log('\n=== Example 10: Prompt Caching with Tools ===\n');

  const sdk = new AnthropicSDK();

  const systemPrompt = `
You are an SEO expert assistant. You have access to:
- Web search for current information
- SEO analysis tools for keyword research
- Database queries for historical data

Always provide data-driven insights backed by the tools available to you.
When analyzing SEO, consider:
1. Keyword difficulty and search volume
2. Current ranking positions
3. Competitor analysis
4. Content gaps and opportunities
`;

  // First request (creates cache)
  const response1 = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Analyze the SEO performance of my-website.com',
      },
    ],
    {
      systemPrompt,
      systemPromptCaching: true,
      tools: builtInTools.seo as any,
      model: 'claude-sonnet-4-20250514',
    }
  );

  console.log('First Response:', response1.response);
  console.log('Cache Created:', response1.usage.cache_creation_input_tokens);

  // Second request (uses cache)
  const response2 = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Now analyze competitor-site.com',
      },
    ],
    {
      systemPrompt,
      systemPromptCaching: true,
      tools: builtInTools.seo as any,
      model: 'claude-sonnet-4-20250514',
    }
  );

  console.log('Second Response:', response2.response);
  console.log('Cache Read:', response2.usage.cache_read_input_tokens);
}

// ============================================================================
// Example 11: Tool-specific Configuration
// ============================================================================

async function example11_toolSpecificConfig() {
  console.log('\n=== Example 11: Tool-specific Configuration ===\n');

  // Get a specific tool and check its details
  const tool = getMCPTool('web_search');

  if (tool) {
    console.log('Tool Name:', tool.name);
    console.log('Tool Description:', tool.description);
    console.log('MCP Server:', tool.mcpServer);
    console.log('MCP Tool Name:', tool.mcpToolName);
    console.log('Category:', tool.category);
    console.log('Input Schema:', JSON.stringify(tool.input_schema, null, 2));
  }
}

// ============================================================================
// Example 12: Error Handling
// ============================================================================

async function example12_errorHandling() {
  console.log('\n=== Example 12: Error Handling ===\n');

  const sdk = new AnthropicSDK();

  try {
    const response = await sdk.createMessage(
      [
        {
          role: 'user',
          content: 'Use an invalid tool that does not exist.',
        },
      ],
      {
        tools: [webSearchTool],
        model: 'claude-sonnet-4-20250514',
      }
    );

    console.log('Response:', response.response);

    // Check for tool errors
    response.toolUses?.forEach(toolUse => {
      if (toolUse.result?.error) {
        console.error(`Tool ${toolUse.name} failed:`, toolUse.result.error);
      }
    });
  } catch (error) {
    console.error('SDK Error:', error);
  }
}

// ============================================================================
// Run Examples
// ============================================================================

async function runAllExamples() {
  const examples = [
    example1_basicToolUsage,
    example2_builtInCollections,
    example3_categoryDiscovery,
    example4_serverDiscovery,
    example5_serverStats,
    example6_multiToolConversation,
    example7_customFiltering,
    example8_databaseQuery,
    example9_thinkingWithTools,
    example10_promptCachingWithTools,
    example11_toolSpecificConfig,
    example12_errorHandling,
  ];

  console.log('MCP Integration Examples');
  console.log('========================\n');

  for (const example of examples) {
    try {
      await example();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    } catch (error) {
      console.error(`Error in ${example.name}:`, error);
    }
  }
}

// Export for use in other files
export {
  example1_basicToolUsage,
  example2_builtInCollections,
  example3_categoryDiscovery,
  example4_serverDiscovery,
  example5_serverStats,
  example6_multiToolConversation,
  example7_customFiltering,
  example8_databaseQuery,
  example9_thinkingWithTools,
  example10_promptCachingWithTools,
  example11_toolSpecificConfig,
  example12_errorHandling,
  runAllExamples,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
