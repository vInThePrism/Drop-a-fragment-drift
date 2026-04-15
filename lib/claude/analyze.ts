import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { anthropic, MODEL } from './client';
import type { FragmentContent, EmotionTag } from '../validation/fragmentSchema';

/* ─── Schema for Claude's response ────────────────────────────────────────── */

const AnalysisSchema = z.object({
  emotion: z.string().min(1).max(60),
  theme: z.string().min(1).max(120),
  perspectiveSignal: z.string().min(1).max(200),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

/* ─── Prompt helpers ───────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are analyzing a short personal fragment submitted to Drift, a platform where people share unfinished thoughts.

Return a JSON object with exactly these three fields:
- "emotion": a single precise emotion word or short phrase (1–3 words) that captures the dominant feeling
- "theme": a short phrase (3–8 words) describing what the fragment is fundamentally about
- "perspectiveSignal": a short descriptor (up to 15 words) capturing the narrator's stance, mode of expression, and relationship to the subject

Respond with ONLY valid JSON. No markdown, no explanation.`;

type MessageParam = Anthropic.Messages.MessageParam;

function buildMessage(
  content: FragmentContent,
  userTag: EmotionTag,
  imageDataUrl: string | null | undefined,
): MessageParam {
  const textParts: string[] = [];

  if (content.text) {
    textParts.push(`Fragment text:\n"${content.text}"`);
  }
  textParts.push(`The author tagged their emotional state as: "${userTag}"`);

  const userText = textParts.join('\n\n');

  // No image — plain text message
  if (!imageDataUrl) {
    return { role: 'user', content: userText };
  }

  // With image — multimodal message
  const match = imageDataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) {
    return { role: 'user', content: userText };
  }

  const [, mediaType, base64Data] = match;
  const validMediaType = mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  const blocks: Anthropic.Messages.ContentBlockParam[] = [
    {
      type: 'image',
      source: { type: 'base64', media_type: validMediaType, data: base64Data },
    },
    { type: 'text', text: userText },
  ];

  return { role: 'user', content: blocks };
}

/* ─── Main export ──────────────────────────────────────────────────────────── */

/**
 * Call 1 — Extract emotion, theme, and perspective signal from a fragment.
 * Supports text-only, image-only, and mixed content via vision API.
 * Retries once on parse failure, then throws.
 */
export async function extractEmotionAndTheme(
  content: FragmentContent,
  userTag: EmotionTag,
  imageDataUrl?: string | null,
): Promise<Analysis> {
  const userMessage = buildMessage(content, userTag, imageDataUrl);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [userMessage],
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    try {
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned);
      return AnalysisSchema.parse(parsed);
    } catch {
      if (attempt === 2) {
        throw new Error(`[analyze] Claude returned unparseable JSON after 2 attempts: ${raw}`);
      }
      // Retry silently
    }
  }

  // Unreachable — loop always throws or returns
  throw new Error('[analyze] Unexpected exit from retry loop');
}
