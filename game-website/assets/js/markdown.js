// 极简 Markdown 渲染器（支持：# 标题、段落、粗体、斜体、链接、列表、引用、代码块）
// 仅用于 Demo，复杂语法可替换为成熟库
function renderMarkdown(md) {
  if (!md) return '';
  // 移除 YAML Front Matter
  md = md.replace(/^---[\s\S]*?---\s*/m, '');
  // 转义 HTML
  md = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 代码块 ``` ```
  md = md.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`);
  // 行内代码
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');
  // 标题
  md = md
    .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // 引用
  md = md.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
  // 无序列表
  md = md.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
  md = md.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>').replace(/<\/ul>\s*<ul>/g, '');
  // 粗体与斜体
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // 链接
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // 段落（跳过已渲染标签的行）
  md = md.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<h\d|^<pre|^<blockquote|^<ul|^<li|^<p|^<img|^<code/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  return md;
}


