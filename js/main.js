// GoalZone v2 — Main
// Developed by Mohammed Gharouadi ©2026

// ── Theme ─────────────────────────────────────
function toggleTheme() {
  const on = document.body.classList.toggle('light');
  localStorage.setItem('gz_theme', on ? 'light' : 'dark');
  document.querySelector('.theme-btn').textContent = on ? '🌙' : '☀️';
}

// ── Nav ───────────────────────────────────────
function toggleNav() {
  document.getElementById('main-nav')?.classList.toggle('open');
}

// ── Ticker ────────────────────────────────────
async function buildTicker() {
  const wrap = document.querySelector('.ticker-track');
  if (!wrap) return;
  const live = await API.live();
  if (!live.length) {
    wrap.innerHTML = `<span class="ticker-item">⚽ GoalZone — النتائج المباشرة لكرة القدم ©2026</span>`.repeat(4);
    return;
  }
  const items = live.map(f =>
    `<span class="ticker-item">
      🔴 ${f.teams.home.name} ${f.goals.home??0}–${f.goals.away??0} ${f.teams.away.name}
      <small style="opacity:.7">${f.fixture.status.elapsed??''}' · ${f.league.name}</small>
    </span>`
  ).join('');
  // Duplicate for seamless loop
  wrap.innerHTML = items + items;
}

// ── Sidebar ───────────────────────────────────
async function buildSidebar() {
  // Standings — EPL
  const stEl = document.getElementById('standings-table');
  if (stEl) {
    const data = await API.standings(39);
    const rows = data?.[0]?.league?.standings?.[0]?.slice(0,8) || [];
    stEl.innerHTML = rows.length
      ? `<table class="st-table">
          <thead><tr><th>#</th><th>${lang==='ar'?'الفريق':'Team'}</th><th>${lang==='ar'?'ل':'P'}</th><th>${lang==='ar'?'ف':'Pts'}</th></tr></thead>
          <tbody>${rows.map(r=>`
            <tr>
              <td>${r.rank}</td>
              <td><img class="st-logo" src="${r.team.logo}" onerror="this.style.display='none'" />${r.team.name}</td>
              <td>${r.all.played}</td>
              <td class="st-pts">${r.points}</td>
            </tr>`).join('')}
          </tbody>
        </table>`
      : `<p style="color:var(--muted);font-size:.82rem;padding:8px">${t('no_matches')}</p>`;
  }

  // Top Scorers — EPL
  const scEl = document.getElementById('scorers-list');
  if (scEl) {
    const data = await API.topscorers(39);
    scEl.innerHTML = data.slice(0,6).map((s,i) => `
      <div class="scorer">
        <span class="scorer-rank">${i+1}</span>
        <img class="scorer-photo" src="${s.player.photo}"
             onerror="this.src='${`https://ui-avatars.com/api/?name=${encodeURIComponent(s.player.name)}&size=34&background=111827&color=00ff87&bold=true`}'" />
        <div class="scorer-info">
          <strong>${s.player.name}</strong>
          <span>${s.statistics[0]?.team?.name||''}</span>
        </div>
        <span class="scorer-goals">${s.statistics[0]?.goals?.total||0}</span>
      </div>`).join('') || `<p style="color:var(--muted);font-size:.82rem;padding:8px">${t('no_matches')}</p>`;
  }
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // Theme
  const theme = localStorage.getItem('gz_theme') || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light');
    const tb = document.querySelector('.theme-btn');
    if (tb) tb.textContent = '🌙';
  }

  // Close modals on X
  document.querySelectorAll('.modal-x').forEach(x =>
    x.addEventListener('click', () => x.closest('.overlay').classList.remove('show'))
  );

  // Ticker
  buildTicker();

  // Build date tabs & load today
  if (typeof buildDateTabs === 'function') {
    buildDateTabs();
    await fetchAndRender(selDate);
  }

  // Sidebar (async, don't block)
  buildSidebar();

  // Notification bar (after 4s)
  setTimeout(() => {
    if (localStorage.getItem('gz_notif') !== '1' && Notification.permission !== 'granted')
      document.getElementById('notif-bar')?.classList.add('show');
  }, 4000);

  // Live polling
  if (typeof Poller !== 'undefined') {
    new Poller(data => {
      if (selDate === new Date().toISOString().split('T')[0] && data?.length) {
        allFixtures = data;
        renderFeed();
        syncCounters();
        buildTicker();
      }
    }, 30000).start();
  }

  // Ctrl+K → search
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey||e.metaKey) && e.key==='k') {
      e.preventDefault();
      document.getElementById('global-search')?.focus();
    }
  });

  console.log('%c⚽ GoalZone v2 — Developed by Mohammed Gharouadi ©2026', 'color:#00ff87;font-weight:bold;font-size:13px');
});
