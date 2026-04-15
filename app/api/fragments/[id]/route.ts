import { NextRequest, NextResponse } from 'next/server';
import { getFragmentById } from '@/lib/store/fragmentsRepo';

/* ─── GET /api/fragments/[id] ──────────────────────────────────────────────── */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const fragment = await getFragmentById(id);
  if (!fragment) {
    return NextResponse.json(
      { success: false, error: 'Fragment not found' },
      { status: 404 },
    );
  }

  let matchedFragment = null;
  if (fragment.matchedWith) {
    matchedFragment = await getFragmentById(fragment.matchedWith);
  }

  return NextResponse.json(
    { success: true, data: { fragment, matchedFragment } },
    { status: 200 },
  );
}
