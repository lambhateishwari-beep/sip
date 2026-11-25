// Owner login: the password lives ONLY in the ADMIN_PASSWORD environment variable
// (set in Vercel). It is never written in code or sent to customers.
const crypto = require('crypto');

const COOKIE = 'tgs_admin';
const SESSION_SECONDS = 8 * 60 * 60; // owner stays logged in for 8 hours

function sha256(s) { return crypto.createHash('sha256').update(String(s)).digest(); }
function configured() { return !!process.env.ADMIN_PASSWORD; }

function secret() {
  return process.env.SESSION_SECRET ||
    crypto.createHash('sha256').update('tgs-session:' + (process.env.ADMIN_PASSWORD || '')).digest('hex');
}
function hmac(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

function passwordOk(input) {
  if (!configured() || typeof input !== 'string' || input.length > 200) return false;
  return crypto.timingSafeEqual(sha256(input), sha256(process.env.ADMIN_PASSWORD));
}

function makeToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = exp + '.' + crypto.randomBytes(8).toString('hex');
  return payload + '.' + hmac(payload);
}

function verifyToken(token) {
  if (!configured() || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = parts[0] + '.' + parts[1];
  const a = Buffer.from(hmac(payload));
  const b = Buffer.from(parts[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(parts[0]) > Math.floor(Date.now() / 1000);
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

function isAdmin(req) { return verifyToken(readCookie(req, COOKIE)); }

function secureFlag(req) {
  return (req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https' ? '; Secure' : '';
}
function sessionCookie(req) {
  return `${COOKIE}=${makeToken()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secureFlag(req)}`;
}
function clearCookie(req) {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag(req)}`;
}

module.exports = { configured, passwordOk, isAdmin, sessionCookie, clearCookie };
