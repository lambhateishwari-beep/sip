// GET /api/session -> tells the admin page whether the owner is logged in
const { send } = require('../lib/http');
const { isAdmin, configured } = require('../lib/auth');
const { hasStorage } = require('../lib/store');

module.exports = (req, res) => {
  return send(res, 200, { admin: isAdmin(req), passwordSet: configured(), storage: hasStorage() });
};
