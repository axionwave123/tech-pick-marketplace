import { img as laptops } from './laptops';
import { img as power } from './power';
import { img as phones } from './phones';

/**
 * Category tile images from your uploads.
 * Modules without a real photo yet fall back to a working image so the site builds.
 */
const fallback = laptops;

function safe(mod: { default?: string } | string | undefined, fb: string): string {
  if (typeof mod === 'string' && mod.startsWith('data:')) return mod;
  return fb;
}

// Dynamic imports would be async; keep static with try-style placeholders
let audio = fallback;
let tablets = fallback;
let watches = fallback;
let gaming = fallback;
let tvs = fallback;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  audio = require('./audio').img || fallback;
} catch { /* */ }
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  tablets = require('./tablets').img || fallback;
} catch { /* */ }
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  watches = require('./watches').img || fallback;
} catch { /* */ }
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  gaming = require('./gaming').img || fallback;
} catch { /* */ }
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  tvs = require('./tvs').img || fallback;
} catch { /* */ }

export const categoryImages = {
  phones: typeof phones === 'string' && phones.startsWith('data:') ? phones : fallback,
  laptops,
  tablets: typeof tablets === 'string' && tablets.startsWith('data:') ? tablets : fallback,
  audio: typeof audio === 'string' && audio.startsWith('data:') ? audio : fallback,
  watches: typeof watches === 'string' && watches.startsWith('data:') ? watches : fallback,
  gaming: typeof gaming === 'string' && gaming.startsWith('data:') ? gaming : fallback,
  tvs: typeof tvs === 'string' && tvs.startsWith('data:') ? tvs : fallback,
  power,
} as const;
