// 轻量 i18n：从 /data/i18n/{lang}.json 加载词条，对 [data-i18n] 元素进行替换
const I18N_DEFAULT_LANG = 'zh';
let I18N_CACHE = {};
let I18N_CURRENT = I18N_DEFAULT_LANG;

// 内置字典（用于本地 file:// 打开时 fetch 受限的回退）
const I18N_EMBED = {
  zh: {
    brand: "Orion Games",
    nav: {
      home: "首页",
      games: "游戏",
      news: "新闻",
      esports: "电竞",
      community: "社区",
      support: "支持",
      careers: "招聘",
      about: "关于",
      contact: "联系",
      playNow: "立即游玩",
      theme: "",
      lang: "语言"
    },
    index: {
      heroTitle: "打造属于玩家的宇宙",
      heroSub: "从激烈的竞技对战到广袤的银河探索，我们致力于在每个作品中注入创造力与可玩性。加入数百万玩家的冒险旅程。",
      browseGames: "浏览游戏目录",
      viewNews: "查看最新公告",
      popular: "热门游戏",
      features: "特色模块",
      spotlight: "焦点推荐",
      latestNews: "最新新闻",
      viewAll: "查看全部",
      moreNews: "更多资讯",
      joinCommunity: "加入社区"
    },
    games: {
      title: "全部游戏",
      search: "搜索游戏名称...",
      all: "全部类型"
    },
    news: {
      title: "新闻与公告",
      search: "搜索新闻...",
      rss: "订阅 RSS",
      readMore: "阅读更多"
    },
    community: {
      title: "社区",
      ugc: "UGC 创作",
      submit: "提交作品",
      search: "搜索作品标题或作者...",
      typeAll: "全部类型",
      sortHot: "最热优先",
      sortNew: "最新优先",
      view: "查看"
    },
    support: {
      title: "帮助与支持",
      search: "搜索问题...",
      rules: "玩家守则",
      security: "安全中心",
      faq: "常见问题",
      ticket: "提交工单",
      email: "邮箱",
      category: "问题分类",
      desc: "问题描述",
      submit: "提交"
    }
  },
  en: {
    brand: "Orion Games",
    nav: {
      home: "Home",
      games: "Games",
      news: "News",
      esports: "Esports",
      community: "Community",
      support: "Support",
      careers: "Careers",
      about: "About",
      contact: "Contact",
      playNow: "Play Now",
      theme: "",
      lang: "Language"
    },
    index: {
      heroTitle: "Craft a universe for players",
      heroSub: "From competitive battles to vast galactic exploration, we put creativity and playability into every title. Join millions on their adventure.",
      browseGames: "Browse Games",
      viewNews: "View Latest News",
      popular: "Popular Games",
      features: "Key Features",
      spotlight: "Spotlight",
      latestNews: "Latest News",
      viewAll: "View All",
      moreNews: "More News",
      joinCommunity: "Join Community"
    },
    games: {
      title: "All Games",
      search: "Search game title...",
      all: "All Genres"
    },
    news: {
      title: "News & Announcements",
      search: "Search news...",
      rss: "Subscribe RSS",
      readMore: "Read More"
    },
    community: {
      title: "Community",
      ugc: "UGC Creations",
      submit: "Submit Work",
      search: "Search by title or author...",
      typeAll: "All Types",
      sortHot: "Top",
      sortNew: "Newest",
      view: "View"
    },
    support: {
      title: "Help & Support",
      search: "Search issues...",
      rules: "Player Rules",
      security: "Security Center",
      faq: "FAQ",
      ticket: "Submit Ticket",
      email: "Email",
      category: "Category",
      desc: "Description",
      submit: "Submit"
    }
  }
};

async function i18nLoad(lang) {
  if (I18N_CACHE[lang]) return I18N_CACHE[lang];
  try {
    const res = await fetch(`./data/i18n/${lang}.json`, { cache: 'no-store' });
    const dict = await res.json();
    I18N_CACHE[lang] = dict;
    return dict;
  } catch (e) {
    console.warn('i18n load failed, use embedded dict:', e);
    if (I18N_EMBED[lang]) {
      I18N_CACHE[lang] = I18N_EMBED[lang];
      return I18N_CACHE[lang];
    }
    if (lang !== 'zh' && I18N_EMBED.zh) {
      I18N_CACHE.zh = I18N_EMBED.zh;
      return I18N_CACHE.zh;
    }
    return {};
  }
}

function i18nGet(dict, key, fallback = '') {
  const parts = key.split('.');
  let cur = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return fallback || key;
    }
  }
  return typeof cur === 'string' ? cur : fallback || key;
}

async function i18nApply(lang) {
  const dict = await i18nLoad(lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr'); // 支持 placeholder/title/aria-label
    const val = i18nGet(dict, key, el.textContent.trim());
    
    // 特殊处理：如果按钮已经有图标内容且翻译值为空，则不覆盖内容
    if (attr) {
      el.setAttribute(attr, val);
    } else if (val === '' && el.innerHTML.trim() !== '') {
      // 如果翻译值为空但元素已有内容（如图标），则不覆盖
      return;
    } else {
      el.textContent = val;
    }
  });
  // 更新 <html lang="">
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
}

async function i18nInit() {
  const saved = localStorage.getItem('lang');
  I18N_CURRENT = saved === 'en' ? 'en' : 'zh';
  await i18nApply(I18N_CURRENT);
  const sel = document.getElementById('lang-select');
  if (sel) {
    sel.value = I18N_CURRENT;
    sel.addEventListener('change', async () => {
      const next = sel.value === 'en' ? 'en' : 'zh';
      I18N_CURRENT = next;
      localStorage.setItem('lang', next);
      await i18nApply(next);
    });
  }
}