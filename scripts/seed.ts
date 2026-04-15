/**
 * Seed script — populates Vercel KV with seed.json fragments if KV is empty.
 * Runs automatically via `predev` (local) and as part of Vercel build command.
 *
 * Requires KV_REST_API_URL + KV_REST_API_TOKEN in environment.
 * Locally: run `npx vercel env pull .env.local` after linking the project.
 */

import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { FragmentStoreSchema } from '../lib/validation/fragmentSchema';

const SEED_PATH = path.join(process.cwd(), 'data', 'seed.json');
const IDS_KEY = 'fragments:ids';
const fragKey = (id: string) => `fragment:${id}`;

async function seed() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.log('[seed] KV credentials not found — skipping (set KV_REST_API_URL + KV_REST_API_TOKEN).');
    return;
  }

  const count = await kv.scard(IDS_KEY);
  if (count > 0) {
    console.log(`[seed] KV already has ${count} fragments — skipping.`);
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

  console.log(`[seed] Seeded ${store.fragments.length} fragments into KV.`);
}

seed().catch((e) => {
  console.error('[seed] Failed:', e.message);
  process.exit(1);
});
