// GoalZone v2 — Matches Module
// Developed by Mohammed Gharouadi ©2026

let allFixtures = [];
let filterKey   = 'all';
let selDate     = new Date().toISOString().split('T')[0];

const LEAGUE_IDS = {
  ucl:39,epl:39,laliga:140,bundesliga:78,
  serie_a:135,ligue1:61,saudi:307
};
// Fix ucl id
LEAGUE_IDS.ucl = 2;

const FALLBACK = n =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&size=40&background=111827&color=00ff87&bold=true&format=png`;

// ── Date Tabs ────────────────────────────────
function buildDateTabs() {
  const wrap = document.getElementById('date-tabs');
  if (!wrap) return;
  const now = new Date();
  const days = [-2,-1,0,1,2,3].map(i => {
    const d = new Date(now); d.setDate(now.getDate()+i);
    return { d, i, str: d.toISOString().split('T')[0] };
  });
  wrap.innerHTML = days.map(({d,i,str}) => {
    let label;
    if (i===0) label=t('today');
    else if(i===-1) label=t('yesterday');
    else if(i===1) label=t('tomorrow');
    else label=d.toLocaleDateString(lang==='ar'?'ar-EG':'en-GB',{weekday:'short',day:'numeric',month:'short'});
    return `<button class="dtab${str===selDate?' on':''}" onclick="pickDate('${str}')">${label}</button>`;
  }).join('');
}

function pickDate(str) {
  selDate = str;
  buildDateTabs();
  fetchAndRender(str);
}

// ── Fetch ────────────────────────────────────
async function fetchAndRender(date) {
  const feed = document.getElementById('matches-feed');
  if (!feed) return;
  feed.innerHTML = `<div class="spinner-wrap"><div class="spin"></div><p style="color:var(--muted);font-size:.85rem">${t('loading')}</p></div>`;

  allFixtures = await API.fixtures(date);

  if (!allFixtures.length) {
    feed.innerHTML = `<div class="empty"><div class="empty-icon">📅</div><p>${t('no_matches')}</p></div>`;
    syncCounters(); return;
  }
  renderFeed();
  syncCounters();
}

// ── Filter ───────────────────────────────────
function setFilter(k) {
  filterKey = k;
  document.querySelectorAll('.fbtn').forEach(b =>
    b.classList.toggle('on', b.dataset.f === k));
  renderFeed();
}

// ── Render ───────────────────────────────────
function renderFeed() {
  const feed = document.getElementById('matches-feed');
  if (!feed) return;

  let list = allFixtures;
  if (filterKey !== 'all') {
    const id = LEAGUE_IDS[filterKey];
    list = list.filter(f => f.league.id === id);
  }

  if (!list.length) {
    feed.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><p>${t('no_matches')}</p></div>`;
    return;
  }

  // Group by league
  const groups = {};
  list.forEach(f => {
    const k = f.league.id;
    if (!groups[k]) groups[k] = { l: f.league, fs: [] };
    groups[k].fs.push(f);
  });

  // Sort: live first, then by kickoff
  Object.values(groups).forEach(g => {
    g.fs.sort((a,b) => {
      const la = isLive(a), lb = isLive(b);
      if (la && !lb) return -1; if (!la && lb) return 1;
      return new Date(a.fixture.date) - new Date(b.fixture.date);
    });
  });

  feed.innerHTML = Object.values(groups).map(g => leagueGroup(g)).join('');
}

const isLive = f => ['1H','2H','HT','ET','BT','P','LIVE'].includes(f.fixture.status.short);
const isDone = f => ['FT','AET','PEN'].includes(f.fixture.status.short);

// ── League Group ─────────────────────────────
function leagueGroup({l,fs}) {
  const lid = `lg-${l.id}`;
  const logo = l.logo
    ? `<img src="${l.logo}" class="lg-logo" onerror="this.style.display='none'" />`
    : '';
  return `
    <div class="lg" id="${lid}">
      <div class="lg-head" onclick="toggleLg('${lid}')">
        ${logo}
        <span class="lg-name">${l.name}</span>
        <span class="lg-country">${l.country}</span>
        <span class="lg-count">${fs.length}</span>
        <span class="lg-arrow">▾</span>
      </div>
      <div class="lg-body">${fs.map(f => matchCard(f)).join('')}</div>
    </div>`;
}

function toggleLg(id) {
  const body  = document.querySelector(`#${id} .lg-body`);
  const arrow = document.querySelector(`#${id} .lg-arrow`);
  if (!body) return;
  const hide = body.style.display !== 'none';
  body.style.display  = hide ? 'none' : '';
  arrow.textContent   = hide ? '▸' : '▾';
}

// ── Match Card ───────────────────────────────
function matchCard(f) {
  const st  = f.fixture.status.short;
  const el  = f.fixture.status.elapsed;
  const liv = isLive(f);
  const done= isDone(f);

  let timeHtml, timeCls;
  if (liv) {
    const label = st==='HT' ? t('ht') : st==='ET' ? 'ET' : `${el}'`;
    timeHtml = `<span class="mc-live-badge">● LIVE</span><span class="mc-time t-live">${label}</span>`;
  } else if (done) {
    timeHtml = `<span class="mc-time t-ft">${t('ft')}</span>`;
  } else {
    const d = new Date(f.fixture.date);
    const hm = isNaN(d) ? st : d.toLocaleTimeString(lang==='ar'?'ar-EG':'en-GB',{hour:'2-digit',minute:'2-digit'});
    timeHtml = `<span class="mc-time t-ns">${hm}</span>`;
  }

  const score = (f.goals.home!==null && f.goals.away!==null)
    ? `${f.goals.home} - ${f.goals.away}` : 'vs';

  const hLogo = f.teams.home.logo || FALLBACK(f.teams.home.name);
  const aLogo = f.teams.away.logo || FALLBACK(f.teams.away.name);

  // Safe JSON for onclick
  const safe = JSON.stringify(f)
    .replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');

  return `
    <div class="mc${liv?' live-match':''}" onclick="openMatch('${safe}')">
      <div class="mc-team">
        <img class="mc-logo" src="${hLogo}" alt="${f.teams.home.name}"
             onerror="this.src='${FALLBACK(f.teams.home.name)}'" />
        <span class="mc-name">${f.teams.home.name}</span>
      </div>
      <div class="mc-center">
        ${timeHtml}
        <span class="mc-score">${score}</span>
        ${liv ? `<button class="mc-watch" onclick="event.stopPropagation();goWatch(${f.fixture.id})">${t('watch_btn')}</button>` : ''}
      </div>
      <div class="mc-team away">
        <img class="mc-logo" src="${aLogo}" alt="${f.teams.away.name}"
             onerror="this.src='${FALLBACK(f.teams.away.name)}'" />
        <span class="mc-name">${f.teams.away.name}</span>
      </div>
    </div>`;
}

// ── Open Match Modal ─────────────────────────
async function openMatch(safe) {
  const f = JSON.parse(safe.replace(/\\'/g,"'"));
  const modal   = document.getElementById('match-modal');
  const content = document.getElementById('match-body');
  if (!modal||!content) return;

  const hLogo = f.teams.home.logo || FALLBACK(f.teams.home.name);
  const aLogo = f.teams.away.logo || FALLBACK(f.teams.away.name);
  const st    = f.fixture.status.short;
  const liv   = isLive(f);
  const score = (f.goals.home!==null&&f.goals.away!==null)
    ? `${f.goals.home} - ${f.goals.away}` : 'vs';

  modal.querySelector('.modal-head').innerHTML = `
    <div class="modal-team">
      <img class="modal-team-logo" src="${hLogo}" onerror="this.src='${FALLBACK(f.teams.home.name)}'" />
      <span class="modal-team-name">${f.teams.home.name}</span>
    </div>
    <div class="modal-score-box">
      <div class="modal-score">${score}</div>
      <div class="modal-status">${liv?`🔴 ${f.fixture.status.elapsed||st}'`:st}</div>
      <div class="modal-league">${f.league.name} · ${f.league.country}</div>
      ${liv?`<button class="mc-watch" style="margin-top:10px;padding:7px 18px"
        onclick="goWatch(${f.fixture.id})">${t('watch_btn')}</button>`:''}
    </div>
    <div class="modal-team">
      <img class="modal-team-logo" src="${aLogo}" onerror="this.src='${FALLBACK(f.teams.away.name)}'" />
      <span class="modal-team-name">${f.teams.away.name}</span>
    </div>`;

  content.innerHTML = `
    <div class="tabs">
      <button class="tab on" onclick="switchTab(this,'tab-events')">${t('events_tab')}</button>
      <button class="tab" onclick="switchTab(this,'tab-stats')">${t('stats_tab')}</button>
    </div>
    <div id="tab-events"><div class="spinner-wrap"><div class="spin"></div></div></div>
    <div id="tab-stats" style="display:none"><div class="spinner-wrap"><div class="spin"></div></div></div>`;

  modal.classList.add('show');

  // Fetch events + stats in parallel
  const [evs, sts] = await Promise.all([
    API.events(f.fixture.id),
    API.stats(f.fixture.id)
  ]);

  // Events
  const ICONS = {Goal:'⚽','Yellow Card':'🟨','Red Card':'🟥',subst:'🔄',Var:'📺'};
  const evEl = document.getElementById('tab-events');
  if (evEl) {
    evEl.innerHTML = evs.length
      ? `<div class="event-list">${evs.map(e=>`
          <div class="ev">
            <span class="ev-min">${e.time.elapsed}'${e.time.extra?'+'+e.time.extra:''}</span>
            <span class="ev-icon">${ICONS[e.type]||'📌'}</span>
            <span class="ev-desc">
              <strong>${e.player?.name||''}</strong>
              ${e.assist?.name?`<span style="color:var(--muted);font-size:.8rem"> ▸ ${e.assist.name}</span>`:''}
            </span>
            <span class="ev-team">${e.team?.name||''}</span>
          </div>`).join('')}</div>`
      : `<div class="empty"><p>${t('no_events')}</p></div>`;
  }

  // Stats
  const stEl = document.getElementById('tab-stats');
  if (stEl) {
    if (sts.length >= 2) {
      const h = sts[0].statistics, a = sts[1].statistics;
      const rows = h.map((s,i) => {
        const hv = parseInt(s.value)||0;
        const av = parseInt(a[i]?.value)||0;
        const tot = hv+av||1;
        return `
          <div class="stat-row">
            <span class="stat-val">${s.value||0}</span>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.round(hv/tot*100)}%"></div></div>
            <span class="stat-label">${s.type}</span>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.round(av/tot*100)}%;background:var(--red)"></div></div>
            <span class="stat-val">${a[i]?.value||0}</span>
          </div>`;
      });
      stEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;color:var(--muted);font-size:.75rem;margin-bottom:12px">
          <strong style="color:var(--text)">${f.teams.home.name}</strong>
          <strong style="color:var(--text)">${f.teams.away.name}</strong>
        </div>
        ${rows.join('')}`;
    } else {
      stEl.innerHTML = `<div class="empty"><p>${t('no_events')}</p></div>`;
    }
  }
}

function switchTab(btn, tid) {
  btn.closest('.tabs').querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  ['tab-events','tab-stats'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display = id===tid?'':'none';
  });
}

function closeMatch() {
  document.getElementById('match-modal')?.classList.remove('show');
}

function goWatch(id) {
  window.location.href = (window.location.pathname.includes('/pages/')
    ? '' : 'pages/') + `watch.html?id=${id}`;
}

// ── Counters ─────────────────────────────────
function syncCounters() {
  const liveCount   = allFixtures.filter(f=>isLive(f)).length;
  const todayCount  = allFixtures.length;
  const leagueCount = new Set(allFixtures.map(f=>f.league.id)).size;

  const s = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  s('live-count',   liveCount);
  s('today-count',  todayCount);
  s('leagues-count',leagueCount);
  s('live-total',   liveCount);
  s('goals-today',  allFixtures.reduce((n,f)=>n+(f.goals.home||0)+(f.goals.away||0),0));
  s('leagues-today',leagueCount);
}

// ── Search ───────────────────────────────────
function doSearch() {
  const q   = (document.getElementById('global-search')?.value||'').trim().toLowerCase();
  const drop = document.getElementById('search-drop');
  if (!drop) return;
  if (q.length < 2) { drop.classList.remove('show'); return; }

  const hits = allFixtures.filter(f =>
    f.teams.home.name.toLowerCase().includes(q) ||
    f.teams.away.name.toLowerCase().includes(q) ||
    f.league.name.toLowerCase().includes(q)
  ).slice(0,6);

  drop.innerHTML = hits.length
    ? hits.map(f => {
        const safe = JSON.stringify(f).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
        return `<div class="search-item" onclick="openMatch('${safe}')">
          <span>${f.teams.home.name} vs ${f.teams.away.name}</span>
          <small style="color:var(--muted)">${f.league.name}</small>
        </div>`;
      }).join('')
    : `<div class="search-item" style="color:var(--muted)">${t('no_matches')}</div>`;

  drop.classList.add('show');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-box'))
    document.getElementById('search-drop')?.classList.remove('show');
});
