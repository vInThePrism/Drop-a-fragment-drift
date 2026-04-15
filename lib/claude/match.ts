import { z } from 'zod';
import { anthropic, MODEL } from './client';
import type { Fragment } from '../validation/fragmentSchema';
import type { Analysis } from './analyze';

/* ─── Schema for Claude's response ────────────────────────────────────────── */

const MatchSchema = z.object({
  matchId: z.string().startsWith('frg_').nullable(),
  reason: z.string().max(300),
});

export type MatchResult = z.infer<typeof MatchSchema>;

/* ─── Prompt helpers ───────────────────────────────────────────────────────── */

function buildPrompt(
  droppedAnalysis: Analysis,
  droppedText: string | null,
  candidates: Fragment[],
): string {
  const candidateList = candidates
    .map((c, i) => {
      const preview = c.content.text
        ? `"${c.content.text.slice(0, 120)}${c.content.text.length > 120 ? '…' : ''}"`
        : '[image fragment]';
      return [
        `[${i + 1}] ID: ${c.id}`,
        `    Emotion: ${c.analysis!.emotion}`,
        `    Theme: ${c.analysis!.theme}`,
        `    Perspective: ${c.analysis!.perspectiveSignal}`,
        `    Text: ${preview}`,
      ].join('\n');
    })
    .join('\n\n');

  const dropped = [
    `Emotion: ${droppedAnalysis.emotion}`,
    `Theme: ${droppedAnalysis.theme}`,
    `Perspective: ${droppedAnalysis.perspectiveSignal}`,
    droppedText ? `Text: "${droppedText.slice(0, 200)}"` : '[image fragment]',
  ].join('\n');

  return `You are the matching engine for Drift, a platform that connects strangers through unfinished thoughts.

The DROPPED fragment:
${dropped}

CANDIDATE fragments (pre-filtered to share at least one dimension):
${candidateList}

Your task: Pick the ONE candidate that shares EXACTLY ONE dimension (emotion OR theme) with the dropped fragment, while having a clearly different perspective or mode of expression. The match should feel like an unexpected echo — familiar enough to resonate, different enough to surprise.

Rules:
- Sharing both emotion AND theme is too similar — avoid it
- Sharing neither is too random — avoid it
- Different perspective means: different narrator stance, different relationship to the subject, or different emotional distance
- If no candidate satisfies the rule well, return null for matchId

Return ONLY a JSON object with:
- "matchId": the id string of your chosen candidate, or null if none fits
- "reason": a single sentence (max 30 words) explaining why this is the right match

Respond with ONLY valid JSON. No markdown, no explanation.`;
}

/* ─── Main export ──────────────────────────────────────────────────────────── */

/**
 * Call 2 — Given pre-filtered candidates, ask Claude to pick the best match.
 * Returns null matchId if Claude finds no satisfying match.
 */
export async function selectMatch(
  droppedAnalysis: Analysis,
  droppedText: string | null,
  candidates: Fragment[],
): Promise<MatchResult> {
  if (candidates.length === 0) {
    return { matchId: null, reason: 'No candidates available' };
  }

  const prompt = buildPrompt(droppedAnalysis, droppedText, candidates);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 150,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    try {
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned);
      const result = MatchSchema.parse(parsed);

      // Validate that the returned id is actually in our candidate list
      if (
        result.matchId !== null &&
        !candidates.some((c) => c.id === result.matchId)
      ) {
        throw new Error(`matchId ${result.matchId} not in candidate list`);
      }

      return result;
    } catch {
      if (attempt === 2) {
        // Graceful degradation: pick a random candidate rather than fail the drop
        const fallback = candidates[Math.floor(Math.random() * candidates.length)];
        return {
          matchId: fallback.id,
          reason: 'Auto-matched after parse failure',
        };
      }
    }
  }

  throw new Error('[match] Unexpected exit from retry loop');
}
