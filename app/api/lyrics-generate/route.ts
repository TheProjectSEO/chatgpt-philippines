import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme, genre, mood, keywords, includeChorus } = body;

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      );
    }

    // Build the prompt for lyrics generation
    const genreStyles: Record<string, string> = {
      pop: 'catchy, relatable, and radio-friendly with memorable hooks',
      rock: 'powerful, energetic, with strong imagery and emotion',
      'hip-hop': 'rhythmic, with wordplay, metaphors, and flow',
      country: 'storytelling-focused, heartfelt, with rural and emotional themes',
      'r&b': 'smooth, romantic, and emotionally expressive',
      indie: 'artistic, introspective, and authentically expressive',
      electronic: 'repetitive, atmospheric, with electronic and futuristic themes',
      jazz: 'sophisticated, improvisational feel, poetic and smooth',
      folk: 'narrative-driven, acoustic feel, with authentic storytelling',
      reggae: 'rhythmic, laid-back, with themes of peace and social awareness',
    };

    const moodDescriptions: Record<string, string> = {
      happy: 'upbeat, joyful, and optimistic',
      sad: 'melancholic, emotional, and reflective',
      romantic: 'loving, intimate, and heartfelt',
      energetic: 'high-energy, motivating, and dynamic',
      chill: 'relaxed, mellow, and peaceful',
      angry: 'intense, frustrated, and powerful',
      inspirational: 'uplifting, motivating, and hopeful',
      melancholic: 'bittersweet, nostalgic, and contemplative',
    };

    let prompt = `You are a professional songwriter. Write original song lyrics with the following specifications:

Theme/Topic: ${theme}
Genre: ${genre} (${genreStyles[genre] || 'versatile and engaging'})
Mood: ${mood} (${moodDescriptions[mood] || 'emotionally resonant'})
${keywords ? `Keywords/Phrases to include: ${keywords}` : ''}
${includeChorus ? 'Include a chorus section that repeats' : 'Write verses only without a repeating chorus'}

Requirements:
1. Create ${includeChorus ? '2-3 verses and a repeating chorus' : '3-4 verses'}
2. Make it ${moodDescriptions[mood] || 'emotionally resonant'}
3. Write in the ${genre} genre style (${genreStyles[genre] || 'engaging and authentic'})
4. Use vivid imagery, metaphors, and poetic language
5. Ensure proper rhyme scheme and rhythm
${keywords ? `6. Naturally incorporate these keywords/phrases: ${keywords}` : '6. Be creative with word choices'}
7. Make lyrics authentic and original
8. Suitable for singing and musical performance

Format the lyrics with clear verse and chorus labels (if applicable).

Generate the song lyrics now:`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the generated lyrics
    const lyrics = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Lyrics Generator] Generation successful:', {
      theme,
      genre,
      mood,
      lyricsLength: lyrics.length,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return NextResponse.json({
      lyrics,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    console.error('Lyrics generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate lyrics',
        details: error.message
      },
      { status: 500 }
    );
  }
}
