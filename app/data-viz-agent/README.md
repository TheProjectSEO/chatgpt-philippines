# Data Visualization Agent

A beautiful, Claude-like chat interface for data visualization with real-time thinking visualization, tool execution tracking, and interactive charts.

## Features

### 1. Claude-Style Interface
- Clean, minimal design with gradient themes (blue/teal data-focused colors)
- Responsive layout with collapsible sidebar
- Mobile-first design approach

### 2. File Upload & Preview
- **Drag & drop support** for CSV, JSON, Excel files
- **Data preview** showing first 5-10 rows in an elegant table
- **File metadata**: name, size, rows, columns
- **Multiple file support** (future enhancement)

### 3. Real-Time Thinking Visualization
```tsx
<ThinkingBlock content={thinking} isComplete={false} />
```
- Collapsible/expandable blocks
- Typewriter animation as content streams in
- Pulsing brain icon during active thinking
- Smooth expand/collapse animations
- Gradient background with subtle effects

### 4. Tool Execution Tracking
```tsx
<ToolExecutionBlock
  toolName="analyzeData"
  status="running"
  progress={75}
  result={data}
/>
```
- Animated progress bars (0-100%)
- Status indicators: Running, Complete, Failed
- Collapsible result preview
- Tool-specific icons (BarChart, Table, etc.)

### 5. Interactive Charts
```tsx
<ChartDisplay
  type="bar"
  data={chartData}
  title="Monthly Sales Trend"
/>
```
- Powered by Chart.js + react-chartjs-2
- Supported types: bar, line, pie, doughnut
- Animated appearance (fade + scale)
- Responsive sizing
- Interactive tooltips and legends

### 6. Export Functionality
```tsx
<ExportButtons
  chatContainerId="chat-container"
  data={uploadedData}
  fileName="sales-report"
/>
```
- **Export as PDF** (with charts using html2canvas)
- **Download CSV** (raw data export)
- **Share link** (copy current URL)
- Future: PowerPoint export with pptxgenjs

### 7. Message Streaming
- EventSource for Server-Sent Events (SSE)
- Real-time updates as AI processes data
- Smooth scroll to bottom on new messages
- Handles: thinking, tool use, tool results, text, charts

### 8. Mesmerizing Animations
- **Message fade-in** (slide from left/right)
- **Thinking block pulse** with rotation
- **Tool progress bars** with smooth transitions
- **Chart reveal** (scale + fade with bounce)
- **Typewriter effect** for AI responses
- **Gradient shifts** on backgrounds
- **Float animations** for icons

## File Structure

```
app/data-viz-agent/
├── page.tsx                  # Main chat interface
└── README.md                 # This file

components/data-viz/
├── ThinkingBlock.tsx         # Claude-style thinking visualization
├── ToolExecutionBlock.tsx    # Tool execution with progress
├── ChartDisplay.tsx          # Chart.js wrapper with animations
├── FileUploadZone.tsx        # Drag & drop file upload
└── ExportButtons.tsx         # Export to PDF/CSV/Share

app/api/data-viz/
└── route.ts                  # SSE streaming endpoint
```

## Usage

### 1. Basic Setup
```tsx
import DataVizAgentPage from '@/app/data-viz-agent/page';

// In your app
<DataVizAgentPage />
```

### 2. Upload a File
- Drag & drop a CSV/JSON file into the upload zone
- Or click to browse and select a file
- Preview appears automatically with first 5 rows

### 3. Ask Questions
```
"What are the trends in my sales data?"
"Show me a comparison by region"
"Find outliers in the dataset"
"Create a report with key insights"
```

### 4. View Results
- Watch the thinking process in real-time
- See tools execute with progress indicators
- View beautiful charts that animate into view
- Export results as PDF or CSV

## Component Props

### ThinkingBlock
```tsx
interface ThinkingBlockProps {
  content: string;           // Thinking text content
  isComplete?: boolean;      // Whether thinking is finished
}
```

### ToolExecutionBlock
```tsx
interface ToolExecutionBlockProps {
  toolName: string;          // e.g., 'analyzeData'
  status: 'running' | 'complete' | 'failed';
  progress?: number;         // 0-100
  result?: any;              // Tool output (collapsible)
  error?: string;            // Error message if failed
}
```

### ChartDisplay
```tsx
interface ChartDisplayProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;                 // Chart.js data format
  title?: string;            // Chart title
  options?: ChartOptions;    // Custom Chart.js options
}
```

### FileUploadZone
```tsx
interface FileUploadZoneProps {
  onFileUpload: (file: File, preview: any) => void;
  uploadedFile?: {
    name: string;
    size: number;
    rows: number;
    columns: number;
    preview: any[];
  };
  onRemoveFile: () => void;
}
```

## API Integration

Connect to the SSE endpoint at `/api/data-viz`:

```typescript
const eventSource = new EventSource('/api/data-viz', {
  method: 'POST',
  body: JSON.stringify({
    message: userInput,
    fileData: uploadedData
  })
});

eventSource.addEventListener('thinking', (e) => {
  const data = JSON.parse(e.data);
  // Update thinking block
});

eventSource.addEventListener('tool_start', (e) => {
  const { id, name } = JSON.parse(e.data);
  // Add new tool execution block
});

eventSource.addEventListener('tool_progress', (e) => {
  const { id, progress } = JSON.parse(e.data);
  // Update progress bar
});

eventSource.addEventListener('chart', (e) => {
  const chartData = JSON.parse(e.data);
  // Render chart with animation
});
```

## Event Types

The SSE endpoint emits these events:

- `thinking` - Thinking process updates
- `tool_start` - Tool execution begins
- `tool_progress` - Progress updates (0-100)
- `tool_complete` - Tool finished successfully
- `tool_failed` - Tool encountered error
- `text` - AI response text (streamed word-by-word)
- `chart` - Chart data to render
- `complete` - Entire response finished
- `error` - Error occurred

## Styling

All components use Tailwind CSS with:
- Mobile-first responsive design
- Dark mode support (automatic via system preference)
- Custom animations in globals.css
- Gradient themes (blue/cyan/teal)
- Accessible focus states
- Smooth transitions

## Animation Classes

```css
.animate-pulse-glow      /* Pulsing glow effect */
.animate-shimmer         /* Shimmer loading effect */
.animate-float           /* Floating animation */
.animate-gradient        /* Gradient shift */
.thinking-pulse          /* Brain icon pulse */
.message-slide-in-left   /* Message enter from left */
.message-slide-in-right  /* Message enter from right */
.chart-enter             /* Chart reveal animation */
```

## Accessibility

- Keyboard navigation support (Tab, Enter, Esc)
- Screen reader friendly (ARIA labels)
- Focus indicators on all interactive elements
- Proper heading hierarchy
- Color contrast WCAG AA compliant
- Reduced motion support (`prefers-reduced-motion`)

## Future Enhancements

- [ ] Real backend integration with Claude API
- [ ] Multiple file uploads (merge datasets)
- [ ] PowerPoint export (pptxgenjs)
- [ ] More chart types (scatter, radar, bubble)
- [ ] Data filtering and transformation UI
- [ ] Chat history and conversation saving
- [ ] Custom color schemes and themes
- [ ] Voice input for queries
- [ ] Collaborative sharing with real-time updates
- [ ] Advanced analytics (ML predictions, forecasting)

## Performance

- Lazy loading for charts (only render when in viewport)
- Debounced file processing
- Virtualized data preview for large datasets
- Memoized components to prevent unnecessary re-renders
- Optimistic UI updates for instant feedback

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

```json
{
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1",
  "framer-motion": "^12.23.24",
  "papaparse": "^5.5.3",
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.3",
  "lucide-react": "^0.553.0"
}
```

## License

MIT
