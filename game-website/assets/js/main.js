// 暗色模式切换（保持到 localStorage）
const THEME_CYCLE = ['dark', 'cyberpunk', 'space-explorer', 'future-tech', 'hologram', 'digital-matrix', 'pastel-peach', 'pastel-lavender', 'pastel-lemon', 'pastel-sky', 'pastel-sakura', 'pastel-taro'];

function applyTheme(themeName) {
  if (!themeName) return;
  document.documentElement.dataset.theme = themeName;
  localStorage.setItem('theme', themeName);
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const initial = THEME_CYCLE.includes(saved) ? saved : 'pastel-mint';
  applyTheme(initial);
})();

function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'dark';
  const idx = THEME_CYCLE.indexOf(current);
  const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
  applyTheme(next);
}

// 简易导航高亮
function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if ((path === 'index.html' && href === 'index.html') || (href === path)) {
      a.classList.add('active');
    }
  });
}

// FAQ 手风琴
function initAccordion() {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;
    header.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
}

// 简易数据加载（演示）
async function loadJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('网络错误');
    return await res.json();
  } catch (e) {
    console.error('加载失败:', e);
    return null;
  }
}

// 首页最新新闻渲染（若存在容器）
async function renderHomeNews() {
  const wrap = document.getElementById('home-news');
  if (!wrap) return;
  const data = await loadJSON('./data/news.json');
  if (!data || !Array.isArray(data.articles)) return;
  wrap.innerHTML = data.articles.slice(0, 8).map(a => `
    <article class="card">
      <div class="card-media" aria-hidden="true"></div>
      <div class="card-body">
        <h3 class="card-title">${a.title}</h3>
        <p class="muted">${a.summary ?? ''}</p>
      </div>
    </article>
  `).join('');
}

// 游戏目录渲染
async function renderGames() {
  const wrap = document.getElementById('games-grid');
  if (!wrap) return;
  const data = await loadJSON('./data/games.json');
  if (!data || !Array.isArray(data.games)) return;

  const search = document.getElementById('games-search');
  const genre = document.getElementById('games-genre');

  function applyFilter() {
    const q = (search?.value || '').toLowerCase();
    const g = genre?.value || 'all';
    const items = data.games.filter(x => {
      const okQ = !q || x.title.toLowerCase().includes(q);
      const okG = g === 'all' || x.genre === g;
      return okQ && okG;
    });
    wrap.innerHTML = items.map(x => `
      <article class="card">
        <div class="card-media" aria-hidden="true"></div>
        <div class="card-body">
          <h3 class="card-title">${x.title}</h3>
          <p class="muted">${x.tagline ?? ''}</p>
        </div>
      </article>
    `).join('');
  }

  search?.addEventListener('input', applyFilter);
  genre?.addEventListener('change', applyFilter);
  applyFilter();
}

// 表单拦截（演示）
function bindDemoForms() {
  document.querySelectorAll('form[data-demo]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      alert('已提交（演示），实际环境请接入后端 API。');
    });
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof i18nInit === 'function') {
    await i18nInit();
  }
  setActiveNav();
  initAccordion();
  renderHomeNews();
  renderHomeFeatures();
  renderHomeSpotlight();
  renderGames();
  renderMatches();
  renderSupportFAQ();
  bindDemoForms();
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', toggleTheme);
  // 首页主题色块选择
  document.querySelectorAll('.theme-swatch[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-theme');
      if (t) applyTheme(t);
    });
  });
});

// 首页：特色模块
async function renderHomeFeatures() {
  const wrap = document.getElementById('home-features');
  if (!wrap) return;
  const data = await loadJSON('./data/home.json');
  if (!data || !Array.isArray(data.features)) return;
  wrap.innerHTML = data.features.map(x => `
    <article class="card">
      <div class="card-media" aria-hidden="true"></div>
      <div class="card-body">
        <h3 class="card-title">${x.title}</h3>
        <p class="muted">${x.desc ?? ''}</p>
        <div style="margin-top:8px">
          <a class="btn" href="${x.cta?.href || '#'}">${x.cta?.text || '了解更多'}</a>
        </div>
      </div>
    </article>
  `).join('');
}

// 首页：焦点推荐
async function renderHomeSpotlight() {
  const wrap = document.getElementById('home-spotlight');
  if (!wrap) return;
  const data = await loadJSON('./data/home.json');
  if (!data || !Array.isArray(data.spotlight)) return;
  wrap.innerHTML = data.spotlight.map(x => `
    <article class="card">
      <div class="card-media" aria-hidden="true"></div>
      <div class="card-body">
        <h3 class="card-title">${x.title}</h3>
        <p class="muted">${x.desc ?? ''}</p>
        <div style="margin-top:8px">
          <a class="btn btn-primary" href="${x.href || '#'}">立即查看</a>
        </div>
      </div>
    </article>
  `).join('');
}

// 比赛页：全球排行榜与Top3视频预览
async function renderMatches() {
  const topWrap = document.getElementById('matches-top3');
  const tableWrap = document.getElementById('matches-table');
  if (!topWrap && !tableWrap) return;
  const data = await loadJSON('./data/matches.json');
  if (!data || !Array.isArray(data.players)) return;
  const players = data.players.slice().sort((a,b) => a.rank - b.rank);
  // Top3
  if (topWrap) {
    const top3 = players.slice(0, 3);
    topWrap.innerHTML = top3.map(p => `
      <article class="card">
        <div class="card-media" aria-hidden="true" style="height:auto">
          ${p.video ? `<iframe src="${p.video}" title="preview" width="100%" height="200" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" allowfullscreen></iframe>` : `<div class="hero-media">预览占位</div>`}
        </div>
        <div class="card-body">
          <h3 class="card-title">#${p.rank} ${p.name}</h3>
          <p class="muted">${p.country || ''} · ${p.points ?? 0} pts</p>
        </div>
      </article>
    `).join('');
  }
  // Table
  if (tableWrap) {
    tableWrap.innerHTML = `
      <div style="overflow:auto">
        <table class="table">
          <thead>
            <tr>
              <th data-i18n="matches.rank">排名</th>
              <th data-i18n="matches.player">选手</th>
              <th data-i18n="matches.country">国家/地区</th>
              <th data-i18n="matches.points">积分</th>
              <th data-i18n="matches.preview">预览</th>
            </tr>
          </thead>
          <tbody>
            ${players.map(p => `
              <tr>
                <td>${p.rank}</td>
                <td>${p.name}</td>
                <td>${p.country || '-'}</td>
                <td>${p.points ?? 0}</td>
                <td>${p.video ? `<a class="btn" href="${p.video}" target="_blank" rel="noopener" data-i18n="matches.preview">预览</a>` : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  if (typeof i18nApply === 'function') {
    i18nApply(I18N_CURRENT);
  }
}

// 支持页：FAQ 渲染与搜索
async function renderSupportFAQ() {
  const listWrap = document.getElementById('faq-list');
  const searchEl = document.getElementById('support-search');
  if (!listWrap) return;
  const data = await loadJSON('./data/faq.json');
  if (!data || !Array.isArray(data.items)) return;
  let items = data.items;

  function render(list) {
    listWrap.innerHTML = (list || []).map((x, idx) => `
      <div class="accordion-item${idx === 0 ? ' active' : ''}">
        <div class="accordion-header">${x.q}<span>＋</span></div>
        <div class="accordion-content">${x.a}</div>
      </div>
    `).join('');
    initAccordion();
  }
  function apply() {
    const q = (searchEl?.value || '').toLowerCase();
    const filtered = !q ? items : items.filter(i =>
      i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
    );
    render(filtered);
  }
  searchEl?.addEventListener('input', apply);
  render(items);
}