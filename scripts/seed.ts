/**
 * Seed script — populates Upstash Redis with seed.json fragments if empty.
 * Runs automatically via `predev` (local) and as part of Vercel build command.
 *
 * Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in environment.
 * Get these from Vercel dashboard → Integrations → Upstash Redis → your database.
 */

import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';
import { FragmentStoreSchema } from '../lib/validation/fragmentSchema';

const SEED_PATH = path.join(process.cwd(), 'data', 'seed.json');
const IDS_KEY = 'fragments:ids';
const fragKey = (id: string) => `fragment:${id}`;

async function seed() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('[seed] Redis credentials not found — skipping.');
    return;
  }

  const kv = Redis.fromEnv();

  const count = await kv.scard(IDS_KEY);
  if (count > 0) {
    console.log(`[seed] Redis already has ${count} fragments — skipping.`);
    return;
  }

  if (!fs.existsSync(SEED_PATH)) {
    console.error('[seed] data/seed.json not found');
    process.exit(1);
  }

  const store = FragmentStoreSchema.parse(
    JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8')),
  );

  for (const fragment of store.fragments) {
    await kv.set(fragKey(fragment.id), fragment);
    await kv.sadd(IDS_KEY, fragment.id);
  }

  console.log(`[seed] Seeded ${store.fragments.length} fragments into Redis.`);
}

seed().catch((e) => {
  console.error('[seed] Failed:', e.message);
  process.exit(1);
});
