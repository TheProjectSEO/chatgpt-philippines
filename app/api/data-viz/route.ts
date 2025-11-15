import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { message, fileData } = await req.json();

  // Set up SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Simulate thinking
        sendEvent('thinking', {
          content: 'Analyzing your request...\n\nLet me process this step by step.'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        sendEvent('thinking', {
          content: 'Analyzing your request...\n\nLet me process this step by step.\n\nFirst, I\'ll load and validate the data structure.',
          complete: false
        });

        // Simulate tool execution
        await new Promise(resolve => setTimeout(resolve, 500));

        sendEvent('tool_start', {
          id: '1',
          name: 'analyzeData'
        });

        // Progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          sendEvent('tool_progress', {
            id: '1',
            progress
          });
        }

        sendEvent('tool_complete', {
          id: '1',
          result: {
            mean: 45000,
            median: 42000,
            min: 15000,
            max: 98000
          }
        });

        // Text response
        await new Promise(resolve => setTimeout(resolve, 500));

        const responseText = `I've analyzed your data. Here are the key insights:

📊 **Statistics:**
- Average: $45,000
- Median: $42,000
- Range: $15,000 - $98,000

📈 **Trends:**
- Strong upward trend throughout the period
- Peak performance in Q4`;

        // Stream text word by word
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          sendEvent('text', {
            content: words.slice(0, i + 1).join(' ')
          });
        }

        // Send chart data
        await new Promise(resolve => setTimeout(resolve, 500));

        sendEvent('chart', {
          id: '1',
          type: 'bar',
          title: 'Monthly Trend',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Sales',
              data: [35000, 38000, 42000, 45000, 48000, 52000],
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
          }
        });

        sendEvent('complete', { success: true });
        controller.close();
      } catch (error) {
        sendEvent('error', { message: 'An error occurred' });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
