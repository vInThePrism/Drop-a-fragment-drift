/**
 * Seed script — copies data/seed.json → data/fragments.json if the runtime
 * store doesn't exist yet. Run automatically via `predev` in package.json.
 *
 * Usage:
 *   npx tsx scripts/seed.ts          (manual)
 *   npm run dev                       (triggers predev automatically)
 */

import fs from 'fs';
import path from 'path';

const SEED = path.join(process.cwd(), 'data', 'seed.json');
const STORE = path.join(process.cwd(), 'data', 'fragments.json');

if (!fs.existsSync(SEED)) {
  console.error('[seed] data/seed.json not found — committed seed file is missing');
  process.exit(1);
}

if (fs.existsSync(STORE)) {
  console.log('[seed] data/fragments.json already exists — skipping.');
} else {
  fs.copyFileSync(SEED, STORE);
  console.log('[seed] Created data/fragments.json from seed.');
}
