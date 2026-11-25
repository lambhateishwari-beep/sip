// Menu storage. Uses a free Redis database (Upstash, added from Vercel's Storage tab)
// through its REST API, so no npm packages are needed.
// If no database is connected, the site still works and shows the original menu (read-only).
const DEFAULT_MENU = require('./default-menu.json');

const KEY = 'tgs:menu:v1';

function cfg() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}
const hasStorage = () => !!cfg();

async function redis(args) {
  const c = cfg();
  const r = await fetch(c.url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'Redis HTTP ' + r.status);
  return j.result;
}

async function getMenu() {
  if (!cfg()) return { menu: DEFAULT_MENU, storage: false, custom: false };
  try {
    const raw = await redis(['GET', KEY]);
    if (raw) return { menu: JSON.parse(raw), storage: true, custom: true };
    return { menu: DEFAULT_MENU, storage: true, custom: false };
  } catch (e) {
    console.error('store.getMenu failed:', e.message);
    return { menu: DEFAULT_MENU, storage: false, custom: false, error: true };
  }
}

async function saveMenu(menu) {
  if (!cfg()) { const e = new Error('Storage is not connected'); e.status = 503; throw e; }
  await redis(['SET', KEY, JSON.stringify(menu)]);
}

// ---- tiny rate limiter for login attempts (Redis if available, else per-instance memory)
const mem = new Map();
async function hit(key, windowSec) {
  if (cfg()) {
    try {
      const n = await redis(['INCR', key]);
      if (n === 1) await redis(['EXPIRE', key, String(windowSec)]);
      return n;
    } catch (e) { /* fall through to memory */ }
  }
  const now = Date.now();
  const rec = mem.get(key);
  if (!rec || rec.until < now) { mem.set(key, { n: 1, until: now + windowSec * 1000 }); return 1; }
  rec.n += 1;
  return rec.n;
}
async function clearHits(key) {
  mem.delete(key);
  if (cfg()) { try { await redis(['DEL', key]); } catch (e) { /* ignore */ } }
}

module.exports = { getMenu, saveMenu, hasStorage, hit, clearHits };
