// POST /api/login  {password}  -> sets a secure login cookie when the password is right
const { send, readJson, clientIp, isJson } = require('../lib/http');
const { configured, passwordOk, sessionCookie } = require('../lib/auth');
const { hit, clearHits } = require('../lib/store');

const MAX_TRIES = 8;       // wrong passwords allowed...
const WINDOW_SEC = 15 * 60; // ...per 15 minutes per visitor

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }
  try {
    if (!configured()) {
      return send(res, 503, { error: 'Owner password is not set up yet. Add ADMIN_PASSWORD in Vercel settings.' });
    }
    if (!isJson(req)) return send(res, 415, { error: 'Bad request.' });
    const key = 'tgs:rl:' + clientIp(req);
    const tries = await hit(key, WINDOW_SEC);
    if (tries > MAX_TRIES) {
      return send(res, 429, { error: 'Too many wrong attempts. Please wait 15 minutes and try again.' });
    }
    const body = await readJson(req, 4096);
    if (!passwordOk(body && body.password)) {
      await new Promise((r) => setTimeout(r, 700)); // slows down guessing
      return send(res, 401, { error: 'Wrong password.' });
    }
    await clearHits(key);
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req) });
  } catch (e) {
    if (e instanceof SyntaxError) return send(res, 400, { error: 'Bad data.' });
    if (!e.status) console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Something went wrong.' });
  }
};
