# MCP Integration - Quick Reference

## Import MCP Tools

```typescript
import {
  // Individual Tools
  webSearchTool,
  webCrawlTool,
  supabaseQueryTool,
  supabaseListTablesTool,
  sheetsCreateTool,
  sheetsReadTool,
  seoSearchResultsTool,
  seoRankedKeywordsTool,
  docsLookupTool,
  docsGetLibraryTool,
  
  // Tool Collections
  builtInTools,
  
  // Discovery Functions
  getMCPTools,
  getMCPTool,
  getToolsByCategory,
  getToolsByServer,
  
  // Info Functions
  listMCPServers,
  getMCPServerStats,
  
  // Conversion
  convertMCPToolsToSDKTools,
} from './lib/mcpIntegration';
```

## Quick Start

### 1. Use a Single Tool

```typescript
import { AnthropicSDK } from './lib/anthropicSDK';
import { webSearchTool } from './lib/mcpIntegration';

const sdk = new AnthropicSDK();
const response = await sdk.createMessage(
  [{ role: 'user', content: 'Search for AI news' }],
  { tools: [webSearchTool] }
);
```

### 2. Use Tool Collection

```typescript
import { builtInTools } from './lib/mcpIntegration';

const response = await sdk.createMessage(
  [{ role: 'user', content: 'Research and analyze' }],
  { tools: builtInTools.webResearch }
);
```

### 3. Discover Tools by Category

```typescript
import { getToolsByCategory, convertMCPToolsToSDKTools } from './lib/mcpIntegration';

const seoTools = getToolsByCategory('seo');
const response = await sdk.createMessage(
  [{ role: 'user', content: 'Analyze SEO' }],
  { tools: convertMCPToolsToSDKTools(seoTools) }
);
```

## Tool Categories

- **search** - Web search and crawling
- **database** - Supabase operations
- **sheets** - Google Sheets
- **seo** - SEO analysis
- **docs** - Documentation lookup

## MCP Servers

- **langgraph-crawler** - Web research
- **supabase** - Database operations
- **google-sheets-mcp** - Spreadsheet management
- **dataforseo** - SEO data
- **context7** - Library documentation

## Built-in Collections

```typescript
builtInTools.all           // All tools
builtInTools.webResearch   // web_search + crawl_webpage
builtInTools.database      // Supabase tools
builtInTools.sheets        // Google Sheets tools
builtInTools.seo           // SEO tools
builtInTools.docs          // Documentation tools
```

## Common Patterns

### Extended Thinking + Tools

```typescript
const response = await sdk.createMessage(messages, {
  tools: [webSearchTool],
  enableThinking: true,
  thinkingBudget: 5000,
});
```

### Prompt Caching + Tools

```typescript
const response = await sdk.createMessage(messages, {
  systemPrompt: 'You are an expert...',
  systemPromptCaching: true,
  tools: builtInTools.seo,
});
```

### Multi-Tool Conversation

```typescript
const response = await sdk.createMessage(messages, {
  tools: [
    webSearchTool,
    ...builtInTools.docs,
    seoSearchResultsTool,
  ],
});
```

## Get Server Stats

```typescript
import { getMCPServerStats } from './lib/mcpIntegration';

const stats = getMCPServerStats();
console.log(stats.totalTools);        // 10
console.log(stats.toolsByCategory);   // { search: 2, database: 2, ... }
console.log(stats.toolsByServer);     // { 'langgraph-crawler': 2, ... }
```

## Tool Inventory

| Tool | Server | Use Case |
|------|--------|----------|
| `web_search` | langgraph-crawler | Web search |
| `crawl_webpage` | langgraph-crawler | Extract content |
| `supabase_query` | supabase | Database queries |
| `supabase_list_tables` | supabase | List tables |
| `sheets_create` | google-sheets-mcp | Create sheets |
| `sheets_read` | google-sheets-mcp | Read sheets |
| `seo_search_results` | dataforseo | SERP analysis |
| `seo_ranked_keywords` | dataforseo | Keyword data |
| `docs_find_library` | context7 | Find docs |
| `docs_get_library` | context7 | Get docs |

## Files

- **Implementation**: `/Users/adityaaman/Desktop/ChatGPTPH/lib/mcpIntegration.ts`
- **Examples**: `/Users/adityaaman/Desktop/ChatGPTPH/lib/mcpIntegration.example.ts`
- **Summary**: `/Users/adityaaman/Desktop/ChatGPTPH/MCP_INTEGRATION_SUMMARY.md`
