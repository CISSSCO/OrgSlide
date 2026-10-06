/**
 * OrgSlide - Standalone Markdown Parser Engine
 * Converts Markdown documents (.md, .markdown) into OrgSlide presentation data
 * Completely standalone; preserves existing Org-mode parsing untouched.
 */
(function() {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isImageSource(url) {
    if (!url) return false;
    const clean = url.trim();
    if (clean.startsWith('data:image/')) return true;
    if (clean.includes('avatars.githubusercontent.com') || 
        clean.includes('images.unsplash.com') ||
        clean.includes('img.shields.io')) return true;
    
    const pathOnly = clean.split('?')[0].split('#')[0];
    if (/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico)$/i.test(pathOnly)) return true;

    const filename = pathOnly.split('/').pop();
    if (window.ImageOverrides && (window.ImageOverrides[clean] || (filename && window.ImageOverrides[filename]))) return true;
    if (window.LocalFolderImages && (window.LocalFolderImages[clean] || (filename && window.LocalFolderImages[filename]))) return true;

    return false;
  }

  function resolveImageSrc(cleanUrl) {
    let src = cleanUrl;
    let originalUrl = cleanUrl;
    if (src.toLowerCase().startsWith('file:')) {
      src = src.substring(5);
    }
    if (src.startsWith('~/')) {
      src = '/home/cisco581b/' + src.substring(2);
    }
    if (src.startsWith('/')) {
      src = 'file://' + src;
    }
    const filename = originalUrl.split('/').pop().split('?')[0].split('#')[0];
    if (window.ImageOverrides) {
      if (window.ImageOverrides[originalUrl]) src = window.ImageOverrides[originalUrl];
      else if (window.ImageOverrides[src]) src = window.ImageOverrides[src];
      else if (filename && window.ImageOverrides[filename]) src = window.ImageOverrides[filename];
    }
    if (!src.startsWith('data:') && !src.startsWith('http://') && !src.startsWith('https://')) {
      if (window.LocalFolderImages) {
        const match = window.LocalFolderImages[originalUrl] ||
                      window.LocalFolderImages[cleanUrl] ||
                      (filename && window.LocalFolderImages[filename]);
        if (match) {
          if (typeof match === 'string') src = match;
          else if (match instanceof Blob) src = URL.createObjectURL(match);
        }
      }
    }
    return { src, originalUrl };
  }

  function renderMath(latex, isDisplay) {
    const trimmed = (latex || '').trim();
    if (!trimmed) return '';
    if (window.katex && typeof window.katex.renderToString === 'function') {
      try {
        return window.katex.renderToString(trimmed, {
          displayMode: !!isDisplay,
          throwOnError: false
        });
      } catch (err) {
        console.warn("KaTeX render error:", err);
      }
    }
    const tag = isDisplay ? 'div' : 'span';
    const cls = isDisplay ? 'math-display' : 'math-inline';
    return `<${tag} class="${cls}" data-latex="${escapeHtml(trimmed)}">${isDisplay ? '\\[' + escapeHtml(trimmed) + '\\]' : '\\(' + escapeHtml(trimmed) + '\\)'}</${tag}>`;
  }

  function renderImageContainer(url, altText) {
    const { src, originalUrl } = resolveImageSrc(url);
    const escapedAlt = escapeHtml(altText || url);
    const escapedOrig = escapeHtml(originalUrl);
    
    return `<div class="org-image-container align-center">
      <div class="image-toolbar">
        <button onclick="window.ImageManager.setAlignment(this, 'left')" data-align="left" title="Align Left (Float Left)">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="13" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button onclick="window.ImageManager.setAlignment(this, 'center')" data-align="center" class="active" title="Align Center">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button onclick="window.ImageManager.setAlignment(this, 'middle')" data-align="middle" title="Middle / Inline">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><rect x="4" y="6" width="16" height="12" rx="2"></rect><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line></svg>
        </button>
        <button onclick="window.ImageManager.setAlignment(this, 'right')" data-align="right" title="Align Right (Float Right)">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="11" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button onclick="window.ImageManager.scaleImage(this, -0.15)" title="Scale Smaller (-15%)">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button onclick="window.ImageManager.scaleImage(this, 0.15)" title="Scale Larger (+15%)">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button onclick="window.ImageManager.setWidthPreset(this, '100%')" title="Full Width (100%)">
          <span style="font-size: 10px; font-weight: bold; letter-spacing: -0.5px;">100%</span>
        </button>
        <button onclick="window.ImageManager.resetSize(this)" title="Reset Original Size">
          <span style="font-size: 10px; font-weight: bold;">1:1</span>
        </button>
        <div class="toolbar-divider"></div>
        <button onclick="window.Interact ? window.Interact.enableFreeMode(this) : null" title="Free Move / 8-Way Resize">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
        </button>
        <button onclick="window.ImageManager.toggleLock(this)" data-action="lock" title="Lock / Fix Position">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
        </button>
        <button onclick="window.ImageManager.toggleFullscreen(this)" title="Zoom Fullscreen">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button onclick="window.ImageManager.handleBrokenImage(this.closest('.org-image-container').querySelector('img'))" title="Fix Broken Link / Manually Override Image" style="color: var(--secondary);">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        </button>
        <button onclick="window.ImageManager.removeOverride('${escapedOrig}', this)" title="Reset Image Override" style="color: var(--accent);">
          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <img src="${src}" alt="${escapedAlt}" data-original-url="${escapedOrig}" class="org-image" referrerpolicy="no-referrer" />
      <div class="inline-resize-handle" title="Drag to resize"></div>
    </div>`;
  }

  function renderCodeBlock(codeLang, rawCode) {
    if (window.generateCodeBlockHTML) {
      return window.generateCodeBlockHTML(codeLang, rawCode);
    }
    const displayLang = codeLang === 'plaintext' ? 'text' : codeLang;
    return `
      <div class="code-block-container">
        <div class="code-language-badge">${displayLang}</div>
        <div class="code-actions">
          <button class="code-action-btn font-size-btn" title="Reset Font Size" onclick="resetCodeFontSize(this)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          </button>
          <button class="code-action-btn font-size-btn" title="Decrease Font Size" onclick="changeCodeFontSize(this, -1)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button class="code-action-btn font-size-btn" title="Increase Font Size" onclick="changeCodeFontSize(this, 1)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button class="code-action-btn copy-btn" title="Copy code" onclick="copyCode(this)">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button class="code-action-btn fullscreen-btn" title="Toggle Fullscreen" onclick="toggleFullscreenCode(this)">
            <svg class="icon-expand" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            <svg class="icon-collapse" style="display:none;" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
          </button>
        </div>
        <pre><code class="language-${codeLang}">${escapeHtml(rawCode)}</code></pre>
      </div>
    `;
  }

  // Parse inline markdown formatting
  function formatInlineMarkdown(str) {
    if (!str) return '';

    // 1. Stash all inline code blocks (`code` or ``code``) so their contents are NEVER parsed as images, links, math, bold, etc.!
    const codeStash = [];
    str = str.replace(/(`+)([\s\S]*?)\1/g, (match, delimiter, codeContent) => {
      const placeholder = `\x01MDX${codeStash.length}\x02`;
      codeStash.push(`<code>${escapeHtml(codeContent)}</code>`);
      return placeholder;
    });

    // 2. Perform all Markdown inline transformations
    // LaTeX Math display: $$math$$
    str = str.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      return renderMath(formula, true);
    });
    // LaTeX Math inline: $math$
    str = str.replace(/\$([^$\n\r]+?)\$/g, (match, formula) => {
      if (/^\s*\d+(\.\d+)?\s*$/.test(formula)) return match;
      return renderMath(formula, false);
    });

    // Images with links: [![alt](img_url)](link_url)
    str = str.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (match, alt, imgUrl, linkUrl) => {
      return `<a href="${linkUrl}" target="_blank" class="image-link">${renderImageContainer(imgUrl, alt)}</a>`;
    });

    // Images: ![alt](url)
    str = str.replace(/!\[([^\]]*)\]\(([^)]+)\)\]/g, (match, alt, url) => {
      const cleanUrl = url.trim();
      return renderImageContainer(cleanUrl, alt);
    });
    str = str.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const cleanUrl = url.trim();
      return renderImageContainer(cleanUrl, alt);
    });

    // Links: [text](url)
    str = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const trimmed = text.trim();
      if (isImageSource(trimmed)) {
        return `<a href="${url}" target="_blank">${renderImageContainer(trimmed, 'Link Image')}</a>`;
      }
      return `<a href="${url}" target="_blank" style="color: var(--secondary);">${trimmed}</a>`;
    });

    // Keyboard tags: <kbd>key</kbd>
    str = str.replace(/<kbd>([^<]+)<\/kbd>/gi, '<kbd class="markdown-kbd">$1</kbd>');

    // Bold + Italic: ***text*** or ___text___
    str = str.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');

    // Bold: **text** or __text__
    str = str.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Italic: *text* or _text_
    str = str.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Strikethrough: ~~text~~
    str = str.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Highlight: ==text==
    str = str.replace(/==(.*?)==/g, '<mark class="markdown-mark">$1</mark>');

    // Superscript: ^text^
    str = str.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');

    // Subscript: ~text~
    str = str.replace(/~([^~]+)~/g, '<sub>$1</sub>');

    // Footnote reference: [^1]
    str = str.replace(/\[\^([^\]]+)\]/g, (match, fnId) => {
      return `<sup class="footnote-ref"><a href="#fn-${fnId}">[${fnId}]</a></sup>`;
    });

    // 3. Restore stashed inline code blocks safely!
    str = str.replace(/\x01MDX(\d+)\x02/g, (match, index) => {
      return codeStash[parseInt(index, 10)] || '';
    });

    return str;
  }

  // Parse Markdown Table with column alignments
  function renderMarkdownTable(rows) {
    if (rows.length === 0) return '';
    let alignments = [];
    let cleanRows = [];

    for (let i = 0; i < rows.length; i++) {
      let r = rows[i].trim();
      // Remove leading/trailing pipes if present
      if (r.startsWith('|')) r = r.substring(1);
      if (r.endsWith('|')) r = r.substring(0, r.length - 1);

      // Protect escaped pipes \| and pipes inside backticks `...`
      r = r.replace(/\\\|/g, '\x01PIPE\x01');
      r = r.replace(/(`+)([\s\S]*?)\1/g, (m) => m.replace(/\|/g, '\x01PIPE\x01'));
      let cells = r.split('|').map(c => c.replace(/\x01PIPE\x01/g, '|').trim());

      // Check if this row is an alignment separator (e.g. :---|:---:|---:)
      let isSeparator = cells.every(c => /^:?-+:?$/.test(c));
      if (isSeparator) {
        alignments = cells.map(c => {
          if (c.startsWith(':') && c.endsWith(':')) return 'align-center';
          if (c.endsWith(':')) return 'align-right';
          if (c.startsWith(':')) return 'align-left';
          return '';
        });
        continue;
      }
      cleanRows.push(cells);
    }

    if (cleanRows.length === 0) return '';

    let html = `<table class="ppt-table">`;
    cleanRows.forEach((row, rIdx) => {
      const tag = rIdx === 0 ? 'th' : 'td';
      html += '<tr>';
      row.forEach((cell, cIdx) => {
        const alignClass = alignments[cIdx] ? ` class="${alignments[cIdx]}"` : '';
        html += `<${tag}${alignClass}>${formatInlineMarkdown(cell)}</${tag}>`;
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
  }

  // Parse body lines of a Markdown slide into HTML
  function formatMarkdownLinesToHtml(lines) {
    let html = '';
    let inCodeBlock = false;
    let codeLang = 'plaintext';
    let codeBuffer = [];

    let inMathBlock = false;
    let mathBuffer = [];

    let inTable = false;
    let tableRows = [];

    let listStack = []; // [{ type: 'ul'|'ol'|'task', indent: number }]
    let inBlockquote = false;
    let quoteBuffer = [];
    let calloutType = null; // 'note' | 'tip' | 'important' | 'warning' | 'caution'

    let footnotes = {}; // { id: text }

    const closeList = () => {
      while (listStack.length > 0) {
        const popped = listStack.pop();
        html += popped.type === 'ol' ? "</li></ol>" : "</li></ul>";
      }
    };

    const flushQuote = () => {
      if (quoteBuffer.length > 0) {
        const content = quoteBuffer.map(q => formatInlineMarkdown(q)).join('<br>');
        if (calloutType) {
          const title = calloutType.toUpperCase();
          let iconSvg = '';
          if (calloutType === 'note') iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
          else if (calloutType === 'tip') iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
          else if (calloutType === 'warning') iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
          else if (calloutType === 'caution') iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
          else iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

          html += `<div class="markdown-callout ${calloutType}">
            <div class="markdown-callout-title">${iconSvg}<span>${title}</span></div>
            <div class="markdown-callout-body">${content}</div>
          </div>`;
        } else {
          html += `<blockquote class="markdown-quote">${content}</blockquote>`;
        }
        quoteBuffer = [];
        calloutType = null;
        inBlockquote = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Fenced Code Block begin / end: ```lang or ~~~lang
      let fenceMatch = line.match(/^(\s*)(```|~~~)(.*)$/);
      if (fenceMatch) {
        if (inTable) { html += renderMarkdownTable(tableRows); tableRows = []; inTable = false; }
        if (inBlockquote) flushQuote();
        closeList();

        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = fenceMatch[3].trim().toLowerCase() || 'plaintext';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          html += renderCodeBlock(codeLang, codeBuffer.join('\n'));
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Multi-line Math block: $$ ... $$
      if (line.trim() === '$$') {
        if (!inMathBlock) {
          if (inTable) { html += renderMarkdownTable(tableRows); tableRows = []; inTable = false; }
          if (inBlockquote) flushQuote();
          closeList();
          inMathBlock = true;
          mathBuffer = [];
        } else {
          inMathBlock = false;
          html += renderMath(mathBuffer.join('\n'), true);
          mathBuffer = [];
        }
        continue;
      }

      if (inMathBlock) {
        mathBuffer.push(line);
        continue;
      }

      // Footnote definitions: [^1]: Definition text
      let fnMatch = line.match(/^\[\^([^\]]+)\]:\s*(.+)$/);
      if (fnMatch) {
        footnotes[fnMatch[1]] = fnMatch[2].trim();
        continue;
      }

      // Blockquotes & Callouts: > text
      let quoteMatch = line.match(/^\s*>\s?(.*)$/);
      if (quoteMatch) {
        if (inTable) { html += renderMarkdownTable(tableRows); tableRows = []; inTable = false; }
        closeList();

        let quoteText = quoteMatch[1];
        if (!inBlockquote) {
          inBlockquote = true;
          quoteBuffer = [];
          // Check for callout tag: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
          let calloutMatch = quoteText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
          if (calloutMatch) {
            calloutType = calloutMatch[1].toLowerCase();
            let remainder = quoteText.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '').trim();
            if (remainder) quoteBuffer.push(remainder);
            continue;
          }
        }
        quoteBuffer.push(quoteText);
        continue;
      } else if (inBlockquote) {
        flushQuote();
      }

      // Markdown Tables: lines starting and containing |
      if (line.trim().startsWith('|')) {
        closeList();
        inTable = true;
        tableRows.push(line);
        continue;
      } else if (inTable) {
        html += renderMarkdownTable(tableRows);
        tableRows = [];
        inTable = false;
      }

      // Horizontal Rule inside a slide: --- or *** or ___
      if (line.trim().match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        closeList();
        html += '<hr class="ppt-hr" />';
        continue;
      }

      // Sub-headings inside slide body (####, #####, ######)
      let subHMatch = line.match(/^(#{4,6})\s+(.+)$/);
      if (subHMatch) {
        closeList();
        const hLevel = subHMatch[1].length;
        html += `<h${hLevel} class="slide-subheading">${formatInlineMarkdown(subHMatch[2].trim())}</h${hLevel}>`;
        continue;
      }

      // Task List: - [ ] or - [x]
      let taskMatch = line.match(/^(\s*)([-*+])\s+\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const indent = taskMatch[1].length;
        const isChecked = taskMatch[3].toLowerCase() === 'x';
        const taskText = formatInlineMarkdown(taskMatch[4]);
        const checkedClass = isChecked ? ' checked' : '';
        const checkedAttr = isChecked ? ' checked' : '';

        if (listStack.length === 0 || listStack[listStack.length - 1].type !== 'task') {
          closeList();
          html += `<ul class="ppt-list task-list">`;
          listStack.push({ type: 'task', indent: indent });
        }
        html += `<li class="task-list-item${checkedClass}">
          <input type="checkbox" class="task-checkbox"${checkedAttr} disabled />
          <span class="task-text">${taskText}</span>
        </li>`;
        continue;
      }

      // Ordered and Unordered Lists:
      let numMatch = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
      let bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);

      if (numMatch || bulletMatch) {
        const currentIndent = (numMatch || bulletMatch)[1].length;
        const itemType = numMatch ? 'ol' : 'ul';
        const itemNum = numMatch ? parseInt(numMatch[2], 10) : null;
        const itemContent = numMatch ? numMatch[3] : bulletMatch[3];

        if (listStack.length === 0) {
          html += itemType === 'ol' ? `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>` : `<ul class="ppt-list">`;
          listStack.push({ type: itemType, indent: currentIndent });
          html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
        } else {
          const top = listStack[listStack.length - 1];
          if (currentIndent > top.indent) {
            html += itemType === 'ol' ? `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>` : `<ul class="ppt-list">`;
            listStack.push({ type: itemType, indent: currentIndent });
            html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
          } else if (currentIndent < top.indent) {
            while (listStack.length > 0 && listStack[listStack.length - 1].indent > currentIndent) {
              const popped = listStack.pop();
              html += popped.type === 'ol' ? "</li></ol>" : "</li></ul>";
            }
            if (listStack.length > 0 && listStack[listStack.length - 1].indent === currentIndent) {
              const currentTop = listStack[listStack.length - 1];
              if (currentTop.type === itemType) {
                html += `</li><li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
              } else {
                listStack.pop();
                html += currentTop.type === 'ol' ? "</li></ol>" : "</li></ul>";
                html += itemType === 'ol' ? `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>` : `<ul class="ppt-list">`;
                listStack.push({ type: itemType, indent: currentIndent });
                html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
              }
            } else {
              html += itemType === 'ol' ? `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>` : `<ul class="ppt-list">`;
              listStack.push({ type: itemType, indent: currentIndent });
              html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
            }
          } else {
            if (top.type === itemType) {
              html += `</li><li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
            } else {
              listStack.pop();
              html += top.type === 'ol' ? "</li></ol>" : "</li></ul>";
              html += itemType === 'ol' ? `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>` : `<ul class="ppt-list">`;
              listStack.push({ type: itemType, indent: currentIndent });
              html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineMarkdown(itemContent)}`;
            }
          }
        }
        continue;
      }

      // Blank line
      if (line.trim().length === 0) {
        continue;
      }

      // Regular paragraph or continuation
      if (listStack.length > 0) {
        if (line.match(/^\s{2,}/)) {
          html += `<p>${formatInlineMarkdown(line.trim())}</p>`;
          continue;
        } else {
          closeList();
        }
      }

      const formatted = formatInlineMarkdown(line);
      const trimmedFmt = formatted.trim();
      if (trimmedFmt.startsWith('<div') || trimmedFmt.startsWith('<table') || trimmedFmt.startsWith('<blockquote') || trimmedFmt.startsWith('<hr')) {
        html += formatted;
      } else {
        html += `<p>${formatted}</p>`;
      }
    }

    if (inMathBlock && mathBuffer.length > 0) {
      html += renderMath(mathBuffer.join('\n'), true);
    }
    if (inTable) html += renderMarkdownTable(tableRows);
    if (inBlockquote) flushQuote();
    closeList();

    // Append footnotes if present
    const fnKeys = Object.keys(footnotes);
    if (fnKeys.length > 0) {
      html += '<div class="markdown-footnotes"><ol>';
      fnKeys.forEach(k => {
        html += `<li id="fn-${k}">${formatInlineMarkdown(footnotes[k])} <a href="#fnref-${k}" class="footnote-backref">↩</a></li>`;
      });
      html += '</ol></div>';
    }

    return html;
  }

  /**
   * Main Markdown Parser
   * Parses Markdown text into the standard OrgSlide slideObjects array.
   */
  function parseMarkdown(text) {
    if (!text) return [];

    let rawLines = text.split('\n');
    let docTitle = '';
    let docSubtitle = '';
    let docAuthor = '';
    let docDate = '';
    let endMessage = '';

    // 1. Check for YAML frontmatter at top of document
    let lineIdx = 0;
    if (rawLines[0] && rawLines[0].trim() === '---') {
      let fmEndIdx = -1;
      for (let i = 1; i < rawLines.length; i++) {
        if (rawLines[i].trim() === '---') {
          fmEndIdx = i;
          break;
        }
      }
      if (fmEndIdx > 0) {
        for (let i = 1; i < fmEndIdx; i++) {
          let fLine = rawLines[i];
          let mTitle = fLine.match(/^title:\s*(.+)$/i);
          if (mTitle) { docTitle = mTitle[1].replace(/^["']|["']$/g, '').trim(); continue; }

          let mSub = fLine.match(/^subtitle:\s*(.+)$/i);
          if (mSub) { docSubtitle = mSub[1].replace(/^["']|["']$/g, '').trim(); continue; }

          let mAuth = fLine.match(/^author:\s*(.+)$/i);
          if (mAuth) { docAuthor = mAuth[1].replace(/^["']|["']$/g, '').trim(); continue; }

          let mDate = fLine.match(/^date:\s*(.+)$/i);
          if (mDate) { docDate = mDate[1].replace(/^["']|["']$/g, '').trim(); continue; }

          let mEnd = fLine.match(/^(?:end_message|thank_you|thanks):\s*(.+)$/i);
          if (mEnd) { endMessage = mEnd[1].replace(/^["']|["']$/g, '').trim(); continue; }
        }
        lineIdx = fmEndIdx + 1;
      }
    }

    if (endMessage) {
      if (!window.socialLinksData) window.socialLinksData = {};
      window.socialLinksData.endMessage = endMessage;
    }

    // 2. Process sections / slides
    let sections = [];
    let currentSection = null;
    let activeH1 = null;
    let activeH2 = null;
    let activeH3 = null;

    let inFencedCode = false;
    let pendingSlideDivider = false;

    for (let i = lineIdx; i < rawLines.length; i++) {
      let line = rawLines[i];

      // Track fenced code blocks to never treat --- or # inside code blocks as slide breaks
      if (line.match(/^(\s*)(```|~~~)/)) {
        inFencedCode = !inFencedCode;
        if (currentSection) currentSection.lines.push(line);
        continue;
      }
      if (inFencedCode) {
        if (currentSection) currentSection.lines.push(line);
        continue;
      }

      // Check for standalone slide divider: --- (or ***)
      let slideDividerMatch = line.match(/^(\s*)(-|\*){3,}\s*$/);
      if (slideDividerMatch) {
        pendingSlideDivider = true;
        continue;
      }

      // Check for Markdown Headings:
      // Level 1: # Heading
      let h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match) {
        let h1Title = h1Match[1].trim();
        if (!docTitle) docTitle = h1Title;

        activeH1 = { title: h1Title, index: sections.length + 1 };
        activeH2 = null;
        activeH3 = null;

        // If currentSection had no title and no lines, reuse it
        if (currentSection && !currentSection.title && currentSection.lines.length === 0) {
          currentSection.title = h1Title;
          currentSection.level = 1;
          currentSection.breadcrumbs = [
            { title: docTitle || h1Title, index: 0 },
            { title: h1Title, index: activeH1.index }
          ];
        } else {
          currentSection = {
            level: 1,
            title: h1Title,
            breadcrumbs: [
              { title: docTitle || h1Title, index: 0 },
              { title: h1Title, index: activeH1.index }
            ],
            lines: []
          };
          sections.push(currentSection);
        }
        pendingSlideDivider = false;
        continue;
      }

      // Level 2: ## Heading
      let h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        let h2Title = h2Match[1].trim();
        activeH2 = { title: h2Title, index: sections.length + 1 };
        activeH3 = null;

        let crumbs = [{ title: docTitle || 'Presentation', index: 0 }];
        if (activeH1) crumbs.push(activeH1);
        crumbs.push({ title: h2Title, index: activeH2.index });

        if (currentSection && !currentSection.title && currentSection.lines.length === 0) {
          currentSection.title = h2Title;
          currentSection.level = 2;
          currentSection.breadcrumbs = crumbs;
        } else {
          currentSection = {
            level: 2,
            title: h2Title,
            breadcrumbs: crumbs,
            lines: []
          };
          sections.push(currentSection);
        }
        pendingSlideDivider = false;
        continue;
      }

      // Level 3: ### Heading
      let h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        let h3Title = h3Match[1].trim();
        activeH3 = { title: h3Title, index: sections.length + 1 };

        let crumbs = [{ title: docTitle || 'Presentation', index: 0 }];
        if (activeH1) crumbs.push(activeH1);
        if (activeH2) crumbs.push(activeH2);
        crumbs.push({ title: h3Title, index: activeH3.index });

        if (currentSection && !currentSection.title && currentSection.lines.length === 0) {
          currentSection.title = h3Title;
          currentSection.level = 3;
          currentSection.breadcrumbs = crumbs;
        } else {
          currentSection = {
            level: 3,
            title: h3Title,
            breadcrumbs: crumbs,
            lines: []
          };
          sections.push(currentSection);
        }
        pendingSlideDivider = false;
        continue;
      }

      // Non-heading content after a slide break (---)
      if (pendingSlideDivider) {
        if (line.trim().length === 0) continue; // Skip blank lines right after divider
        pendingSlideDivider = false;

        let crumbs = [{ title: docTitle || 'Presentation', index: 0 }];
        if (activeH1) crumbs.push(activeH1);
        if (activeH2) crumbs.push(activeH2);

        currentSection = {
          level: activeH2 ? 2 : (activeH1 ? 1 : 2),
          title: '', // Will be derived from first content line
          breadcrumbs: crumbs,
          lines: []
        };
        sections.push(currentSection);
      }

      // Content before any heading or divider
      if (!currentSection) {
        if (line.trim().length === 0) continue;
        currentSection = {
          level: 1,
          title: docTitle || 'Introduction',
          breadcrumbs: [{ title: docTitle || 'Introduction', index: 0 }],
          lines: []
        };
        sections.push(currentSection);
      }

      currentSection.lines.push(line);
    }

    // 3. Assemble slide objects matching OrgSlide structure
    const finalDocTitle = docTitle || 'Markdown Presentation';
    window.globalDocAuthor = docAuthor;

    let metaHtml = [];
    if (docAuthor) metaHtml.push(`<strong>Author:</strong> ${escapeHtml(docAuthor)}`);
    if (docDate) metaHtml.push(`<strong>Date:</strong> ${escapeHtml(docDate)}`);

    let slideObjects = [];

    // Slide 1: Title Slide (index 0)
    slideObjects.push({
      isTitle: true,
      title: finalDocTitle,
      subtitle: docSubtitle,
      breadcrumbs: [{ title: finalDocTitle, index: 0 }],
      meta: metaHtml.join('<br>')
    });

    // Filter out:
    // (a) Any section with no title and no non-blank lines
    // (b) Any section whose title equals finalDocTitle and has no content lines
    let filteredSections = sections.filter(sec => {
      const hasLines = sec.lines.some(l => l.trim().length > 0);
      const hasTitle = sec.title && sec.title.trim().length > 0;
      if (!hasTitle && !hasLines) return false;
      if (!hasLines && sec.title === finalDocTitle) return false;
      return true;
    });

    // (c) Any parent heading section that has no body lines and is immediately followed by a sub-section
    filteredSections = filteredSections.filter((sec, idx, arr) => {
      const hasContent = sec.lines.some(l => l.trim().length > 0);
      if (hasContent) return true;
      const nextSec = arr[idx + 1];
      if (nextSec && nextSec.level > sec.level) {
        return false; // Skip empty parent heading slide
      }
      return hasContent || (sec.title && sec.title !== finalDocTitle);
    });

    // Subsequent Slides
    filteredSections.forEach(sec => {
      let secTitle = sec.title;
      if (!secTitle) {
        const firstLine = sec.lines.find(l => l.trim().length > 0);
        if (firstLine) {
          secTitle = firstLine.trim().replace(/^[-*+#>]+\s*/, '').replace(/[`*~_]/g, '').slice(0, 45);
        } else {
          secTitle = finalDocTitle;
        }
      }

      let breadcrumbs = sec.breadcrumbs;
      if (!breadcrumbs || breadcrumbs.length === 0) {
        breadcrumbs = [
          { title: finalDocTitle, index: 0 },
          { title: secTitle, index: slideObjects.length }
        ];
      } else if (breadcrumbs.length > 0) {
        breadcrumbs[0].title = finalDocTitle;
      }

      let contentHtml = formatMarkdownLinesToHtml(sec.lines);

      slideObjects.push({
        isTitle: false,
        level: sec.level || 2,
        title: secTitle,
        breadcrumbs: breadcrumbs,
        body: contentHtml
      });
    });

    return slideObjects;
  }

  // Expose to window
  window.parseMarkdown = parseMarkdown;
  window.formatInlineMarkdown = formatInlineMarkdown;
  window.formatMarkdownLinesToHtml = formatMarkdownLinesToHtml;

})();
