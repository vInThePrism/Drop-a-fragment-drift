import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  DropInputSchema,
  Fragment,
  FragmentKind,
} from '@/lib/validation/fragmentSchema';
import { newFragmentId as fragmentId } from '@/lib/ids';
import { extractEmotionAndTheme } from '@/lib/claude/analyze';
import { selectMatch } from '@/lib/claude/match';
import { saveFragment, getCandidates, readSeed } from '@/lib/store/fragmentsRepo';

/* ─── Rate-limit (in-memory, per-process) ──────────────────────────────────── */

const DROP_WINDOW_MS = 60_000; // 1 minute
const DROP_LIMIT = 5; // max drops per IP per window

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + DROP_WINDOW_MS });
    return true;
  }

  if (entry.count >= DROP_LIMIT) return false;

  entry.count += 1;
  return true;
}

/* ─── Image helpers ────────────────────────────────────────────────────────── */

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function validateImage(dataUrl: string): { ok: true } | { ok: false; error: string } {
  const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) return { ok: false, error: 'Invalid image data URL' };

  const [, mime, b64] = match;
  if (!ALLOWED_MIME.has(mime)) {
    return { ok: false, error: `Unsupported image type: ${mime}` };
  }

  const byteLength = Math.ceil((b64.length * 3) / 4);
  if (byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Image exceeds 5 MB limit' };
  }

  return { ok: true };
}

/* ─── POST /api/fragments ──────────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many drops. Please wait a minute.' },
      { status: 429 },
    );
  }

  // Parse + validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  let input: ReturnType<typeof DropInputSchema.parse>;
  try {
    input = DropInputSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: err.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      );
    }
    throw err;
  }

  // Image safety check
  if (input.imageDataUrl) {
    const check = validateImage(input.imageDataUrl);
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.error }, { status: 400 });
    }
  }

  // Determine fragment kind
  const kind: FragmentKind =
    input.text && input.imageDataUrl
      ? 'mixed'
      : input.imageDataUrl
        ? 'image'
        : 'text';

  // Claude Call 1 — analyze
  let analysis: Awaited<ReturnType<typeof extractEmotionAndTheme>>;
  try {
    analysis = await extractEmotionAndTheme(
      { text: input.text, imageUrl: null },
      input.userTag,
      input.imageDataUrl,
    );
  } catch (err) {
    console.error('[POST /api/fragments] analyze error:', err);
    return NextResponse.json(
      { success: false, error: 'Analysis failed. Please try again.' },
      { status: 502 },
    );
  }

  // Pre-filter candidates
  const newId = fragmentId();
  let candidates = await getCandidates({
    emotion: analysis.emotion,
    theme: analysis.theme,
    excludeId: newId,
  });

  // Fallback to seed if no candidates
  if (candidates.length === 0) {
    const seed = await readSeed();
    candidates = seed.fragments.filter((f) => f.id !== newId && f.analysis !== null);
  }

  // Claude Call 2 — match
  let matchResult: Awaited<ReturnType<typeof selectMatch>>;
  try {
    matchResult = await selectMatch(analysis, input.text, candidates);
  } catch (err) {
    console.error('[POST /api/fragments] match error:', err);
    return NextResponse.json(
      { success: false, error: 'Matching failed. Please try again.' },
      { status: 502 },
    );
  }

  // Build and persist the new fragment
  const fragment: Fragment = {
    id: newId,
    createdAt: new Date().toISOString(),
    kind,
    content: { text: input.text, imageUrl: null },
    userTag: input.userTag,
    analysis,
    matchedWith: matchResult.matchId,
    responses: [],
  };

  try {
    await saveFragment(fragment);
  } catch (err) {
    console.error('[POST /api/fragments] save error:', err);
    return NextResponse.json(
      { success: false, error: 'Could not save fragment. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { success: true, data: { id: fragment.id, matchedWith: matchResult.matchId } },
    { status: 201 },
  );
}
