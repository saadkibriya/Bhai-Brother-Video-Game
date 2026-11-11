const STATION_SEED = [
  { id: 'ps5-1', name: 'PS5 #1', platform: 'PS5', sort: 1 },
  { id: 'ps4-1', name: 'PS4 #1', platform: 'PS4', sort: 2 },
  { id: 'arcade-1', name: 'Arcade cabinet', platform: 'Arcade', sort: 3 },
];

const DHAKA_OFFSET = 6 * 60 * 60 * 1000;
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

async function ensureColumn(env, table, column, definition) {
  const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  const present = (info.results ?? []).some((row) => row.name === column);
  if (!present) {
    await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
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
  ]);

  // Older databases predate the player log; add the columns in place.
  await ensureColumn(env, 'stations', 'player', 'TEXT');
  await ensureColumn(env, 'stations', 'ends_at', 'INTEGER');
  await ensureColumn(env, 'stations', 'minutes', 'INTEGER');
  await ensureColumn(env, 'sessions', 'player', 'TEXT');
  await ensureColumn(env, 'sessions', 'planned_minutes', 'INTEGER');

  const total = await env.DB.prepare('SELECT COUNT(*) AS total FROM stations').first('total');
  if (!total) {
    const now = Date.now();
    await env.DB.batch(
      STATION_SEED.map((station) =>
        env.DB.prepare(
          'INSERT OR IGNORE INTO stations (id, name, platform, status, sort, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(station.id, station.name, station.platform, 'free', station.sort, now)
      )
    );
  }
}

function authorized(request, env) {
  const provided = request.headers.get('x-admin-key') || '';
  const expected = env.ADMIN_KEY || '';
  if (!provided || !expected || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const dhakaDayStart = (now) =>
  Math.floor((now + DHAKA_OFFSET) / 86400000) * 86400000 - DHAKA_OFFSET;

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
    adminConfigured: Boolean(env.ADMIN_KEY),
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
      updatedAt: row.updated_at,
    })),
    recentSessions: (sessions.results ?? []).map((row) => ({
      stationId: row.station_id,
      player: row.player,
      plannedMinutes: row.planned_minutes,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      minutes: row.minutes,
    })),
  };
}

async function setStation(env, body) {
  const id = typeof body?.id === 'string' ? body.id : '';
  const action = typeof body?.action === 'string' ? body.action : '';
  const station = await env.DB.prepare('SELECT * FROM stations WHERE id = ?').bind(id).first();

  if (!station) return { error: 'Unknown station', status: 404 };
  if (!['start', 'stop', 'block', 'unblock'].includes(action)) {
    return { error: 'Unknown action', status: 400 };
  }

  const now = Date.now();

  if (action === 'start') {
    if (station.status === 'blocked') return { error: 'This station is blocked', status: 409 };
    if (station.status === 'busy' && station.started_at) {
      return { error: 'That station is already running a session', status: 409 };
    }

    const player = typeof body?.player === 'string' ? body.player.trim().slice(0, 60) : '';
    const minutes = Number(body?.minutes);
    if (!player) return { error: 'Add the player name before starting', status: 400 };
    if (!Number.isFinite(minutes) || minutes < 30 || minutes > 300) {
      return { error: 'Session length must be between 30 and 300 minutes', status: 400 };
    }

    await env.DB.prepare(
      "UPDATE stations SET status = 'busy', started_at = ?, ends_at = ?, minutes = ?, player = ?, updated_at = ? WHERE id = ?"
    )
      .bind(now, now + minutes * 60000, minutes, player, now, id)
      .run();
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
    } else {
      await env.DB.prepare(
        "UPDATE stations SET status = 'free', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?"
      )
        .bind(now, id)
        .run();
    }
  }

  if (action === 'block') {
    await env.DB.prepare(
      "UPDATE stations SET status = 'blocked', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?"
    )
      .bind(now, id)
      .run();
  }

  if (action === 'unblock') {
    await env.DB.prepare(
      "UPDATE stations SET status = 'free', started_at = NULL, ends_at = NULL, minutes = NULL, player = NULL, updated_at = ? WHERE id = ?"
    )
      .bind(now, id)
      .run();
  }

  return { error: null, status: 200 };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    try {
      await ensureSchema(env);

      if (url.pathname === '/api/status' && request.method === 'GET') {
        // Player names stay admin-only; the public board gets status and timers.
        return json(await readState(env, authorized(request, env)));
      }

      if (url.pathname === '/api/admin/verify' && request.method === 'POST') {
        return authorized(request, env)
          ? new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })
          : json({ error: 'Wrong admin key' }, 401);
      }

      if (url.pathname === '/api/station' && request.method === 'POST') {
        if (!env.ADMIN_KEY) return json({ error: 'No admin key is configured on the server' }, 503);
        if (!authorized(request, env)) return json({ error: 'Wrong admin key' }, 401);

        const body = await request.json().catch(() => null);
        const result = await setStation(env, body);
        if (result.error) return json({ error: result.error }, result.status);
        return json(await readState(env, true));
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json({ error: 'Server error', detail: String(error?.message || error) }, 500);
    }
  },
};
