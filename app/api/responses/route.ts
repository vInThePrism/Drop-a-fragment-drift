import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ResponseInputSchema } from '@/lib/validation/fragmentSchema';
import { newResponseId } from '@/lib/ids';
import { appendResponse } from '@/lib/store/fragmentsRepo';

/* ─── Rate-limit (in-memory, per-process) ──────────────────────────────────── */

const RESPONSE_WINDOW_MS = 60_000; // 1 minute
const RESPONSE_LIMIT = 20; // max responses per IP per window

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RESPONSE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RESPONSE_LIMIT) return false;

  entry.count += 1;
  return true;
}

/* ─── POST /api/responses ──────────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many responses. Please wait a minute.' },
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

  let input: ReturnType<typeof ResponseInputSchema.parse>;
  try {
    input = ResponseInputSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: err.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      );
    }
    throw err;
  }

  // Build the response object
  const response = {
    id: newResponseId(),
    createdAt: new Date().toISOString(),
    text: input.text,
  };

  // Append under the write lock
  const found = await appendResponse(input.fragmentId, response);
  if (!found) {
    return NextResponse.json(
      { success: false, error: 'Fragment not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { success: true, data: { id: response.id } },
    { status: 201 },
  );
}
