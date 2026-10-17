// Local development backend: serves the static site and stores form
// submissions in a SQLite file (server/data/site.db, git-ignored).
//
//   node server/server.js        ->  http://localhost:8000
//
// Zero dependencies; needs Node 22.5+ (built-in node:sqlite).

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const PORT = Number(process.env.PORT) || 8000;

const MIN_SECONDS_BEFORE_SUBMIT = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(['contact_form', 'circle_interest']);
const EXPERIENCE_DATES = new Set(['2026-11-17', '2026-11-21']);

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(process.env.DB_PATH || path.join(DATA_DIR, 'site.db'));
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const str = (v) => (typeof v === 'string' ? v.trim() : '');

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 20000) { reject(new Error('too large')); req.destroy(); }
    });
    req.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

// Bots get a fake success so they don't learn what tripped them.
function looksLikeBot(body) {
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0;
  return str(body.company) !== '' || Date.now() - renderedAt < MIN_SECONDS_BEFORE_SUBMIT * 1000;
}

function rateLimited(table, ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ip_hash = ? AND created_at >= ?`).get(ipHash, since);
  return n >= RATE_LIMIT_MAX_SUBMISSIONS;
}

const handlers = {
  '/api/contact'(body, ipHash) {
    const name = str(body.name), email = str(body.email), message = str(body.message);
    const source = ALLOWED_SOURCES.has(body.source) ? body.source : 'contact_form';
    if (looksLikeBot(body)) return [200, { success: true }];
    if (!name || name.length > 100) return [400, { error: 'Please provide a valid name.' }];
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) return [400, { error: 'Please provide a valid email.' }];
    if (message.length > 2000) return [400, { error: 'Message is too long.' }];
    if (rateLimited('contacts', ipHash)) return [429, { error: 'Too many submissions. Please try again later.' }];
    db.prepare('INSERT INTO contacts (name, email, message, ip_hash, source) VALUES (?, ?, ?, ?, ?)')
      .run(name, email, message || null, ipHash, source);
    return [200, { success: true }];
  },

  '/api/experience-registration'(body, ipHash) {
    const firstName = str(body.first_name);
    const email = str(body.email).toLowerCase();
    const date = str(body.experience_date);
    if (looksLikeBot(body)) return [200, { success: true }];
    if (!firstName || firstName.length > 100) return [400, { error: 'Please provide a valid first name.' }];
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) return [400, { error: 'Please provide a valid email.' }];
    if (!EXPERIENCE_DATES.has(date)) return [400, { error: 'Please choose one of the available dates.' }];
    if (rateLimited('experience_registrations', ipHash)) return [429, { error: 'Too many submissions. Please try again later.' }];

    // Duplicate for the same date: accepted, but no second record (and no second confirmation).
    const dup = db.prepare("SELECT 1 FROM experience_registrations WHERE email = ? AND experience_date = ? AND status = 'active'").get(email, date);
    if (dup) return [200, { success: true, duplicate: true }];

    // Date switch: any active registration on the other date is marked switched.
    db.prepare("UPDATE experience_registrations SET status = 'switched' WHERE email = ? AND experience_date != ? AND status = 'active'").run(email, date);
    db.prepare('INSERT INTO experience_registrations (registration_id, first_name, email, experience_date, source, ip_hash) VALUES (?, ?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), firstName, email, date, 'community', ipHash);
    return [200, { success: true }];
  },
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.woff2': 'font/woff2',
};
// Never serve the backend, its data, or repo internals.
const BLOCKED = /^\/(server|supabase|docs|\.git|node_modules)(\/|$)|^\/\.|\.md$/i;

function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.join(ROOT, pathname);
  if (!file.startsWith(ROOT + path.sep) || BLOCKED.test(pathname)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  const handler = handlers[pathname];
  if (!handler) return serveStatic(req, res);
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  let body;
  try { body = await readJson(req); } catch { return send(res, 400, { error: 'Invalid JSON' }); }
  try {
    const ipHash = sha256(req.socket.remoteAddress || 'unknown');
    const [status, payload] = handler(body, ipHash);
    send(res, status, payload);
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}).listen(PORT, () => console.log(`Site + API on http://localhost:${PORT}  (db: ${process.env.DB_PATH || "server/data/site.db"})`));
