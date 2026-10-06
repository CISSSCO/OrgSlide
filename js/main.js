let slides = [];
    window.currentSlide = 0; let currentSlide = window.currentSlide;
    const deckContainer = document.getElementById('deckContainer');
    const fileInput = document.getElementById('fileInput');

    window.refreshSlidesList = function() {
      slides = document.querySelectorAll('.slide');
    };

    // Code Block Button Actions
    function changeCodeFontSize(btn, direction) {
      const container = btn.closest('.code-block-container');
      const pre = container.querySelector('pre');
      let currentSize = parseFloat(pre.style.fontSize) || parseFloat(window.getComputedStyle(pre).fontSize);
      let newSize = currentSize + (direction * 2);
      pre.style.setProperty('font-size', newSize + 'px', 'important');
      
      // Save globally for all code blocks or specific one? It's easier to apply globally or by index
      // Let's save a map by index
      let fonts = JSON.parse(sessionStorage.getItem('orgSlide_codeFonts') || '{}');
      const blocks = Array.from(document.querySelectorAll('pre'));
      const index = blocks.indexOf(pre);
      fonts[index] = newSize;
      sessionStorage.setItem('orgSlide_codeFonts', JSON.stringify(fonts));
    }
    
    // Function to restore code fonts
    window.restoreCodeFonts = function() {
      let fonts = JSON.parse(sessionStorage.getItem('orgSlide_codeFonts') || '{}');
      const blocks = Array.from(document.querySelectorAll('pre'));
      for (let i in fonts) {
         if (blocks[i]) {
            blocks[i].style.setProperty('font-size', fonts[i] + 'px', 'important');
         }
      }
    };

    function resetCodeFontSize(btn) {
      const container = btn.closest('.code-block-container');
      const pre = container.querySelector('pre');
      pre.style.removeProperty('font-size');
    }

    function handleGlobalCodeResize(key) {
      let targets = document.querySelectorAll('.code-block-container.fullscreen');
      
      targets.forEach(container => {
        const pre = container.querySelector('pre');
        if (!pre) return;
        if (key === '0') {
          pre.style.removeProperty('font-size');
        } else {
          let currentSize = parseFloat(pre.style.fontSize) || parseFloat(window.getComputedStyle(pre).fontSize);
          let direction = (key === '=' || key === '+') ? 1 : -1;
          pre.style.setProperty('font-size', (currentSize + (direction * 2)) + 'px', 'important');
        }
      });
    }

    function copyCode(btn) {
      const container = btn.closest('.code-block-container');
      const codeEl = container.querySelector('code');
      if (!codeEl) return;
      
      // Allow user to just select text from the block if they want.
      // This copyCode copies all text content.
      navigator.clipboard.writeText(codeEl.textContent).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
      });
    }

    function toggleFullscreenCode(btn) {
      const container = btn.closest('.code-block-container');
      const isFullscreen = container.classList.toggle('fullscreen');
      const iconExpand = btn.querySelector('.icon-expand');
      const iconCollapse = btn.querySelector('.icon-collapse');
      
      document.body.classList.toggle('has-fullscreen-code', isFullscreen);
      
      if (isFullscreen) {
        if (iconExpand) iconExpand.style.setProperty('display', 'none', 'important');
        if (iconCollapse) iconCollapse.style.setProperty('display', 'block', 'important');
        btn.setAttribute('title', 'Exit Fullscreen');
      } else {
        if (iconExpand) iconExpand.style.setProperty('display', 'block', 'important');
        if (iconCollapse) iconCollapse.style.setProperty('display', 'none', 'important');
        btn.setAttribute('title', 'Toggle Fullscreen');
      }
    }

    // Wrap raw code string with UI actions
    function generateCodeBlockHTML(codeLang, rawCode) {
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
        </div>`;
    }

    // Parse Org-mode content into structured slides
    function parseOrgMode(text) {
      const lines = text.split('\n');
      let docTitle = "";
      let docSubtitle = "";
      let docAuthor = "";
      let docDate = "";
      
      let sections = [];
      let currentSection = null;
      
      // Track the most recent slide index for each heading level
      let activeH1 = null;
      let activeH2 = null;
      let activeH3 = null;
      
      let inPropertiesDrawer = false;

      // Helper to strip Org tags (e.g., :tag1:tag2:) from the end of a heading
      const cleanHeading = (title) => title.replace(/\s+:[a-zA-Z0-9_@:]+:\s*$/, '').trim();

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Skip Org-mode property drawers (e.g. :PROPERTIES: ... :END:)
        if (line.trim().toUpperCase() === ':PROPERTIES:') {
          inPropertiesDrawer = true;
          continue;
        }
        if (inPropertiesDrawer) {
          if (line.trim().toUpperCase() === ':END:') {
            inPropertiesDrawer = false;
          }
          continue; // Skip all lines inside the properties drawer
        }

        // Metadata headers
        let titleMatch = line.match(/^#\+TITLE:\s*(.+)$/i);
        if (titleMatch) { docTitle = titleMatch[1].trim(); continue; }

        let subtitleMatch = line.match(/^#\+SUBTITLE:\s*(.+)$/i);
        if (subtitleMatch) { docSubtitle = subtitleMatch[1].trim(); continue; }

        let authorMatch = line.match(/^#\+AUTHOR:\s*(.+)$/i);
        if (authorMatch) { docAuthor = authorMatch[1].trim(); continue; }

        let dateMatch = line.match(/^#\+DATE:\s*(.+)$/i);
        if (dateMatch) { docDate = dateMatch[1].trim(); continue; }

        let endMsgMatch = line.match(/^#\+(?:END_MESSAGE|THANK_YOU|THANKS):\s*(.+)$/i);
        if (endMsgMatch) {
          if (!window.socialLinksData) window.socialLinksData = {};
          window.socialLinksData.endMessage = endMsgMatch[1].trim();
          continue;
        }

        // Skip Reveal.js attributes, standard options, and unhandled metadata
        // We only want to keep #+begin_, #+end_, and #+RESULTS: which are handled later
        if (line.match(/^#\+(ATTR_[A-Z0-9_-]+|REVEAL(_[A-Z0-9_-]+)?|OPTIONS|PROPERTY|SETUPFILE|MACRO|HTML_HEAD|NAME|CAPTION):/i)) {
          continue;
        }

        // Level 1 Heading (* Heading)
        let h1Match = line.match(/^\*\s+([^*].*)$/);
        if (h1Match) {
          let h1Title = cleanHeading(h1Match[1]);
          activeH1 = { title: h1Title, index: sections.length + 1 };
          activeH2 = null;
          activeH3 = null;

          currentSection = {
            level: 1,
            title: h1Title,
            breadcrumbs: [
              { title: docTitle, index: 0 },
              { title: h1Title, index: activeH1.index }
            ],
            lines: []
          };
          sections.push(currentSection);
          continue;
        }

        // Level 2 Heading (** Subheading)
        let h2Match = line.match(/^\*\*\s+([^*].*)$/);
        if (h2Match) {
          let h2Title = cleanHeading(h2Match[1]);
          activeH2 = { title: h2Title, index: sections.length + 1 };
          activeH3 = null;

          let crumbs = [{ title: docTitle, index: 0 }];
          if (activeH1) crumbs.push(activeH1);
          crumbs.push({ title: h2Title, index: activeH2.index });

          currentSection = {
            level: 2,
            title: h2Title,
            breadcrumbs: crumbs,
            lines: []
          };
          sections.push(currentSection);
          continue;
        }

        // Level 3 Heading (*** Sub-subheading)
        let h3Match = line.match(/^\*\*\*\s+([^*].*)$/);
        if (h3Match) {
          let h3Title = cleanHeading(h3Match[1]);
          activeH3 = { title: h3Title, index: sections.length + 1 };

          let crumbs = [{ title: docTitle, index: 0 }];
          if (activeH1) crumbs.push(activeH1);
          if (activeH2) crumbs.push(activeH2);
          crumbs.push({ title: h3Title, index: activeH3.index });

          currentSection = {
            level: 3,
            title: h3Title,
            breadcrumbs: crumbs,
            lines: []
          };
          sections.push(currentSection);
          continue;
        }

        if (currentSection) {
          currentSection.lines.push(line);
        }
      }

      // Convert each parsed section into HTML slides
      let slideObjects = [];

      window.globalDocAuthor = docAuthor;
      let metaHtml = [];
      if (docAuthor) metaHtml.push(`<strong>Author:</strong> ${docAuthor}`);
      if (docDate) metaHtml.push(`<strong>Date:</strong> ${docDate}`);

      const finalDocTitle = docTitle || 'Untitled Presentation';

      // Slide 1: Title Slide (index 0)
      slideObjects.push({
        isTitle: true,
        title: finalDocTitle,
        subtitle: docSubtitle,
        breadcrumbs: [{ title: finalDocTitle, index: 0 }],
        meta: metaHtml.join('<br>')
      });

      // Process each section into slides
      sections.forEach(sec => {
        if (sec.breadcrumbs.length > 0) {
          sec.breadcrumbs[0].title = finalDocTitle;
        }
        
        let contentHtml = formatOrgLinesToHtml(sec.lines);
        
        // Always push to keep indices synced, even if empty
        slideObjects.push({
          isTitle: false,
          level: sec.level,
          title: sec.title,
          breadcrumbs: sec.breadcrumbs,
          body: contentHtml
        });
      });

      return slideObjects;
    }

    // Format Org-mode body syntax to clean PowerPoint HTML with Syntax Highlighting
    function formatOrgLinesToHtml(lines) {
      let html = "";
      let inCodeBlock = false;
      let codeLang = "bash";
      let codeBuffer = [];
      let inColonBlock = false;
      let colonBuffer = [];
      let inTable = false;
      let tableRows = [];
      let listStack = []; // [{ type: 'ul' | 'ol', indent: number }]

      const closeList = () => {
        while (listStack.length > 0) {
          const popped = listStack.pop();
          html += popped.type === 'ol' ? "</li></ol>" : "</li></ul>";
        }
      };

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code block begin: #+begin_src bash or #+begin_example
        let srcStart = line.match(/^\s*#\+begin_src(?:\s+([a-zA-Z0-9_-]+))?/i);
        let exStart = line.match(/^\s*#\+begin_example/i);
        if (srcStart || exStart) {
          if (inTable) { html += renderTable(tableRows); tableRows = []; inTable = false; }
          if (inColonBlock) {
            html += generateCodeBlockHTML("plaintext", colonBuffer.join('\n'));
            inColonBlock = false;
            colonBuffer = [];
          }
          inCodeBlock = true;
          codeLang = srcStart && srcStart[1] ? srcStart[1].toLowerCase() : "plaintext";
          codeBuffer = [];
          continue;
        }

        // Code block end: #+end_src or #+end_example
        if (line.match(/^\s*#\+end_src/i) || line.match(/^\s*#\+end_example/i)) {
          inCodeBlock = false;
          let rawCode = codeBuffer.join('\n');
          html += generateCodeBlockHTML(codeLang, rawCode);
          codeBuffer = [];
          continue;
        }

        if (inCodeBlock) {
          codeBuffer.push(line);
          continue;
        }

        // #+RESULTS:
        if (line.trim().match(/^#\+RESULTS:/i)) {
          if (inTable) { html += renderTable(tableRows); tableRows = []; inTable = false; }
          if (inColonBlock) {
            html += generateCodeBlockHTML("plaintext", colonBuffer.join('\n'));
            inColonBlock = false;
            colonBuffer = [];
          }
          html += `<div class="org-results-label">#+RESULTS:</div>`;
          continue;
        }

        // Colon blocks (literal lines)
        let colonMatch = line.match(/^\s*:\s?(.*)$/);
        if (colonMatch) {
          if (!inColonBlock) {
            if (inTable) { html += renderTable(tableRows); tableRows = []; inTable = false; }
            inColonBlock = true;
          }
          colonBuffer.push(colonMatch[1] !== undefined ? colonMatch[1] : "");
          continue;
        } else if (inColonBlock) {
          // Break colon block on any non-colon line
          html += generateCodeBlockHTML("plaintext", colonBuffer.join('\n'));
          inColonBlock = false;
          colonBuffer = [];
        }

        // Tables in org-mode: | col1 | col2 |
        if (line.trim().startsWith('|')) {
          closeList();
          if (!/^\|[-+ ]+\|$/.test(line.trim())) { // skip separator lines |---+---|
            tableRows.push(line);
          }
          inTable = true;
          continue;
        } else if (inTable) {
          html += renderTable(tableRows);
          tableRows = [];
          inTable = false;
        }

        // List items: numbered (1. or 1)) or bullets (- or + or indented *)
        let numMatch = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
        let bulletMatch = line.match(/^(\s*)([-+])\s+(.*)$/) || line.match(/^(\s{2,})\*\s+(.*)$/);

        if (numMatch || bulletMatch) {
          const currentIndent = (numMatch || bulletMatch)[1].length;
          const itemType = numMatch ? 'ol' : 'ul';
          const itemNum = numMatch ? parseInt(numMatch[2], 10) : null;
          const itemContent = numMatch ? numMatch[3] : bulletMatch[3];

          if (listStack.length === 0) {
            if (itemType === 'ol') {
              html += `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>`;
            } else {
              html += `<ul class="ppt-list">`;
            }
            listStack.push({ type: itemType, indent: currentIndent });
            html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
          } else {
            const top = listStack[listStack.length - 1];

            if (currentIndent > top.indent) {
              // Indented nested list inside the current <li>
              if (itemType === 'ol') {
                html += `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>`;
              } else {
                html += `<ul class="ppt-list">`;
              }
              listStack.push({ type: itemType, indent: currentIndent });
              html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
            } else if (currentIndent < top.indent) {
              // Un-indent: close nested lists until reaching currentIndent or lower
              while (listStack.length > 0 && listStack[listStack.length - 1].indent > currentIndent) {
                const popped = listStack.pop();
                html += popped.type === 'ol' ? "</li></ol>" : "</li></ul>";
              }

              if (listStack.length > 0 && listStack[listStack.length - 1].indent === currentIndent) {
                const currentTop = listStack[listStack.length - 1];
                if (currentTop.type === itemType) {
                  html += `</li><li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
                } else {
                  const popped = listStack.pop();
                  html += popped.type === 'ol' ? "</li></ol>" : "</li></ul>";
                  if (itemType === 'ol') {
                    html += `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>`;
                  } else {
                    html += `<ul class="ppt-list">`;
                  }
                  listStack.push({ type: itemType, indent: currentIndent });
                  html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
                }
              } else {
                if (itemType === 'ol') {
                  html += `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>`;
                } else {
                  html += `<ul class="ppt-list">`;
                }
                listStack.push({ type: itemType, indent: currentIndent });
                html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
              }
            } else {
              // Same indent
              if (top.type === itemType) {
                html += `</li><li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
              } else {
                const popped = listStack.pop();
                html += popped.type === 'ol' ? "</li></ol>" : "</li></ul>";
                if (itemType === 'ol') {
                  html += `<ol class="ppt-list"${itemNum !== null ? ` start="${itemNum}"` : ''}>`;
                } else {
                  html += `<ul class="ppt-list">`;
                }
                listStack.push({ type: itemType, indent: currentIndent });
                html += `<li${itemNum !== null ? ` value="${itemNum}"` : ''}>${formatInlineOrg(itemContent)}`;
              }
            }
          }
          continue;
        }

        // Blank lines
        if (line.trim().length === 0) {
          continue;
        }

        // If it's a regular text line, and we are in a list, check indentation
        if (listStack.length > 0) {
           if (line.match(/^\s+/)) {
             html += `<p>${formatInlineOrg(line.trim())}</p>`;
             continue;
           } else {
             closeList();
           }
        }

        html += `<p>${formatInlineOrg(line)}</p>`;
      }

      if (inTable) html += renderTable(tableRows);
      
      if (inColonBlock && colonBuffer.length > 0) {
        html += generateCodeBlockHTML("plaintext", colonBuffer.join('\n'));
      }
      closeList();

      return html;
    }

    function renderTable(rows) {
      if (rows.length === 0) return "";
      let html = `<table class="ppt-table">`;
      for (let i = 0; i < rows.length; i++) {
        let rowLine = rows[i];
        // Protect escaped pipes \| and pipes inside =...=, ==...==, ~...~, ~~...~~, or `...`
        rowLine = rowLine.replace(/\\\|/g, '\x01PIPE\x01');
        rowLine = rowLine.replace(/(`+|~+|=+)([\s\S]*?)\1/g, (m) => m.replace(/\|/g, '\x01PIPE\x01'));

        let cols = rowLine.split('|').map(c => c.replace(/\x01PIPE\x01/g, '|').trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        let tag = (i === 0) ? 'th' : 'td';
        html += "<tr>";
        cols.forEach(col => {
          html += `<${tag}>${formatInlineOrg(col)}</${tag}>`;
        });
        html += "</tr>";
      }
      html += `</table>`;
      return html;
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

    function formatInlineOrg(str) {
      if (!str) return '';

      // 1. Stash all inline code blocks (=code=, ==code==, ~code~, ~~code~~, or `code`) so their contents are never parsed as images, links, or bold!
      const codeStash = [];
      str = str.replace(/(=+|~+|`+)([^\s\n\r](?:[\s\S]*?[^\s\n\r])?)\1/g, (match, delimiter, codeContent) => {
        const placeholder = `\x01ORGX${codeStash.length}\x02`;
        codeStash.push(`<code>${escapeHtml(codeContent)}</code>`);
        return placeholder;
      });

      // 2. Format *bold*
      str = str.replace(/\*([^*\n\r]+)\*/g, '<strong>$1</strong>');

      // 3. [[url][text]] or [[url][image_url]] -> link
      str = str.replace(/\[\[([^\]]+)\]\[([^\]]+)\]\]/g, (match, href, content) => {
        const trimmed = content.trim();
        if (isImageSource(trimmed)) {
          const isAvatar = trimmed.includes('avatars.githubusercontent.com');
          if (isAvatar) {
            return `<div class="developer-avatar-container" style="float: left; margin: 0.3rem 2.2rem 1.2rem 0;"><a href="${href}" target="_blank" title="Click to view Cisco Ramon on GitHub" class="developer-avatar-link"><img src="${trimmed}" alt="Cisco Ramon" class="developer-avatar-img" style="width: 150px; height: 150px; border-radius: 50%; box-shadow: 0 6px 20px rgba(0,0,0,0.22); transition: transform 0.2s; border: 3.5px solid var(--primary); display: block;" onmouseover="this.style.transform='scale(1.06)';" onmouseout="this.style.transform='scale(1)';" /></a></div>`;
          }
          return `<a href="${href}" target="_blank" title="Open ${href}" style="display: inline-block; cursor: pointer; text-decoration: none; margin: 0.3rem;"><img src="${trimmed}" alt="Link" style="vertical-align: middle; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.12); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';" /></a>`;
        }
        return `<a href="${href}" target="_blank" style="color: var(--secondary);">${content}</a>`;
      });
      // [[url]] -> image or link
      str = str.replace(/\[\[([^\]]+)\]\]/g, (match, url) => {
        const cleanUrl = url.trim();
        if (!isImageSource(cleanUrl)) {
          return `<a href="${cleanUrl}" target="_blank" style="color: var(--secondary);">${cleanUrl}</a>`;
        }

        let src = cleanUrl;
        let originalUrl = cleanUrl;
        
        if (src.toLowerCase().startsWith('file:')) {
            src = src.substring(5);
        }
        
        // Expansion for local paths
        if (src.startsWith('~/')) {
            src = '/home/cisco581b/' + src.substring(2);
        }
        if (src.startsWith('/')) {
            src = 'file://' + src;
        }

        const filename = originalUrl.split('/').pop().split('?')[0].split('#')[0];
        
        // 1. Check window.ImageOverrides (supports originalUrl, clean path, or filename)
        if (window.ImageOverrides) {
          if (window.ImageOverrides[originalUrl]) {
            src = window.ImageOverrides[originalUrl];
          } else if (window.ImageOverrides[src]) {
            src = window.ImageOverrides[src];
          } else if (filename && window.ImageOverrides[filename]) {
            src = window.ImageOverrides[filename];
          }
        }
        
        // 2. Check window.LocalFolderImages if not an overridden data: or web URL
        if (!src.startsWith('data:') && !src.startsWith('http://') && !src.startsWith('https://')) {
          if (window.LocalFolderImages) {
            const blob = window.LocalFolderImages[originalUrl] || 
                         window.LocalFolderImages[src] || 
                         (filename ? window.LocalFolderImages[filename] : null);
            if (blob && !src.startsWith('blob:')) {
              src = URL.createObjectURL(blob);
            }
          }
        }
                        
        // Treat confirmed image [[url]] tags as images with interactive container
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
            <button onclick="window.Interact.enableFreeMode(this)" title="Free Move / 8-Way Resize">
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
            <button onclick="window.ImageManager.removeOverride('${escapeHtml(originalUrl)}', this)" title="Reset Image Override" style="color: var(--accent);">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <img src="${src}" alt="${escapeHtml(url)}" data-original-url="${escapeHtml(originalUrl)}" class="org-image" referrerpolicy="no-referrer" />
          <div class="inline-resize-handle" title="Drag to resize"></div>
        </div>`;
      });

      // 4. Restore stashed inline code blocks safely!
      str = str.replace(/\x01ORGX(\d+)\x02/g, (match, index) => {
        return codeStash[parseInt(index, 10)] || '';
      });

      return str;
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    // Render slides into the PowerPoint container and apply syntax highlighting
    function renderDeck(slideData) {
      const returnBtn = document.getElementById('returnToSlidesBtn');
      if (returnBtn) returnBtn.style.display = 'inline-block';
      window.globalSlideData = slideData; // Expose for tree_view.js
      document.getElementById('landingPage').style.display = ''; document.getElementById('landingPage').classList.remove('active');
      document.querySelector('.top-controls').style.display = 'flex';
      deckContainer.style.display = 'flex';

      deckContainer.innerHTML = '';
      const total = slideData.length;

      slideData.forEach((s, idx) => {
        const slideEl = document.createElement('div');
        slideEl.className = `slide ${idx === 0 ? 'active' : ''}`;
        slideEl.setAttribute('data-index', idx + 1);

        let breadcrumbHtml = "";
        if (s.breadcrumbs && s.breadcrumbs.length > 0) {
          breadcrumbHtml = s.breadcrumbs.map((crumb, i) => {
            let isLast = (i === s.breadcrumbs.length - 1);
            let btn = `<button class="breadcrumb-btn" onclick="updateSlide(${crumb.index})" title="${escapeHtml(crumb.title)}">${escapeHtml(crumb.title)}</button>`;
            if (!isLast) {
              return btn + ` <span class="breadcrumb-separator">❯</span> `;
            }
            return btn;
          }).join('');
        }

        const footerHtml = `
          <div class="slide-footer">
            <div class="footer-social-links">
              ${window.generateSocialLinksHtml ? window.generateSocialLinksHtml() : ''}
            </div>
            <div class="footer-right">
              <button class="footer-btn" onclick="loadManual()" title="OrgSlide Documentation">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </button>
              <button class="footer-btn" onclick="toggleHelp()" title="Keyboard Shortcuts (Alt+?)">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
              <span class="slide-counter" onclick="window.openGoToSlideModal()" title="Go to slide (Alt+G)">Slide ${idx + 1} of ${total}</span>
              <div class="footer-nav">
                <button class="footer-btn" onclick="prev()" title="Previous Slide (Alt+K)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="footer-btn" onclick="next()" title="Next Slide (Alt+J)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        `;

        if (s.isTitle) {
          slideEl.innerHTML = `
            <div class="slide-breadcrumbs" style="position: absolute; top: 1.5rem; left: 1.5rem;">${breadcrumbHtml}</div>
            <div class="title-center">
              <h1 class="main-title">${s.title}</h1>
              ${s.subtitle ? `<h2 class="main-subtitle">${s.subtitle}</h2>` : ''}
              ${s.meta ? `<div class="main-meta">${s.meta}</div>` : ''}
            </div>
            ${footerHtml}
          `;
        } else {
          slideEl.innerHTML = `
            <div class="slide-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div style="flex: 1;">
                <div class="slide-breadcrumbs">${breadcrumbHtml}</div>
                <h2 class="slide-title">${escapeHtml(s.title)}</h2>
              </div>
              <div class="slide-header-logos" style="display: flex; gap: 1rem; align-items: center; justify-content: flex-end; height: 55px;"></div>
            </div>
            <div class="slide-body">
              ${s.body}
            </div>
            ${footerHtml}
          `;
        }

        deckContainer.appendChild(slideEl);
      });

      // Apply Highlight.js syntax highlighting to all code blocks!
      if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }

      if (window.EndSlide) {
        window.EndSlide.appendSlide(deckContainer);
      }

      slides = document.querySelectorAll('.slide');

      // 1. Determine starting slide before calling updateSlide so hash is never clobbered
      let initialSlide = 0;
      const initialHash = window.location.hash.replace('#', '');
      const parsedHash = parseInt(initialHash, 10);
      let savedSlide = NaN;
      try {
        savedSlide = parseInt(sessionStorage.getItem('orgSlide_currentSlide') || localStorage.getItem('orgSlide_currentSlide'), 10);
      } catch(e) {}

      if (!isNaN(parsedHash) && parsedHash >= 1 && parsedHash <= slides.length) {
        initialSlide = parsedHash - 1;
      } else if (!isNaN(savedSlide) && savedSlide >= 0 && savedSlide < slides.length) {
        initialSlide = savedSlide;
      }

      currentSlide = initialSlide;
      window.currentSlide = initialSlide;
      updateSlide(initialSlide);

      if (window.LogoManager) {
        window.LogoManager.applyLogos();
      }
      
      if (window.ImageManager && window.ImageManager.restoreLayouts) {
        window.ImageManager.restoreLayouts();
      }
      if (window.restoreCodeFonts) {
        window.restoreCodeFonts();
      }
    }

    function updateSlide(index) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;

      slides.forEach((s, idx) => {
        if (idx === index) {
          s.classList.add('active');
          s.scrollTop = 0;
        } else {
          s.classList.remove('active');
        }
      });

      currentSlide = index;
      window.currentSlide = index;
      window.updateSlide = updateSlide;
      
      const newHash = `#${currentSlide + 1}`;
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
      try {
        sessionStorage.setItem('orgSlide_currentSlide', index);
        localStorage.setItem('orgSlide_currentSlide', index);
      } catch(e) {}
    }

    function next() {
      let nextIndex = currentSlide + 1;
      while (nextIndex < slides.length && slides[nextIndex].classList.contains('hidden-slide')) {
         nextIndex++;
      }
      if (nextIndex < slides.length) updateSlide(nextIndex);
    }

    function prev() {
      let prevIndex = currentSlide - 1;
      while (prevIndex >= 0 && slides[prevIndex].classList.contains('hidden-slide')) {
         prevIndex--;
      }
      if (prevIndex >= 0) updateSlide(prevIndex);
    }

    function toggleHelp() {
      const helpModal = document.getElementById('helpModal');
      if (helpModal) {
        helpModal.classList.toggle('active');
      }
    }

    // Keyboard navigation
    const handleKeyNav = (e) => {
      // Don't trigger slide change if user is typing or interacting with UI
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = (e.key || '').toLowerCase();
      
      // Global +/-/0 for Zooming (TOC or Code Blocks)
      if (key === '=' || key === '+' || key === '-' || key === '0') {
        const treeModal = document.getElementById('treeModal');
        if (window.treeView && treeModal && treeModal.classList.contains('active')) {
          e.preventDefault();
          if (key === '=' || key === '+') window.treeView.zoomIn();
          else if (key === '-') window.treeView.zoomOut();
          else if (key === '0') window.treeView.fitZoom();
          return;
        } else {
          // ONLY resize code block if it is fullscreen, otherwise let browser handle default zooming
          const fullscreenCode = document.querySelector('.code-block-container.fullscreen');
          if (fullscreenCode) {
            e.preventDefault();
            handleGlobalCodeResize(key);
            return;
          }
        }
      }

      // Handle Help Toggle (Alt + ? or Alt + /)
      if (e.altKey && (key === '?' || key === '/' || e.code === 'Slash')) {
        e.preventDefault();
        e.stopPropagation();
        toggleHelp();
        return;
      }

      // Handle Tree View / TOC Toggle (Alt + .)
      if (e.altKey && (key === '.' || e.code === 'Period')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.treeView) {
          window.treeView.show(window.globalSlideData, (index) => updateSlide(index), currentSlide);
        }
        return;
      }

      // Handle Go To Page (Alt + G)
      if (e.altKey && (key === 'g' || e.code === 'KeyG')) {
        e.preventDefault();
        e.stopPropagation();
        window.openGoToSlideModal();
        return;
      }

      // Handle Edit Social Links (Alt + E)
      if (e.altKey && (key === 'e' || e.code === 'KeyE')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.socialLinksEditor) window.socialLinksEditor.open();
        return;
      }

      // Allow default browser shortcuts (Ctrl, Meta), but we need to intercept Alt if it's Alt+J or Alt+K
      if (e.ctrlKey || e.metaKey) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowDown' || (e.altKey && (key === 'j' || e.code === 'KeyJ'))) {
        e.preventDefault();
        e.stopPropagation();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'ArrowUp' || (e.altKey && (key === 'k' || e.code === 'KeyK'))) {
        e.preventDefault();
        e.stopPropagation();
        prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        updateSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        updateSlide(slides.length - 1);
      } else if (e.key === 'Escape') {
        const goToModal = document.getElementById('goToSlideModal');
        if (goToModal && goToModal.classList.contains('active')) {
          e.preventDefault();
          window.closeGoToSlideModal();
          return;
        }

        const helpModal = document.getElementById('helpModal');
        if (helpModal && helpModal.classList.contains('active')) {
          e.preventDefault();
          toggleHelp();
          return;
        }

        // Exit fullscreen code blocks on Escape
        const fullscreenBtn = document.querySelector('.code-block-container.fullscreen .fullscreen-btn');
        if (fullscreenBtn) {
          toggleFullscreenCode(fullscreenBtn);
        }
      }
    };

    window.openGoToSlideModal = function() {
      const modal = document.getElementById('goToSlideModal');
      if (!modal) return;
      const maxSpan = document.getElementById('goToMaxSlide');
      const input = document.getElementById('goToSlideInput');
      const total = slides && slides.length > 0 ? slides.length : 1;
      if (maxSpan) maxSpan.textContent = total;
      if (input) {
        input.max = total;
        input.value = currentSlide + 1;
      }
      modal.classList.add('active');
      setTimeout(() => {
        if (input) {
          input.focus();
          input.select();
        }
      }, 50);
    };

    window.closeGoToSlideModal = function() {
      const modal = document.getElementById('goToSlideModal');
      if (modal) modal.classList.remove('active');
    };

    window.submitGoToSlide = function() {
      const input = document.getElementById('goToSlideInput');
      if (!input) return;
      const val = parseInt(input.value, 10);
      const total = slides && slides.length > 0 ? slides.length : 1;
      if (!isNaN(val) && val >= 1 && val <= total) {
        updateSlide(val - 1);
        window.closeGoToSlideModal();
      } else {
        input.focus();
        input.select();
      }
    };

    function toggleTheme() {
      const isDark = document.body.classList.toggle('theme-dark');
      sessionStorage.setItem('orgSlide_theme', isDark ? 'dark' : 'light');
    }

    function togglePageFullscreen() {
      const doc = window.document;
      const docEl = doc.documentElement;
      
      const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      const cancelFullScreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      
      const isFullScreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

      if (!isFullScreen) {
        if (requestFullScreen) {
          requestFullScreen.call(docEl);
        }
      } else {
        if (cancelFullScreen) {
          cancelFullScreen.call(doc);
        }
      }
      setTimeout(updateFullscreenBtn, 300); // fallback update
    }

    document.addEventListener("fullscreenchange", updateFullscreenBtn);
    document.addEventListener("webkitfullscreenchange", updateFullscreenBtn);
    document.addEventListener("mozfullscreenchange", updateFullscreenBtn);
    document.addEventListener("MSFullscreenChange", updateFullscreenBtn);

    function updateFullscreenBtn() {
      const btn = document.getElementById('btn-page-fullscreen');
      if (!btn) return;
      const expand = btn.querySelector('.icon-expand-page');
      const collapse = btn.querySelector('.icon-collapse-page');
      const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (isFullScreen) {
        expand.style.display = 'none';
        collapse.style.display = 'block';
        btn.setAttribute('title', 'Exit Fullscreen');
      } else {
        expand.style.display = 'block';
        collapse.style.display = 'none';
        btn.setAttribute('title', 'Toggle Fullscreen');
      }
    }

    // Use standard bubbling so we don't interfere with extensions when they process normal keys
    window.addEventListener('keydown', handleKeyNav);

    // Folder Upload Handler (Delegates to FolderManager)
    const folderInput = document.getElementById('folderInput');
    if (folderInput) {
      folderInput.addEventListener('change', function(e) {
        if (window.FolderManager) {
          window.FolderManager.handleUpload(e);
        }
      });
    }

    // Reset document presentation state on new upload (starts from first slide, clears stale image overrides/layouts)
    window.resetPresentationState = function() {
      try {
        sessionStorage.removeItem('orgSlide_currentSlide');
        localStorage.removeItem('orgSlide_currentSlide');
      } catch(e) {}
      window.location.hash = '#1';
      currentSlide = 0;
      window.currentSlide = 0;

      // Clear image layouts & stale link overrides for the previous presentation
      try {
        sessionStorage.removeItem('orgSlide_imageLayouts');
        localStorage.removeItem('orgSlide_imageLayouts');
      } catch(e) {}

      window.ImageOverrides = {};
      try {
        sessionStorage.removeItem('orgSlide_imageOverrides');
        localStorage.removeItem('orgSlide_imageOverrides');
      } catch(e) {}

      if (window.FolderManager && window.FolderManager.db) {
        try {
          const tx = window.FolderManager.db.transaction('imageOverrides', 'readwrite');
          tx.objectStore('imageOverrides').clear();
        } catch(e) {}
      }

      try {
        sessionStorage.removeItem('orgSlide_codeFonts');
        localStorage.removeItem('orgSlide_codeFonts');
      } catch(e) {}
    };

    // File Upload Handler (Parses any uploaded .org or .txt file)
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result;
        
        // Fresh upload: reset to slide 1 and clear previous document state
        if (window.resetPresentationState) {
          window.resetPresentationState();
        }

        try {
          sessionStorage.setItem('orgSlide_savedText', text);
          localStorage.setItem('orgSlide_savedText', text);
        } catch(err) {}

        if (window.RecentDocs) {
          window.RecentDocs.addDoc(file.name, text);
        }

        const parsedSlides = parseOrgMode(text);
        renderDeck(parsedSlides);
      };
      reader.readAsText(file);
      fileInput.value = ''; // Ensure re-uploading the same file triggers change
    });

    // Support drag and drop of any .org file onto the window
    window.addEventListener('dragover', (e) => { e.preventDefault(); });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = function(evt) {
          const text = evt.target.result;

          if (window.resetPresentationState) {
            window.resetPresentationState();
          }

          try {
            sessionStorage.setItem('orgSlide_savedText', text);
            localStorage.setItem('orgSlide_savedText', text);
          } catch(err) {}

          if (window.RecentDocs) {
            window.RecentDocs.addDoc(file.name, text);
          }

          const parsedSlides = parseOrgMode(text);
          renderDeck(parsedSlides);
        };
        reader.readAsText(file);
      }
    });

    // Auto-load on refresh
    window.addEventListener('DOMContentLoaded', async () => {
      const savedTheme = sessionStorage.getItem('orgSlide_theme') || localStorage.getItem('orgSlide_theme');
      if (savedTheme === 'dark') {
        document.body.classList.add('theme-dark');
      } else if (savedTheme === 'light') {
        document.body.classList.remove('theme-dark');
      }

      // Wait for FolderManager and DB overrides to load before rendering!
      if (window.FolderManager && window.FolderManager.init) {
        try {
          await window.FolderManager.init();
        } catch(e) {
          console.error("FolderManager init error:", e);
        }
      }

      const savedText = sessionStorage.getItem('orgSlide_savedText') || localStorage.getItem('orgSlide_savedText');
      if (savedText) {
        const parsedSlides = parseOrgMode(savedText);
        renderDeck(parsedSlides);
      }

      if (window.RecentDocs) {
        window.RecentDocs.render();
      }
    });

    window.addEventListener('load', () => {
      handleHash();
    });

    window.addEventListener('hashchange', () => {
      handleHash();
    });

    function handleHash() {
      const hash = window.location.hash.replace('#', '');
      const parsed = parseInt(hash, 10);
      if (!isNaN(parsed) && parsed >= 1 && slides && slides.length > 0 && parsed <= slides.length) {
        if (currentSlide !== (parsed - 1)) {
          updateSlide(parsed - 1);
        }
      }
    }

// Export Hook
window.setExportedCurrentSlide = function(idx) {
  currentSlide = idx;
};

    window.loadManual = async function() {
      try {
        const response = await fetch('manual.org');
        if (!response.ok) throw new Error("Failed to load manual.org");
        const text = await response.text();
        
        // Hide landing page if active
        document.getElementById('landingPage').classList.remove('active');
        
        // Ensure standard theme defaults for manual
        document.body.className = '';
        document.body.classList.add('theme-light');
        document.body.classList.add('render-mode-slide');
        
        if (window.resetPresentationState) {
          window.resetPresentationState();
        }
        try {
          sessionStorage.setItem('orgSlide_savedText', text);
          localStorage.setItem('orgSlide_savedText', text);
        } catch(e) {}

        if (window.RecentDocs) {
          window.RecentDocs.addDoc("manual.org", text);
        }

        const slidesData = parseOrgMode(text);
        window.globalSlideData = slidesData;
        renderDeck(slidesData);
      } catch (err) {
        alert("Error loading the manual: " + err.message);
      }
    };

    window.clearSession = function() {
      try {
        sessionStorage.clear();
        localStorage.removeItem('orgSlide_savedText');
        localStorage.removeItem('orgSlide_currentSlide');
        if (window.location.hash) {
          history.replaceState(null, null, window.location.pathname + window.location.search);
        }
        const returnBtn = document.getElementById('returnToSlidesBtn');
        if (returnBtn) returnBtn.style.display = 'none';
        alert('Session cleared! Refreshing will start on the main menu.');
      } catch (err) {
        console.error('Error clearing session:', err);
      }
    };
