// GET  /api/menu  -> public, anyone can read the menu
// PUT  /api/menu  -> owner only (valid login cookie), saves the whole menu
const { send, readJson, isJson } = require('../lib/http');
const { isAdmin } = require('../lib/auth');
const { getMenu, saveMenu, hasStorage } = require('../lib/store');
const { cleanMenu } = require('../lib/validate');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { menu } = await getMenu();
      return send(res, 200, menu);
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return send(res, 401, { error: 'Please log in again.' });
      if (!isJson(req)) return send(res, 415, { error: 'Bad request.' });
      if (!hasStorage()) {
        return send(res, 503, { error: 'Database is not connected yet. See the setup steps (Vercel > Storage).' });
      }
      const clean = cleanMenu(await readJson(req));
      await saveMenu(clean);
      return send(res, 200, { ok: true, updatedAt: clean.updatedAt });
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    if (e instanceof SyntaxError) return send(res, 400, { error: 'Bad data.' });
    if (!e.status) console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Something went wrong. Please try again.' });
  }
};
