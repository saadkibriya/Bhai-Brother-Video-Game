// Only the consoles are timed. The arcade cabinet is walk-up: tokens from the
// counter, no clock, but it still appears on the board so it can be marked
// out of order.
const STATION_SEED = [
  { id: 'ps5-1', name: 'PS5 #1', platform: 'PS5', sort: 1 },
  { id: 'ps4-1', name: 'PS4 #1', platform: 'PS4', sort: 2 },
  { id: 'arcade-1', name: 'Arcade cabinet', platform: 'Arcade', sort: 3 },
];

const isTimed = (platform) => platform !== 'Arcade';

const DHAKA_OFFSET = 6 * 60 * 60 * 1000;
const COOKIE = 'bb_admin';
// The counter phone stays signed in: the session slides forward while it is
// used, and the cookie itself is kept for a year.
const SESSION_MS = 90 * 24 * 60 * 60 * 1000;
const COOKIE_MS = 365 * 24 * 60 * 60 * 1000;
const RESET_MS = 30 * 60 * 1000;
const MAX_FAILS = 8;
const LOCK_MS = 15 * 60 * 1000;
const ITERATIONS = 60_000;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });

const enc = new TextEncoder();

function b64url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(text) {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function same(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(bits)}`;
}

async function passwordMatches(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: unb64url(parts[2]), iterations, hash: 'SHA-256' },
    key,
    256
  );
  return same(b64url(bits), parts[3]);
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

const cookieHeader = (token, maxAgeSeconds) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;

const clearedCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

const cleanUsername = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

function usernameProblem(name) {
  if (!name) return 'Pick a username.';
  if (!/^[a-z0-9._-]{3,24}$/.test(name)) {
    return 'Usernames are 3–24 characters: letters, numbers, dot, dash or underscore.';
  }
  return null;
}

function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return 'Passwords need at least 8 characters.';
  if (password.length > 200) return 'That password is too long.';
  return null;
}

function tempPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  return [...crypto.getRandomValues(new Uint8Array(10))]
    .map((byte) => alphabet[byte % alphabet.length])
    .join('');
}

function sixDigitCode() {
  return String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
}

const publicAdmin = (row) => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  mustChange: Boolean(row.must_change),
});

const publicMember = (row) => ({
  ...publicAdmin(row),
  disabled: Boolean(row.disabled),
  createdAt: row.created_at,
  lastLoginAt: row.last_login_at,
  passwordChangedAt: row.password_changed_at,
});

async function readJson(request) {
  return request.json().catch(() => null);
}

async function audit(env, adminId, action, detail) {
  await env.DB.prepare('INSERT INTO audit_log (admin_id, action, detail, created_at) VALUES (?, ?, ?, ?)')
    .bind(adminId ?? null, action, detail ?? null, Date.now())
    .run();
}

async function ensureColumn(env, table, column, definition) {
  const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  const present = (info.results ?? []).some((row) => row.name === column);
  if (!present) {
    await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

async function cleanupTestData(env) {
  const done = await env.DB.prepare("SELECT value FROM meta WHERE key = 'cleanup-test-data'").first();
  if (done) return;

  const owner = await env.DB.prepare(
    "SELECT id FROM admins WHERE role = 'owner' ORDER BY id LIMIT 1"
  ).first();

  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions'),
    env.DB.prepare('DELETE FROM audit_log'),
    env.DB.prepare('DELETE FROM reset_requests'),
    env.DB.prepare('DELETE FROM admin_sessions'),
    env.DB.prepare('DELETE FROM admins WHERE id <> ?').bind(owner?.id ?? 0),
    env.DB.prepare("DELETE FROM stations WHERE id NOT IN ('ps5-1', 'ps4-1')"),
    env.DB.prepare(
      "UPDATE stations SET status = 'free', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, note = NULL"
    ),
    env.DB.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('cleanup-test-data', 'done')"),
  ]);
}

async function ensureSchema(env) {
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'free',
        started_at INTEGER,
        note TEXT,
        player TEXT,
        ends_at INTEGER,
        minutes INTEGER,
        sort INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )`
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        player TEXT,
        planned_minutes INTEGER,
        started_at INTEGER NOT NULL,
        ended_at INTEGER NOT NULL,
        minutes INTEGER NOT NULL
      )`
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL,
        must_change INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        created_by TEXT,
        disabled INTEGER NOT NULL DEFAULT 0,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until INTEGER,
        last_login_at INTEGER,
        password_changed_at INTEGER
      )`
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash TEXT PRIMARY KEY,
        admin_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )`
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS reset_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        code_hash TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER,
        issued_by TEXT
      )`
    ),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        detail TEXT,
        created_at INTEGER NOT NULL
      )`
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        body TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        created_by TEXT
      )`
    ),
  ]);

  await ensureColumn(env, 'stations', 'player', 'TEXT');
  await ensureColumn(env, 'stations', 'ends_at', 'INTEGER');
  await ensureColumn(env, 'stations', 'minutes', 'INTEGER');
  await ensureColumn(env, 'sessions', 'player', 'TEXT');
  await ensureColumn(env, 'sessions', 'planned_minutes', 'INTEGER');

  await cleanupTestData(env);

  // Always re-assert the seed rows so a station added later (the arcade) shows
  // up on databases that were created before it.
  const now = Date.now();
  await env.DB.batch(
    STATION_SEED.map((station) =>
      env.DB.prepare(
        'INSERT OR IGNORE INTO stations (id, name, platform, status, sort, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(station.id, station.name, station.platform, 'free', station.sort, now)
    )
  );
}

const dhakaDayStart = (now) => Math.floor((now + DHAKA_OFFSET) / 86400000) * 86400000 - DHAKA_OFFSET;

async function readState(env, includePlayer = false) {
  const now = Date.now();
  const stations = await env.DB.prepare(
    'SELECT id, name, platform, status, started_at, ends_at, minutes, player, note, updated_at FROM stations ORDER BY sort, name'
  ).all();
  const sessions = await env.DB.prepare(
    'SELECT station_id, player, planned_minutes, started_at, ended_at, minutes FROM sessions ORDER BY ended_at DESC LIMIT 10'
  ).all();
  const today = await env.DB.prepare(
    'SELECT COUNT(*) AS total, COALESCE(SUM(minutes), 0) AS minutes FROM sessions WHERE ended_at >= ?'
  )
    .bind(dhakaDayStart(now))
    .first();

  return {
    now,
    adminConfigured: true,
    sessionsToday: today?.total ?? 0,
    minutesToday: today?.minutes ?? 0,
    stations: (stations.results ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      platform: row.platform,
      status: row.status,
      startedAt: row.started_at,
      endsAt: row.ends_at,
      minutes: row.minutes,
      player: includePlayer ? row.player : null,
      note: row.note,
      timed: isTimed(row.platform),
      updatedAt: row.updated_at,
    })),
    recentSessions: (sessions.results ?? []).map((row) => ({
      stationId: row.station_id,
      player: includePlayer ? row.player : null,
      plannedMinutes: row.planned_minutes,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      minutes: row.minutes,
    })),
  };
}

async function currentAdmin(request, env) {
  const token = readCookie(request, COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT a.id, a.username, a.display_name, a.role, a.must_change, a.disabled, s.expires_at
     FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = ?`
  )
    .bind(tokenHash)
    .first();

  if (!row) return null;
  const now = Date.now();
  if (row.expires_at < now || row.disabled) {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }
  if (row.expires_at - now < SESSION_MS / 2) {
    await env.DB.prepare('UPDATE admin_sessions SET expires_at = ? WHERE token_hash = ?')
      .bind(now + SESSION_MS, tokenHash)
      .run();
  }
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    role: row.role,
    must_change: row.must_change,
  };
}

async function startSession(env, admin) {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO admin_sessions (token_hash, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await sha256Hex(token), admin.id, now, now + SESSION_MS),
    env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now),
  ]);
  return token;
}

async function login(env, request) {
  const body = await readJson(request);
  const username = cleanUsername(body?.username);
  const password = typeof body?.password === 'string' ? body.password : '';
  const admin = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
  const now = Date.now();

  if (!admin) {
    await hashPassword(`missing-${username}`);
    return json({ error: 'Wrong username or password.' }, 401);
  }
  if (admin.locked_until && admin.locked_until > now) {
    const minutes = Math.ceil((admin.locked_until - now) / 60000);
    return json({ error: `Too many attempts. Try again in ${minutes} min.` }, 429);
  }
  if (admin.disabled) {
    return json({ error: 'This account is disabled. Ask the main admin.' }, 403);
  }

  const ok = await passwordMatches(password, admin.password_hash);
  if (!ok) {
    const fails = admin.failed_attempts + 1;
    const lock = fails >= MAX_FAILS;
    await env.DB.prepare('UPDATE admins SET failed_attempts = ?, locked_until = ? WHERE id = ?')
      .bind(lock ? 0 : fails, lock ? now + LOCK_MS : null, admin.id)
      .run();
    return json(
      { error: lock ? 'Too many attempts. Locked for 15 minutes.' : 'Wrong username or password.' },
      lock ? 429 : 401
    );
  }

  const token = await startSession(env, admin);
  await env.DB.prepare(
    'UPDATE admins SET failed_attempts = 0, locked_until = NULL, last_login_at = ? WHERE id = ?'
  )
    .bind(now, admin.id)
    .run();
  await audit(env, admin.id, 'login', admin.username);

  return json({ admin: publicAdmin(admin) }, 200, { 'set-cookie': cookieHeader(token, COOKIE_MS / 1000) });
}

async function stationAction(env, admin, request) {
  const body = await readJson(request);
  const id = typeof body?.id === 'string' ? body.id : '';
  const action = typeof body?.action === 'string' ? body.action : '';
  const station = await env.DB.prepare('SELECT * FROM stations WHERE id = ?').bind(id).first();

  if (!station) return json({ error: 'Unknown station' }, 404);
  if (!['start', 'stop', 'cancel', 'block', 'unblock'].includes(action)) {
    return json({ error: 'Unknown action' }, 400);
  }

  const now = Date.now();

  if (action === 'start') {
    if (!isTimed(station.platform)) {
      return json({ error: 'The arcade is walk-up: tokens at the counter, no timer.' }, 400);
    }
    if (station.status === 'blocked') return json({ error: 'This station is blocked' }, 409);
    if (station.status === 'busy' && station.started_at) {
      return json({ error: 'That station is already running a session' }, 409);
    }

    const player = typeof body?.player === 'string' ? body.player.trim().slice(0, 60) : '';
    const minutes = Number(body?.minutes);
    if (!player) return json({ error: 'Add the player name before starting' }, 400);
    if (!Number.isFinite(minutes) || minutes < 30 || minutes > 300) {
      return json({ error: 'Session length must be between 30 and 300 minutes' }, 400);
    }

    await env.DB.prepare(
      "UPDATE stations SET status = 'busy', started_at = ?, ends_at = ?, minutes = ?, player = ?, updated_at = ? WHERE id = ?"
    )
      .bind(now, now + minutes * 60000, minutes, player, now, id)
      .run();
    await audit(env, admin.id, 'session.start', `${player} on ${station.name} for ${minutes} min`);
  }

  if (action === 'stop') {
    if (station.status === 'busy' && station.started_at) {
      const minutes = Math.max(1, Math.round((now - station.started_at) / 60000));
      await env.DB.batch([
        env.DB.prepare(
          'INSERT INTO sessions (station_id, player, planned_minutes, started_at, ended_at, minutes) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(id, station.player, station.minutes, station.started_at, now, minutes),
        env.DB.prepare(
          "UPDATE stations SET status = 'free', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?"
        ).bind(now, id),
      ]);
      await audit(env, admin.id, 'session.stop', `${station.player ?? 'player'} on ${station.name}: ${minutes} min`);
    } else {
      await env.DB.prepare(
        "UPDATE stations SET status = 'free', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?"
      )
        .bind(now, id)
        .run();
    }
  }

  if (action === 'cancel') {
    // A forgotten or mis-started session: free the station without writing a
    // session record, so the day's minutes stay honest.
    if (station.status !== 'busy') return json({ error: 'That station is not in a session' }, 409);
    await env.DB.prepare(
      "UPDATE stations SET status = 'free', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?"
    )
      .bind(now, id)
      .run();
    await audit(env, admin.id, 'session.cancel', `${station.player ?? 'player'} on ${station.name}`);
  }

  if (action === 'block' || action === 'unblock') {
    const status = action === 'block' ? 'blocked' : 'free';
    await env.DB.prepare(
      'UPDATE stations SET status = ?, started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?'
    )
      .bind(status, now, id)
      .run();
    await audit(env, admin.id, `station.${action}`, station.name);
  }

  return json(await readState(env, true));
}

async function teamList(env) {
  const admins = await env.DB.prepare(
    'SELECT id, username, display_name, role, disabled, must_change, created_at, created_by, last_login_at, password_changed_at FROM admins ORDER BY role DESC, username'
  ).all();
  const pending = await env.DB.prepare(
    `SELECT r.id, r.admin_id, r.created_at, r.expires_at, r.code_hash, a.username
     FROM reset_requests r JOIN admins a ON a.id = r.admin_id
     WHERE r.used_at IS NULL AND r.expires_at > ?
     ORDER BY r.created_at DESC LIMIT 20`
  )
    .bind(Date.now())
    .all();

  return {
    admins: (admins.results ?? []).map(publicMember),
    pendingResets: (pending.results ?? []).map((row) => ({
      id: row.id,
      adminId: row.admin_id,
      username: row.username,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      issued: Boolean(row.code_hash),
    })),
  };
}

async function createAdmin(env, owner, request) {
  const body = await readJson(request);
  const username = cleanUsername(body?.username);
  const displayName = typeof body?.displayName === 'string' ? body.displayName.trim().slice(0, 40) : '';
  const role = body?.role === 'owner' ? 'owner' : 'admin';
  const provided = typeof body?.password === 'string' && body.password ? body.password : null;
  const password = provided ?? tempPassword();

  const nameProblem = usernameProblem(username);
  if (nameProblem) return json({ error: nameProblem }, 400);
  const passwordIssue = passwordProblem(password);
  if (passwordIssue) return json({ error: passwordIssue }, 400);

  const now = Date.now();
  try {
    await env.DB.prepare(
      `INSERT INTO admins (username, display_name, role, password_hash, must_change, created_at, created_by)
       VALUES (?, ?, ?, ?, 1, ?, ?)`
    )
      .bind(username, displayName || username, role, await hashPassword(password), now, owner.username)
      .run();
  } catch (error) {
    return json({ error: 'That username is already taken.' }, 409);
  }

  await audit(env, owner.id, 'admin.create', `${username} (${role})`);
  const created = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
  return json({ admin: publicMember(created), tempPassword: password });
}

async function issueResetCode(env, owner, adminId) {
  const target = await env.DB.prepare('SELECT * FROM admins WHERE id = ?').bind(adminId).first();
  if (!target) return json({ error: 'No such admin' }, 404);

  const code = sixDigitCode();
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('UPDATE reset_requests SET used_at = ? WHERE admin_id = ? AND used_at IS NULL').bind(now, adminId),
    env.DB.prepare(
      'INSERT INTO reset_requests (admin_id, code_hash, created_at, expires_at, issued_by) VALUES (?, ?, ?, ?, ?)'
    ).bind(adminId, await sha256Hex(code), now, now + RESET_MS, owner.username),
  ]);
  await audit(env, owner.id, 'admin.reset-code', target.username);
  return json({ code, expiresAt: now + RESET_MS });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    try {
      await ensureSchema(env);

      const admin = await currentAdmin(request, env);
      const method = request.method;

      if (method === 'POST') {
        const origin = request.headers.get('origin');
        if (origin && origin !== url.origin) return json({ error: 'Cross-site request refused' }, 403);
      }

      if (url.pathname === '/api/status' && method === 'GET') {
        // The board shows who is playing, as the shop asked.
        // Read-only public data, so the public site can be hosted on another origin.
        return json(await readState(env, true), 200, { 'access-control-allow-origin': '*' });
      }

      if (url.pathname === '/api/announcements' && method === 'GET') {
        const rows = await env.DB.prepare(
          'SELECT id, title, body, created_at, updated_at FROM announcements WHERE active = 1 ORDER BY created_at DESC LIMIT 20'
        ).all();
        return json(
          {
            announcements: (rows.results ?? []).map((row) => ({
              id: row.id,
              title: row.title,
              body: row.body,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            })),
          },
          200,
          { 'access-control-allow-origin': '*' }
        );
      }

      if (url.pathname === '/api/auth/setup' && method === 'GET') {
        const total = await env.DB.prepare('SELECT COUNT(*) AS total FROM admins').first('total');
        return json({ needsSetup: !total, keyConfigured: Boolean(env.ADMIN_KEY) });
      }

      if (url.pathname === '/api/auth/setup' && method === 'POST') {
        const total = await env.DB.prepare('SELECT COUNT(*) AS total FROM admins').first('total');
        if (total) return json({ error: 'Setup is already done — sign in instead.' }, 409);

        const key = request.headers.get('x-admin-key') || '';
        if (!env.ADMIN_KEY || !same(key, env.ADMIN_KEY)) {
          return json({ error: 'Wrong setup key. It is the ADMIN_KEY secret for this site.' }, 401);
        }

        const body = await readJson(request);
        const username = cleanUsername(body?.username);
        const password = typeof body?.password === 'string' ? body.password : '';
        const nameProblem = usernameProblem(username);
        if (nameProblem) return json({ error: nameProblem }, 400);
        const passwordIssue = passwordProblem(password);
        if (passwordIssue) return json({ error: passwordIssue }, 400);

        const now = Date.now();
        await env.DB.prepare(
          `INSERT INTO admins (username, display_name, role, password_hash, must_change, created_at, created_by)
           VALUES (?, ?, 'owner', ?, 0, ?, 'setup')`
        )
          .bind(username, username, await hashPassword(password), now)
          .run();
        await audit(env, null, 'admin.setup', username);
        return json({ ok: true }, 201);
      }

      if (url.pathname === '/api/auth/login' && method === 'POST') {
        return login(env, request);
      }

      if (url.pathname === '/api/auth/recover' && method === 'POST') {
        const key = request.headers.get('x-admin-key') || '';
        if (!env.ADMIN_KEY || !same(key, env.ADMIN_KEY)) return json({ error: 'Wrong recovery key' }, 401);

        const body = await readJson(request);
        const username = cleanUsername(body?.username);
        const password = typeof body?.password === 'string' ? body.password : '';
        const target = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
        if (!target) return json({ error: 'No such admin' }, 404);
        const passwordIssue = passwordProblem(password);
        if (passwordIssue) return json({ error: passwordIssue }, 400);

        await env.DB.batch([
          env.DB.prepare(
            'UPDATE admins SET password_hash = ?, must_change = 0, disabled = 0, failed_attempts = 0, locked_until = NULL, password_changed_at = ? WHERE id = ?'
          ).bind(await hashPassword(password), Date.now(), target.id),
          env.DB.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').bind(target.id),
        ]);
        await audit(env, null, 'admin.recover', username);
        return json({ ok: true });
      }

      if (url.pathname === '/api/auth/me' && method === 'GET') {
        if (!admin) return json({ error: 'Not signed in' }, 401);
        return json({ admin: publicAdmin(admin) });
      }

      if (url.pathname === '/api/auth/logout' && method === 'POST') {
        const token = readCookie(request, COOKIE);
        if (token) {
          await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?')
            .bind(await sha256Hex(token))
            .run();
        }
        return new Response(null, { status: 204, headers: { 'set-cookie': clearedCookie(), 'cache-control': 'no-store' } });
      }

      if (url.pathname === '/api/auth/password' && method === 'POST') {
        if (!admin) return json({ error: 'Not signed in' }, 401);
        const body = await readJson(request);
        const current = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
        const next = typeof body?.newPassword === 'string' ? body.newPassword : '';
        const row = await env.DB.prepare('SELECT password_hash FROM admins WHERE id = ?').bind(admin.id).first();
        if (!row || !(await passwordMatches(current, row.password_hash))) {
          return json({ error: 'Your current password is wrong.' }, 401);
        }
        const problem = passwordProblem(next);
        if (problem) return json({ error: problem }, 400);
        await env.DB.batch([
          env.DB.prepare(
            'UPDATE admins SET password_hash = ?, must_change = 0, password_changed_at = ? WHERE id = ?'
          ).bind(await hashPassword(next), Date.now(), admin.id),
          env.DB.prepare('DELETE FROM admin_sessions WHERE admin_id = ? AND token_hash <> ?')
            .bind(admin.id, await sha256Hex(readCookie(request, COOKIE) || '')),
        ]);
        await audit(env, admin.id, 'admin.password', admin.username);
        return json({ ok: true });
      }

      if (url.pathname === '/api/auth/username' && method === 'POST') {
        if (!admin) return json({ error: 'Not signed in' }, 401);
        const body = await readJson(request);
        const current = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
        const username = cleanUsername(body?.username);

        const row = await env.DB.prepare('SELECT password_hash FROM admins WHERE id = ?').bind(admin.id).first();
        if (!row || !(await passwordMatches(current, row.password_hash))) {
          return json({ error: 'Your current password is wrong.' }, 401);
        }

        const problem = usernameProblem(username);
        if (problem) return json({ error: problem }, 400);
        if (username === admin.username) return json({ ok: true, admin: publicAdmin(admin) });

        const taken = await env.DB.prepare('SELECT id FROM admins WHERE username = ?').bind(username).first();
        if (taken) return json({ error: 'That username is already taken.' }, 409);

        await env.DB.prepare('UPDATE admins SET username = ? WHERE id = ?').bind(username, admin.id).run();
        await audit(env, admin.id, 'admin.username', `${admin.username} -> ${username}`);
        return json({ ok: true, admin: { ...publicAdmin(admin), username } });
      }

      if (url.pathname === '/api/auth/forgot' && method === 'POST') {
        const body = await readJson(request);
        const username = cleanUsername(body?.username);
        const target = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();

        if (target && !target.disabled) {
          const recent = await env.DB.prepare(
            'SELECT COUNT(*) AS total FROM reset_requests WHERE admin_id = ? AND created_at > ?'
          )
            .bind(target.id, Date.now() - 60 * 60 * 1000)
            .first('total');

          if (!recent || recent < 3) {
            await env.DB.prepare(
              'INSERT INTO reset_requests (admin_id, created_at, expires_at) VALUES (?, ?, ?)'
            )
              .bind(target.id, Date.now(), Date.now() + RESET_MS)
              .run();
            await audit(env, target.id, 'admin.forgot', username);
          }
        }
        // Same answer either way so usernames cannot be probed.
        return json({ ok: true });
      }

      if (url.pathname === '/api/auth/reset' && method === 'POST') {
        const body = await readJson(request);
        const username = cleanUsername(body?.username);
        const code = typeof body?.code === 'string' ? body.code.replace(/\D/g, '') : '';
        const next = typeof body?.newPassword === 'string' ? body.newPassword : '';
        const target = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
        const problem = passwordProblem(next);
        if (problem) return json({ error: problem }, 400);
        if (!target) return json({ error: 'That code is wrong or has expired.' }, 400);

        const requestRow = await env.DB.prepare(
          `SELECT * FROM reset_requests
           WHERE admin_id = ? AND used_at IS NULL AND code_hash IS NOT NULL AND expires_at > ?
           ORDER BY created_at DESC LIMIT 1`
        )
          .bind(target.id, Date.now())
          .first();

        if (!requestRow || !same(await sha256Hex(code), requestRow.code_hash)) {
          return json({ error: 'That code is wrong or has expired.' }, 400);
        }

        const now = Date.now();
        await env.DB.batch([
          env.DB.prepare(
            'UPDATE admins SET password_hash = ?, must_change = 0, failed_attempts = 0, locked_until = NULL, password_changed_at = ? WHERE id = ?'
          ).bind(await hashPassword(next), now, target.id),
          env.DB.prepare('UPDATE reset_requests SET used_at = ? WHERE id = ?').bind(now, requestRow.id),
          env.DB.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').bind(target.id),
        ]);
        await audit(env, target.id, 'admin.reset', username);
        return json({ ok: true });
      }

      if (url.pathname === '/api/station' && method === 'POST') {
        if (!admin) return json({ error: 'Sign in to run the counter.' }, 401);
        return stationAction(env, admin, request);
      }

      if (url.pathname === '/api/admin/announcements' && method === 'GET') {
        if (!admin) return json({ error: 'Sign in to manage announcements.' }, 401);
        const rows = await env.DB.prepare(
          'SELECT id, title, body, active, created_at, updated_at, created_by FROM announcements ORDER BY created_at DESC LIMIT 50'
        ).all();
        return json({
          announcements: (rows.results ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            body: row.body,
            active: Boolean(row.active),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
          })),
        });
      }

      if (url.pathname === '/api/admin/announcements' && method === 'POST') {
        if (!admin) return json({ error: 'Sign in to post an announcement.' }, 401);
        const body = await readJson(request);
        const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 80) : '';
        const text = typeof body?.body === 'string' ? body.body.trim().slice(0, 600) : '';
        if (text.length < 3) return json({ error: 'Write the announcement before posting.' }, 400);

        const now = Date.now();
        const created = await env.DB.prepare(
          'INSERT INTO announcements (title, body, active, created_at, updated_at, created_by) VALUES (?, ?, 1, ?, ?, ?)'
        )
          .bind(title || null, text, now, now, admin.username)
          .run();
        await audit(env, admin.id, 'announcement.create', text.slice(0, 60));
        return json({ ok: true, id: created.meta?.last_row_id ?? null });
      }

      const announcementAction = url.pathname.match(/^\/api\/admin\/announcements\/(\d+)(\/delete)?$/);
      if (announcementAction && method === 'POST') {
        if (!admin) return json({ error: 'Sign in to manage announcements.' }, 401);
        const id = Number(announcementAction[1]);
        const row = await env.DB.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first();
        if (!row) return json({ error: 'No such announcement' }, 404);

        if (announcementAction[2]) {
          await env.DB.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run();
          await audit(env, admin.id, 'announcement.delete', String(id));
          return json({ ok: true });
        }

        const body = await readJson(request);
        const title =
          typeof body?.title === 'string' ? body.title.trim().slice(0, 80) : row.title ?? '';
        const text =
          typeof body?.body === 'string' ? body.body.trim().slice(0, 600) : row.body;
        const active = typeof body?.active === 'boolean' ? (body.active ? 1 : 0) : row.active;
        if (text.length < 3) return json({ error: 'Write the announcement before saving.' }, 400);

        await env.DB.prepare(
          'UPDATE announcements SET title = ?, body = ?, active = ?, updated_at = ? WHERE id = ?'
        )
          .bind(title || null, text, active, Date.now(), id)
          .run();
        await audit(env, admin.id, 'announcement.update', String(id));
        return json({ ok: true });
      }

      if (url.pathname === '/api/admin/team' && method === 'GET') {
        if (!admin) return json({ error: 'Sign in to run the counter.' }, 401);
        if (admin.role !== 'owner') return json({ error: 'Only the main admin can manage admins.' }, 403);
        return json(await teamList(env));
      }

      if (url.pathname === '/api/admin/team' && method === 'POST') {
        if (!admin) return json({ error: 'Sign in to run the counter.' }, 401);
        if (admin.role !== 'owner') return json({ error: 'Only the main admin can add admins.' }, 403);
        return createAdmin(env, admin, request);
      }

      const teamAction = url.pathname.match(/^\/api\/admin\/team\/(\d+)\/(disabled|reset-code|password)$/);
      if (teamAction && method === 'POST') {
        if (!admin) return json({ error: 'Sign in to run the counter.' }, 401);
        if (admin.role !== 'owner') return json({ error: 'Only the main admin can manage admins.' }, 403);

        const targetId = Number(teamAction[1]);
        const action = teamAction[2];
        const target = await env.DB.prepare('SELECT * FROM admins WHERE id = ?').bind(targetId).first();
        if (!target) return json({ error: 'No such admin' }, 404);

        if (action === 'disabled') {
          const body = await readJson(request);
          const disabled = Boolean(body?.disabled);
          if (disabled && target.id === admin.id) {
            return json({ error: 'You cannot disable your own account.' }, 400);
          }
          if (disabled && target.role === 'owner') {
            const owners = await env.DB.prepare(
              "SELECT COUNT(*) AS total FROM admins WHERE role = 'owner' AND disabled = 0"
            ).first('total');
            if (!owners || owners <= 1) {
              return json({ error: 'Keep at least one active main admin.' }, 400);
            }
          }
          await env.DB.batch([
            env.DB.prepare('UPDATE admins SET disabled = ? WHERE id = ?').bind(disabled ? 1 : 0, target.id),
            env.DB.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').bind(target.id),
          ]);
          await audit(env, admin.id, disabled ? 'admin.disable' : 'admin.enable', target.username);
          return json({ ok: true });
        }

        if (action === 'reset-code') return issueResetCode(env, admin, target.id);

        if (action === 'password') {
          const body = await readJson(request);
          const password = typeof body?.password === 'string' ? body.password : '';
          const problem = passwordProblem(password);
          if (problem) return json({ error: problem }, 400);
          await env.DB.batch([
            env.DB.prepare(
              'UPDATE admins SET password_hash = ?, must_change = 1, failed_attempts = 0, locked_until = NULL, password_changed_at = ? WHERE id = ?'
            ).bind(await hashPassword(password), Date.now(), target.id),
            env.DB.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').bind(target.id),
          ]);
          await audit(env, admin.id, 'admin.set-password', target.username);
          return json({ ok: true, password });
        }
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json({ error: 'Server error', detail: String(error?.message || error) }, 500);
    }
  },
};
