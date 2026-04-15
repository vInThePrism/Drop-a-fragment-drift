import fs from 'fs/promises';
import path from 'path';
import { fragmentStoreLock } from './fileLock';
import {
  Fragment,
  FragmentStore,
  FragmentStoreSchema,
  Response,
} from '../validation/fragmentSchema';

const STORE_PATH = path.join(process.cwd(), 'data', 'fragments.json');
const SEED_PATH = path.join(process.cwd(), 'data', 'seed.json');

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

async function readStore(): Promise<FragmentStore> {
  let raw: string;
  try {
    raw = await fs.readFile(STORE_PATH, 'utf-8');
  } catch {
    // fragments.json missing — fall back to seed
    raw = await fs.readFile(SEED_PATH, 'utf-8');
  }
  return FragmentStoreSchema.parse(JSON.parse(raw));
}

async function writeStore(store: FragmentStore): Promise<void> {
  const tmp = `${STORE_PATH}.${Date.now()}.tmp`;
  const updated: FragmentStore = {
    ...store,
    meta: { version: 1, lastWriteAt: new Date().toISOString() },
  };
  await fs.writeFile(tmp, JSON.stringify(updated, null, 2), 'utf-8');
  await fs.rename(tmp, STORE_PATH); // atomic on same filesystem
}

/* ─── Public API ───────────────────────────────────────────────────────────── */

/** Return all fragments (no lock needed — read is atomic on modern OS). */
export async function getAllFragments(): Promise<Fragment[]> {
  const store = await readStore();
  return store.fragments;
}

/** Return a single fragment by id, or null if not found. */
export async function getFragmentById(id: string): Promise<Fragment | null> {
  const store = await readStore();
  return store.fragments.find((f) => f.id === id) ?? null;
}

/**
 * Persist a new fragment.
 * Caller is responsible for setting analysis + matchedWith before calling.
 */
export async function saveFragment(fragment: Fragment): Promise<void> {
  await fragmentStoreLock.withLock(async () => {
    const store = await readStore();
    const next: FragmentStore = {
      ...store,
      fragments: [...store.fragments, fragment],
    };
    await writeStore(next);
  });
}

/**
 * Append a response to an existing fragment under the write lock.
 * Returns false if the fragment was not found.
 */
export async function appendResponse(
  fragmentId: string,
  response: Response,
): Promise<boolean> {
  return fragmentStoreLock.withLock(async () => {
    const store = await readStore();
    const idx = store.fragments.findIndex((f) => f.id === fragmentId);
    if (idx === -1) return false;

    const updated = store.fragments.map((f, i) =>
      i === idx ? { ...f, responses: [...f.responses, response] } : f,
    );
    await writeStore({ ...store, fragments: updated });
    return true;
  });
}

/**
 * Return up to `limit` fragments that share the given emotion OR theme,
 * excluding `excludeId`. Used as pre-filter before Claude's match call.
 */
export async function getCandidates(opts: {
  emotion: string;
  theme: string;
  excludeId: string;
  limit?: number;
}): Promise<Fragment[]> {
  const { emotion, theme, excludeId, limit = 20 } = opts;
  const store = await readStore();

  const emotionLower = emotion.toLowerCase();
  const themeLower = theme.toLowerCase();

  const candidates = store.fragments.filter((f) => {
    if (f.id === excludeId || !f.analysis) return false;
    const matchesEmotion = f.analysis.emotion.toLowerCase() === emotionLower;
    const matchesTheme = f.analysis.theme.toLowerCase().includes(themeLower)
      || themeLower.includes(f.analysis.theme.toLowerCase());
    return matchesEmotion || matchesTheme;
  });

  // If fewer than 3 candidates, widen to seed pool for diversity
  if (candidates.length < 3) {
    const seed = await readSeed();
    const seedCandidates = seed.fragments.filter(
      (f) => f.id !== excludeId && f.analysis,
    );
    const merged = dedupeById([...candidates, ...seedCandidates]);
    return merged.slice(0, limit);
  }

  return candidates.slice(0, limit);
}

/** Read the committed seed file (never writes to it). */
export async function readSeed(): Promise<FragmentStore> {
  const raw = await fs.readFile(SEED_PATH, 'utf-8');
  return FragmentStoreSchema.parse(JSON.parse(raw));
}

function dedupeById(fragments: Fragment[]): Fragment[] {
  const seen = new Set<string>();
  return fragments.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}
