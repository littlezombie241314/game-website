// 暗色模式切换（保持到 localStorage）
const THEME_CYCLE = ['dark', 'cyberpunk', 'space-explorer', 'future-tech', 'hologram', 'digital-matrix', 'pastel-peach', 'pastel-lavender', 'pastel-lemon', 'pastel-sky', 'pastel-sakura', 'pastel-taro'];
let themeInterval = null;

function applyTheme(themeName) {
  if (!themeName) return;
  document.documentElement.dataset.theme = themeName;
  localStorage.setItem('theme', themeName);
}

// 自动主题循环切换（每5秒）
function startThemeCycle() {
  if (themeInterval) {
    clearInterval(themeInterval);
  }
  
  themeInterval = setInterval(() => {
    const current = document.documentElement.dataset.theme || 'dark';
    const idx = THEME_CYCLE.indexOf(current);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    applyTheme(next);
  }, 5000); // 5秒切换一次
  
  // 更新按钮状态
  updateCycleButtonState(true);
}

// 停止主题循环
function stopThemeCycle() {
  if (themeInterval) {
    clearInterval(themeInterval);
    themeInterval = null;
  }
  
  // 更新按钮状态
  updateCycleButtonState(false);
}

// 切换主题循环状态
function toggleThemeCycle() {
  if (themeInterval) {
    stopThemeCycle();
  } else {
    startThemeCycle();
  }
}

// 更新循环按钮状态
function updateCycleButtonState(isRunning) {
  const cycleBtn = document.getElementById('theme-cycle-toggle');
  if (cycleBtn) {
    if (isRunning) {
      cycleBtn.innerHTML = '⏹️';
      cycleBtn.title = '停止颜色循环';
      cycleBtn.setAttribute('aria-label', '停止颜色循环');
    } else {
      cycleBtn.innerHTML = '🌈';
      cycleBtn.title = '开始颜色循环';
      cycleBtn.setAttribute('aria-label', '开始颜色循环');
    }
  }
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const initial = THEME_CYCLE.includes(saved) ? saved : 'dark';
  applyTheme(initial);
  
  // 启动主题循环
  startThemeCycle();
})();

function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'dark';
  const idx = THEME_CYCLE.indexOf(current);
  const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
  applyTheme(next);
  
  // 切换主题时重新启动循环
  startThemeCycle();
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
  renderFlightGameScores();
  renderSupportFAQ();
  bindDemoForms();
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', toggleTheme);
  
  // 颜色循环控制按钮
  const cycleBtn = document.getElementById('theme-cycle-toggle');
  cycleBtn?.addEventListener('click', toggleThemeCycle);
  
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

// 播放预告片功能
function playTrailer() {
  // 这里可以添加实际的视频播放逻辑
  // 例如：打开视频弹窗、跳转到视频页面、或者直接播放视频
  alert('播放预告片功能 - 这里可以集成实际的视频播放器');
  
  // 示例：打开YouTube链接（如果有的话）
  // window.open('https://www.youtube.com/watch?v=your-trailer-id', '_blank');
  
  // 或者：显示视频弹窗
  // showVideoModal('./assets/videos/latest-trailer.mp4');
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

// 飞行游戏排行榜渲染
async function renderFlightGameScores() {
  const wrap = document.getElementById('flight-game-scores');
  if (!wrap) return;
  
  // 模拟从全球服务器获取数据
  const globalScores = await getGlobalScores();
  
  // 按分数降序排列，取前三名
  const top3 = globalScores.slice().sort((a, b) => b.score - a.score).slice(0, 3);
  
  // 如果没有数据，显示提示信息
  if (top3.length === 0) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:40px;color:#666;">
        <p>暂无全球游戏记录</p>
        <p style="font-size:14px;margin-top:10px;">玩一局飞行游戏来创建全球分数记录吧！</p>
      </div>
    `;
    return;
  }
  
  // 获取国家标志符号
  const getCountryFlag = (countryCode) => {
    const flags = {
      'CN': '🇨🇳', 'US': '🇺🇸', 'JP': '🇯🇵', 'KR': '🇰🇷', 'GB': '🇬🇧',
      'DE': '🇩🇪', 'FR': '🇫🇷', 'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷'
    };
    return flags[countryCode] || '🌍';
  };
  
  wrap.innerHTML = `
    <div style="overflow:auto">
      <div style="margin-bottom:20px;padding:15px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;border-radius:10px;">
        <h3 style="margin:0;font-size:18px;">🌍 全球飞行游戏排行榜</h3>
        <p style="margin:5px 0 0 0;font-size:14px;opacity:0.9;">来自世界各地的玩家最高分记录</p>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th>国家</th>
            <th>分数</th>
            <th>游戏时间</th>
            <th>日期</th>
          </tr>
        </thead>
        <tbody>
          ${top3.map((player, index) => `
            <tr>
              <td>
                <span style="display:inline-flex;align-items:center;gap:4px;">
                  ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  <span style="font-weight:bold;">${index + 1}</span>
                </span>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:18px;">${getCountryFlag(player.country)}</span>
                  <strong>${player.name}</strong>
                </div>
              </td>
              <td>${player.country}</td>
              <td><span style="color:#6a4c93;font-weight:bold;font-size:16px;">${player.score}</span></td>
              <td>${player.time}秒</td>
              <td>${player.date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-weight:bold;color:#6a4c93;">📊 全球统计</span>
            <span style="margin-left:10px;font-size:14px;color:#666;">
              共 ${globalScores.length} 条记录 | 来自 ${new Set(globalScores.map(s => s.country)).size} 个国家
            </span>
          </div>
          <button onclick="refreshGlobalScores()" style="padding:5px 10px;background:#6a4c93;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;">
            🔄 刷新数据
          </button>
        </div>
      </div>
    </div>
  `;
}

// 模拟从全球服务器获取分数数据
async function getGlobalScores() {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 在实际应用中，这里应该是真实的API调用
    // 例如：const response = await fetch('/api/global-scores');
    // return await response.json();
    
    // 模拟全球数据（包含预设数据和本地数据）
    const presetData = await loadJSON('./data/flight-game-scores.json');
    const localScores = JSON.parse(localStorage.getItem('flightGameScores') || '[]');
    
    // 合并数据并去重（基于分数、玩家、时间的组合）
    const allScores = [...(presetData?.scores || []), ...localScores];
    const uniqueScores = allScores.filter((score, index, self) => 
      index === self.findIndex(s => 
        s.score === score.score && s.name === score.name && s.time === score.time
      )
    );
    
    return uniqueScores;
  } catch (error) {
    console.error('获取全球数据失败:', error);
    // 返回空数组作为后备
    return [];
  }
}

// 刷新全球数据
async function refreshGlobalScores() {
  const wrap = document.getElementById('flight-game-scores');
  if (!wrap) return;
  
  // 显示加载状态
  wrap.innerHTML = `
    <div style="text-align:center;padding:40px;color:#666;">
      <div style="font-size:24px;margin-bottom:10px;">⏳</div>
      <p>正在从全球服务器获取最新数据...</p>
    </div>
  `;
  
  // 重新渲染排行榜
  await renderFlightGameScores();
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