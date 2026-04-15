import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    '[Drift] ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.',
  );
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-haiku-4-5-20251001' as const;
