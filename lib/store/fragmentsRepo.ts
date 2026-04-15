import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();
import fs from 'fs/promises';
import path from 'path';
import {
  Fragment,
  FragmentStore,
  FragmentStoreSchema,
  Response,
} from '../validation/fragmentSchema';

const IDS_KEY = 'fragments:ids';
const fragKey = (id: string) => `fragment:${id}`;
const SEED_PATH = path.join(process.cwd(), 'data', 'seed.json');

/* ─── Public API ───────────────────────────────────────────────────────────── */

export async function saveFragment(fragment: Fragment): Promise<void> {
  await kv.set(fragKey(fragment.id), fragment);
  await kv.sadd(IDS_KEY, fragment.id);
}

export async function getFragmentById(id: string): Promise<Fragment | null> {
  const raw = await kv.get<Fragment>(fragKey(id));
  return raw ?? null;
}

export async function getAllFragments(): Promise<Fragment[]> {
  const ids = await kv.smembers<string[]>(IDS_KEY);
  if (ids.length === 0) return [];
  const raws = await kv.mget<(Fragment | null)[]>(...ids.map(fragKey));
  return raws.filter((f): f is Fragment => f !== null);
}

export async function appendResponse(
  fragmentId: string,
  response: Response,
): Promise<boolean> {
  const fragment = await getFragmentById(fragmentId);
  if (!fragment) return false;
  const updated: Fragment = {
    ...fragment,
    responses: [...fragment.responses, response],
  };
  await kv.set(fragKey(fragmentId), updated);
  return true;
}

export async function getCandidates(opts: {
  emotion: string;
  theme: string;
  excludeId: string;
  limit?: number;
}): Promise<Fragment[]> {
  const { emotion, theme, excludeId, limit = 20 } = opts;
  const all = await getAllFragments();

  const emotionLower = emotion.toLowerCase();
  const themeLower = theme.toLowerCase();

  const candidates = all.filter((f) => {
    if (f.id === excludeId || !f.analysis) return false;
    const matchesEmotion = f.analysis.emotion.toLowerCase() === emotionLower;
    const matchesTheme =
      f.analysis.theme.toLowerCase().includes(themeLower) ||
      themeLower.includes(f.analysis.theme.toLowerCase());
    return matchesEmotion || matchesTheme;
  });

  if (candidates.length < 3) {
    const seed = await readSeed();
    const seedCandidates = seed.fragments.filter((f) => f.id !== excludeId && f.analysis);
    const merged = dedupeById([...candidates, ...seedCandidates]);
    return merged.slice(0, limit);
  }

  return candidates.slice(0, limit);
}

export async function readSeed(): Promise<FragmentStore> {
  const raw = await fs.readFile(SEED_PATH, 'utf-8');
  return FragmentStoreSchema.parse(JSON.parse(raw));
}

export async function isKvSeeded(): Promise<boolean> {
  const count = await kv.scard(IDS_KEY);
  return count > 0;
}

function dedupeById(fragments: Fragment[]): Fragment[] {
  const seen = new Set<string>();
  return fragments.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}
