const { send } = require('../lib/http');
const { clearCookie } = require('../lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }
  return send(res, 200, { ok: true }, { 'Set-Cookie': clearCookie(req) });
};
