# 游戏官网（静态版）
游玩的时候，就在代码页面，下载整个文件夹，点开里面的index.html，就可以玩了。
本项目为“大型游戏网站官网”的静态实现原型，使用原生 HTML/CSS/JS 构建，可直接在浏览器中打开 `index.html` 进行预览，无需安装依赖或运行构建工具。

目录结构：
- `index.html`：首页（英雄区、特色模块、动态区块占位）
- `games.html`：游戏目录页（卡片栅格、筛选占位）
- `news.html`：新闻/公告列表页与详情占位
- `esports.html`：电竞/赛事页
- `community.html`：社区页（社媒、UGC 占位）
- `support.html`：客服/支持页（FAQ、搜索占位）
- `careers.html`：招聘/加入我们页
- `about.html`：关于我们页
- `contact.html`：联系页（表单占位）
- `assets/css/styles.css`：站点样式（响应式、暗色模式）
- `assets/js/main.js`：交互逻辑（导航、暗色模式、组件交互）
- `data/*.json`：演示数据（新闻、游戏）

特性：
- 响应式布局与暗色模式
- 复用的导航与页脚
- 栅格卡片、手风琴 FAQ、表单与占位 API 数据加载
- 语义化 HTML、基础 SEO 元数据

后续可升级：
- 接入框架（Next.js/Astro）与真实后端 API
- 使用 MDX/Markdown 驱动内容
- 表单与搜索的服务端处理
- 会添加游戏相关产品。欢迎赞助。


