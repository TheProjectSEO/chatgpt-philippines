# Analytics Tracking Examples

This document provides concrete examples of adding event tracking to existing tool pages.

## Example 1: Paraphraser Tool with Complete Tracking

Here's how to add comprehensive analytics to the paraphraser tool:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackToolUsage, trackCopy, PageViewTracker } from '@/lib/eventTracker';

export default function ParaphraserPage() {
  const [sourceText, setSourceText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);

  // 1. TRACK PAGE VIEW - Auto-tracks time on page and scroll depth
  useEffect(() => {
    const tracker = new PageViewTracker('/paraphraser', 'Paraphraser Tool');
    return () => tracker.destroy();
  }, []);

  // 2. TRACK TOOL USAGE
  const handleParaphrase = async () => {
    if (!sourceText.trim()) return;

    setIsParaphrasing(true);
    const startTime = Date.now(); // Start timing

    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        body: JSON.stringify({ text: sourceText, mode: paraphraseMode }),
      });

      const data = await response.json();
      setParaphrasedText(data.result);

      // Track successful paraphrase
      trackToolUsage('paraphraser', {
        action: 'generate',
        inputLength: sourceText.length,
        outputLength: data.result.length,
        processingTime: Date.now() - startTime,
        success: true,
        modelUsed: data.model || 'unknown',
      });

    } catch (error) {
      // Track failed paraphrase
      trackToolUsage('paraphraser', {
        action: 'generate',
        inputLength: sourceText.length,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: error.message || 'unknown_error',
      });

      alert('Paraphrasing failed. Please try again.');
    } finally {
      setIsParaphrasing(false);
    }
  };

  // 3. TRACK COPY ACTION
  const handleCopy = () => {
    navigator.clipboard.writeText(paraphrasedText);
    trackCopy('paraphrased_text');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <textarea
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        placeholder="Enter text to paraphrase..."
      />

      {/* 4. AUTO-TRACK BUTTON CLICKS with data attributes */}
      <button
        data-track-click="paraphrase_button"
        data-track-context="paraphraser"
        onClick={handleParaphrase}
        disabled={isParaphrasing}
      >
        {isParaphrasing ? 'Paraphrasing...' : 'Paraphrase'}
      </button>

      {paraphrasedText && (
        <div>
          <div>{paraphrasedText}</div>
          <button
            data-track-click="copy_button"
            data-track-context="paraphraser"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Example 2: Grammar Checker with Error Tracking

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackToolUsage, trackError, PageViewTracker } from '@/lib/eventTracker';

export default function GrammarChecker() {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  // Track page view
  useEffect(() => {
    const tracker = new PageViewTracker('/grammar-checker', 'Grammar Checker');
    return () => tracker.destroy();
  }, []);

  const handleCheck = async () => {
    setIsChecking(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setErrors(data.errors);

      // Track successful grammar check
      trackToolUsage('grammar-checker', {
        action: 'check',
        inputLength: text.length,
        outputLength: data.errors.length, // Number of errors found
        processingTime: Date.now() - startTime,
        success: true,
        modelUsed: data.model,
      });

    } catch (error) {
      // Track error
      trackError('grammar_check_failed', 'api_error', error.message);

      trackToolUsage('grammar-checker', {
        action: 'check',
        inputLength: text.length,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: 'api_error',
      });

      alert('Grammar check failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button
        data-track-click="check_grammar"
        onClick={handleCheck}
        disabled={isChecking}
      >
        Check Grammar
      </button>

      {errors.length > 0 && (
        <div>
          <h3>Found {errors.length} errors:</h3>
          {errors.map((error, i) => (
            <div key={i}>{error.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Example 3: Chat Interface with Message Tracking

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackToolUsage, trackEvent, PageViewTracker } from '@/lib/eventTracker';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Track page view
  useEffect(() => {
    const tracker = new PageViewTracker('/chat', 'AI Chat');
    return () => tracker.destroy();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

      // Track successful chat
      trackToolUsage('chat', {
        action: 'send_message',
        inputLength: userMessage.length,
        outputLength: data.response.length,
        processingTime: Date.now() - startTime,
        success: true,
        modelUsed: data.model,
      });

    } catch (error) {
      trackToolUsage('chat', {
        action: 'send_message',
        inputLength: userMessage.length,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: 'chat_error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />

      <button
        data-track-click="send_message"
        data-track-context="chat"
        onClick={handleSend}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  );
}
```

---

## Example 4: Image Generator with Download Tracking

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackToolUsage, trackDownload, PageViewTracker } from '@/lib/eventTracker';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Track page view
  useEffect(() => {
    const tracker = new PageViewTracker('/image-generator', 'AI Image Generator');
    return () => tracker.destroy();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/image-generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setImageUrl(data.imageUrl);

      // Track successful generation
      trackToolUsage('image-generator', {
        action: 'generate',
        inputLength: prompt.length,
        outputLength: 1, // 1 image
        processingTime: Date.now() - startTime,
        success: true,
        modelUsed: data.model,
      });

    } catch (error) {
      trackToolUsage('image-generator', {
        action: 'generate',
        inputLength: prompt.length,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: 'generation_error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-image.png';
    a.click();

    // Track download
    trackDownload('ai-generated-image.png', 'png');
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
      />

      <button
        data-track-click="generate_image"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        Generate
      </button>

      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Generated" />
          <button
            data-track-click="download_image"
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Example 5: Form with Submission Tracking

```typescript
'use client';

import { useState } from 'react';
import { trackFormSubmit, trackEvent } from '@/lib/eventTracker';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Track successful submission
        trackFormSubmit('contact_form', true);
        trackEvent('form_submit', 'contact_form_success', {
          eventData: { messageLength: formData.message.length },
        });

        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Submission failed');
      }

    } catch (error) {
      // Track failed submission
      trackFormSubmit('contact_form', false);
      trackEvent('form_submit', 'contact_form_error', {
        eventData: { error: error.message },
      });

      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        required
      />

      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />

      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Message"
        required
      />

      <button
        type="submit"
        data-track-click="submit_contact_form"
      >
        Send Message
      </button>
    </form>
  );
}
```

---

## Example 6: Search with Results Tracking

```typescript
'use client';

import { useState } from 'react';
import { trackSearch } from '@/lib/eventTracker';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results);

      // Track search with results count
      trackSearch(query, data.results.length);

    } catch (error) {
      trackSearch(query, 0); // Track failed search
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search..."
      />

      <button
        data-track-click="search_button"
        onClick={handleSearch}
      >
        Search
      </button>

      <div>
        {results.length > 0 ? (
          results.map((result, i) => (
            <div key={i}>{result.title}</div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}
```

---

## Example 7: Share Button Tracking

```typescript
'use client';

import { trackShare } from '@/lib/eventTracker';

export default function ShareButtons({ content }) {
  const handleShare = (platform) => {
    trackShare(platform, 'tool_output');

    // Platform-specific sharing logic
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`);
        break;
    }
  };

  return (
    <div>
      <button
        data-track-click="share_twitter"
        onClick={() => handleShare('twitter')}
      >
        Share on Twitter
      </button>

      <button
        data-track-click="share_facebook"
        onClick={() => handleShare('facebook')}
      >
        Share on Facebook
      </button>

      <button
        data-track-click="share_linkedin"
        onClick={() => handleShare('linkedin')}
      >
        Share on LinkedIn
      </button>
    </div>
  );
}
```

---

## Quick Implementation Checklist

For each tool page, add:

1. ✅ **Page View Tracking** (PageViewTracker in useEffect)
2. ✅ **Tool Usage Tracking** (trackToolUsage with timing)
3. ✅ **Button Click Tracking** (data-track-click attributes)
4. ✅ **Copy/Download Tracking** (trackCopy/trackDownload)
5. ✅ **Error Tracking** (trackError in catch blocks)

---

## Common Patterns Summary

### Pattern 1: Time-based Tool Usage
```typescript
const startTime = Date.now();
// ... tool logic ...
trackToolUsage('tool-name', {
  processingTime: Date.now() - startTime,
  // ... other params
});
```

### Pattern 2: Success/Failure Tracking
```typescript
try {
  // ... operation ...
  trackToolUsage('tool', { success: true });
} catch (error) {
  trackToolUsage('tool', { success: false, errorType: error.message });
}
```

### Pattern 3: Auto-Click Tracking
```tsx
<button data-track-click="button_name" data-track-context="page_name">
  Click Me
</button>
```

### Pattern 4: Page View with Cleanup
```typescript
useEffect(() => {
  const tracker = new PageViewTracker(path, title);
  return () => tracker.destroy();
}, []);
```

---

## Next Steps

1. Choose 2-3 high-traffic pages to start
2. Add PageViewTracker to track engagement
3. Add trackToolUsage for main actions
4. Add data-track-click to important buttons
5. Deploy and check dashboard
6. Gradually roll out to all pages

That's it! Start tracking and optimizing based on the insights you gain.
