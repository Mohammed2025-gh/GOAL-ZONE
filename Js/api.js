// =============================================
// GoalZone v2 — API Module (Real data only)
// Developed by Mohammed Gharouadi ©2026
// =============================================

const CFG = {
  key:  '39717b4ebb3f95c484912fd78392f',
  host: 'https://v3.football.api-sports.io',
  cacheLive:  30  * 1000,   // 30s  pour le live
  cacheOther: 300 * 1000,   // 5min pour le reste
};

const _cache = {};

async function _req(endpoint, params = {}, live = false) {
  const qs  = new URLSearchParams(params).toString();
  const key = `${endpoint}?${qs}`;
  const ttl = live ? CFG.cacheLive : CFG.cacheOther;

  if (_cache[key] && Date.now() - _cache[key].t < ttl)
    return _cache[key].d;

  try {
    const r = await fetch(`${CFG.host}/${endpoint}?${qs}`, {
      headers: { 'x-apisports-key': CFG.key }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if (j.errors && Object.keys(j.errors).length)
      throw new Error(JSON.stringify(j.errors));
    _cache[key] = { d: j.response, t: Date.now() };
    return j.response;
  } catch (e) {
    console.error('[API]', endpoint, e.message);
    return [];
  }
}

// Timezone du navigateur
const TZ = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// Saison courante
const SEASON = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 7 ? y : y - 1;
};

// ── Fonctions publiques ──────────────────────
const API = {
  fixtures:      (date)  => _req('fixtures',  { date, timezone: TZ() }),
  live:          ()      => _req('fixtures',  { live: 'all', timezone: TZ() }, true),
  events:        (id)    => _req('fixtures/events',     { fixture: id }, true),
  stats:         (id)    => _req('fixtures/statistics', { fixture: id }, true),
  lineups:       (id)    => _req('fixtures/lineups',    { fixture: id }),
  standings:     (lid)   => _req('standings',  { league: lid, season: SEASON() }),
  topscorers:    (lid)   => _req('players/topscorers', { league: lid, season: SEASON() }),
  team:          (tid)   => _req('teams',      { id: tid }),
  player:        (pid)   => _req('players',    { id: pid, season: SEASON() }),
};

// ── Live Poller ──────────────────────────────
class Poller {
  constructor(cb, ms = 30000) { this.cb = cb; this.ms = ms; this.t = null; }
  start() { this._run(); this.t = setInterval(() => this._run(), this.ms); }
  async _run() { this.cb(await API.live()); }
  stop()  { clearInterval(this.t); }
}
