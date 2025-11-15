# MCP Integration - Practical Example

## Real-World Use Case: SEO Content Research Assistant

This example shows how to build an SEO-focused research assistant that combines web search, documentation lookup, and SEO analysis.

### Step 1: Import Required Tools

```typescript
import { AnthropicSDK } from './lib/anthropicSDK';
import {
  webSearchTool,
  docsLookupTool,
  docsGetLibraryTool,
  seoSearchResultsTool,
  seoRankedKeywordsTool,
} from './lib/mcpIntegration';
```

### Step 2: Create the Assistant

```typescript
async function createSEOResearchAssistant() {
  const sdk = new AnthropicSDK();

  const systemPrompt = `
You are an expert SEO Content Research Assistant. You have access to:

1. Web Search - Find current information and trends
2. Documentation Lookup - Access official framework/library docs
3. SEO Analysis - Analyze keywords, rankings, and SERP data

Your role is to:
- Research topics thoroughly using web search
- Find authoritative documentation for technical topics
- Analyze SEO potential and competition
- Provide data-driven recommendations

Always cite sources and provide actionable insights.
`;

  const tools = [
    webSearchTool,
    docsLookupTool,
    docsGetLibraryTool,
    seoSearchResultsTool,
    seoRankedKeywordsTool,
  ];

  return { sdk, systemPrompt, tools };
}
```

### Step 3: Example Conversation

```typescript
async function researchNextJSSEO() {
  const { sdk, systemPrompt, tools } = await createSEOResearchAssistant();

  // First message: Research request
  const response1 = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'I want to write a comprehensive guide about Next.js SEO. Research the topic and analyze the SEO landscape.',
      },
    ],
    {
      systemPrompt,
      systemPromptCaching: true, // Cache for subsequent requests
      tools,
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    }
  );

  console.log('Research Summary:', response1.response);
  console.log('Tools Used:', response1.toolUses?.map(t => t.name));
  
  // Second message: Specific questions (uses cached prompt)
  const response2 = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'I want to write a comprehensive guide about Next.js SEO. Research the topic and analyze the SEO landscape.',
      },
      {
        role: 'assistant',
        content: response1.response,
      },
      {
        role: 'user',
        content: 'What are the top-ranking keywords for Next.js SEO content? Analyze the competition.',
      },
    ],
    {
      systemPrompt,
      systemPromptCaching: true,
      tools,
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    }
  );

  console.log('Keyword Analysis:', response2.response);
  console.log('Cache Savings:', {
    cacheRead: response2.usage.cache_read_input_tokens,
    normalInput: response2.usage.input_tokens,
  });

  return {
    research: response1.response,
    keywordAnalysis: response2.response,
  };
}
```

### Step 4: Run the Assistant

```typescript
async function main() {
  console.log('SEO Research Assistant - Next.js Example\n');
  
  const results = await researchNextJSSEO();
  
  console.log('\n=== Research Results ===');
  console.log(results.research);
  
  console.log('\n=== Keyword Analysis ===');
  console.log(results.keywordAnalysis);
}

main().catch(console.error);
```

## Expected Flow

1. **Web Search**: Claude searches for "Next.js SEO best practices"
   - Returns current articles, guides, and trends

2. **Documentation Lookup**: Claude finds Next.js official docs
   - Gets library ID for Next.js
   - Fetches relevant SEO documentation sections

3. **SEO Analysis**: Claude analyzes keyword landscape
   - Searches for "Next.js SEO" keyword data
   - Analyzes top-ranking domains
   - Identifies content gaps

4. **Response**: Claude synthesizes findings into:
   - Current best practices
   - Official documentation references
   - SEO opportunities (keywords, difficulty, volume)
   - Content recommendations

## Sample Output

```
Research Summary:
Based on my research using web search, Next.js documentation, and SEO analysis:

1. CURRENT TRENDS (from web search):
   - App Router SEO features are gaining traction
   - Metadata API is the new standard
   - Static vs Dynamic rendering for SEO is a hot topic

2. OFFICIAL DOCUMENTATION (from Next.js docs):
   - Next.js provides built-in SEO support via Metadata API
   - generateMetadata() for dynamic meta tags
   - OpenGraph and Twitter cards support
   - Sitemap and robots.txt generation

3. SEO LANDSCAPE (from keyword analysis):
   - "next.js seo" - 2,400 searches/month, Medium difficulty
   - "next.js metadata" - 1,800 searches/month, Low difficulty
   - "next.js app router seo" - 890 searches/month, Low difficulty

4. RECOMMENDATIONS:
   - Focus on App Router SEO (low competition, growing interest)
   - Create comparison content (Pages Router vs App Router SEO)
   - Cover advanced topics: Dynamic OG images, JSON-LD schemas
   - Include practical examples with code snippets

Sources:
- next.dev/docs/app/building-your-application/optimizing/metadata
- vercel.com/blog/nextjs-seo-best-practices
- web.dev/next-seo-guide
```

## Advanced: Multi-Step Research Pipeline

```typescript
async function advancedSEOPipeline(topic: string) {
  const { sdk, systemPrompt, tools } = await createSEOResearchAssistant();

  // Step 1: Initial research
  console.log('Step 1: Researching topic...');
  const research = await sdk.createMessage(
    [{ role: 'user', content: `Research ${topic} comprehensively` }],
    { systemPrompt, systemPromptCaching: true, tools }
  );

  // Step 2: Keyword analysis
  console.log('Step 2: Analyzing keywords...');
  const keywords = await sdk.createMessage(
    [
      { role: 'user', content: `Research ${topic} comprehensively` },
      { role: 'assistant', content: research.response },
      { role: 'user', content: 'Find top keywords and analyze competition' },
    ],
    { systemPrompt, systemPromptCaching: true, tools }
  );

  // Step 3: Content strategy
  console.log('Step 3: Creating content strategy...');
  const strategy = await sdk.createMessage(
    [
      { role: 'user', content: `Research ${topic} comprehensively` },
      { role: 'assistant', content: research.response },
      { role: 'user', content: 'Find top keywords and analyze competition' },
      { role: 'assistant', content: keywords.response },
      { role: 'user', content: 'Create a data-driven content strategy' },
    ],
    { systemPrompt, systemPromptCaching: true, tools }
  );

  return {
    research: research.response,
    keywords: keywords.response,
    strategy: strategy.response,
    totalCost: 
      research.usage.output_tokens + 
      keywords.usage.output_tokens + 
      strategy.usage.output_tokens,
  };
}
```

## Cost Optimization with Caching

Using prompt caching saves significant costs:

```typescript
// Without caching (3 requests)
// Request 1: 1000 input tokens * $3/M = $0.003
// Request 2: 1500 input tokens * $3/M = $0.0045
// Request 3: 2000 input tokens * $3/M = $0.006
// Total: $0.0135

// With caching (system prompt = 500 tokens)
// Request 1: 1000 input tokens * $3/M = $0.003
//            + 500 cache creation * $3.75/M = $0.001875
// Request 2: 1000 input tokens * $3/M = $0.003
//            + 500 cache read * $0.30/M = $0.00015
// Request 3: 1500 input tokens * $3/M = $0.0045
//            + 500 cache read * $0.30/M = $0.00015
// Total: $0.01335 (savings: ~$0.00015 = 1.1%)

// Savings increase with:
// - Larger system prompts
// - More requests in same conversation
```

## Integration with Existing App

To integrate with your Next.js app:

```typescript
// app/api/seo-research/route.ts
import { AnthropicSDK } from '@/lib/anthropicSDK';
import { builtInTools } from '@/lib/mcpIntegration';

export async function POST(req: Request) {
  const { topic } = await req.json();
  
  const sdk = new AnthropicSDK();
  const response = await sdk.createMessage(
    [{ role: 'user', content: `Research ${topic} for SEO` }],
    {
      tools: [...builtInTools.webResearch, ...builtInTools.seo],
      model: 'claude-sonnet-4-20250514',
    }
  );

  return Response.json({
    research: response.response,
    toolsUsed: response.toolUses?.map(t => t.name),
    cost: response.usage,
  });
}
```

## Files Referenced

- `/Users/adityaaman/Desktop/ChatGPTPH/lib/mcpIntegration.ts`
- `/Users/adityaaman/Desktop/ChatGPTPH/lib/anthropicSDK.ts`

## Next Steps

1. Replace mock tool implementations with real MCP server calls
2. Add error handling and retry logic
3. Implement result caching
4. Add usage tracking and analytics
5. Create UI components for tool results
