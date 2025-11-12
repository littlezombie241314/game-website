// 轻量 i18n：从 /data/i18n/{lang}.json 加载词条，对 [data-i18n] 元素进行替换
const I18N_DEFAULT_LANG = 'zh';
let I18N_CACHE = {};
let I18N_CURRENT = I18N_DEFAULT_LANG;

// 内置字典（用于本地 file:// 打开时 fetch 受限的回退）
const I18N_EMBED = {
  zh: {
    brand: "SkyGirls Hub",
    nav: {
      home: "首页",
      aircrafts: "飞行器",
      discussions: "讨论区",
      guides: "飞行指南",
      community: "社区",
      support: "支持",
      about: "关于",
      contact: "联系",
      joinDiscussion: "加入讨论",
      theme: "",
      lang: "语言"
    },
    index: {
      heroTitle: "欢迎来到女生飞行器讨论社区",
      heroSub: "专为女生玩家打造的飞行器交流平台，分享飞行技巧、交流改装经验、结识同好飞友，一起探索天空的无限可能！",
      joinDiscussion: "加入讨论",
      viewGuides: "查看飞行指南",
      popularAircrafts: "热门飞行器",
      features: "特色模块",
      spotlight: "焦点推荐",
      latestDiscussions: "最新讨论",
      viewAll: "查看全部",
      moreDiscussions: "更多讨论",
      joinCommunity: "加入社区"
    },
    discussions: {
      title: "讨论区",
      search: "搜索讨论话题...",
      all: "全部话题"
    },
    aircrafts: {
      title: "飞行器展示",
      search: "搜索飞行器名称...",
      all: "全部类型"
    },
    community: {
      title: "社区",
      ugc: "用户分享",
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
      rules: "社区守则",
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
    brand: "SkyGirls Hub",
    nav: {
      home: "Home",
      aircrafts: "Aircrafts",
      discussions: "Discussions",
      guides: "Flight Guides",
      community: "Community",
      support: "Support",
      about: "About",
      contact: "Contact",
      joinDiscussion: "Join Discussion",
      theme: "",
      lang: "Language"
    },
    index: {
      heroTitle: "Welcome to SkyGirls Hub",
      heroSub: "A flight discussion community for female players. Share flying tips, exchange modification experiences, and connect with fellow aviation enthusiasts to explore the infinite possibilities of the sky!",
      joinDiscussion: "Join Discussion",
      viewGuides: "View Flight Guides",
      popularAircrafts: "Popular Aircrafts",
      features: "Key Features",
      spotlight: "Spotlight",
      latestDiscussions: "Latest Discussions",
      viewAll: "View All",
      moreDiscussions: "More Discussions",
      joinCommunity: "Join Community"
    },
    discussions: {
      title: "Discussions",
      search: "Search discussion topics...",
      all: "All Topics"
    },
    aircrafts: {
      title: "Aircraft Showcase",
      search: "Search aircraft name...",
      all: "All Types"
    },
    community: {
      title: "Community",
      ugc: "User Shares",
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
      rules: "Community Rules",
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