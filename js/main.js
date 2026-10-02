let slides = [];
    let currentSlide = 0;
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
    }

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
      
      if (isFullscreen) {
        iconExpand.style.display = 'none';
        iconCollapse.style.display = 'block';
        btn.setAttribute('title', 'Exit Fullscreen');
      } else {
        iconExpand.style.display = 'block';
        iconCollapse.style.display = 'none';
        btn.setAttribute('title', 'Toggle Fullscreen');
      }
    }

    // Wrap raw code string with UI actions
    function generateCodeBlockHTML(codeLang, rawCode) {
      return `
        <div class="code-block-container">
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
      let inList = false;
      let inTable = false;
      let tableRows = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code block begin: #+begin_src bash or #+begin_example
        let srcStart = line.match(/^#\+begin_src(?:\s+([a-zA-Z0-9_-]+))?/i);
        let exStart = line.match(/^#\+begin_example/i);
        if (srcStart || exStart) {
          if (inList) { html += "</ul>"; inList = false; }
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
        if (line.match(/^#\+end_src/i) || line.match(/^#\+end_example/i)) {
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
          if (inList) { html += "</ul>"; inList = false; }
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
        let colonMatch = line.match(/^:\s?(.*)$/);
        if (colonMatch) {
          if (!inColonBlock) {
            if (inList) { html += "</ul>"; inList = false; }
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
          if (inList) { html += "</ul>"; inList = false; }
          if (!line.includes('---')) { // skip separator lines |---+---|
            tableRows.push(line);
          }
          inTable = true;
          continue;
        } else if (inTable) {
          html += renderTable(tableRows);
          tableRows = [];
          inTable = false;
        }

        // Bullet lists: - item or + item
        let listMatch = line.match(/^\s*[-+]\s+(.*)$/);
        if (listMatch) {
          if (!inList) {
            html += `<ul class="ppt-list">`;
            inList = true;
          }
          html += `<li>${formatInlineOrg(listMatch[1])}</li>`;
          continue;
        }

        // Numbered lists: 1. item
        let numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
        if (numMatch) {
          if (!inList) {
            html += `<ol class="ppt-list">`;
            inList = true;
          }
          html += `<li>${formatInlineOrg(numMatch[2])}</li>`;
          continue;
        }

        // End of list if blank line
        if (inList && line.trim() === '') {
          html += inList === 'ol' ? `</ol>` : `</ul>`;
          inList = false;
        }

        if (line.trim().length > 0) {
          html += `<p>${formatInlineOrg(line)}</p>`;
        }
      }

      if (inList) html += "</ul>";
      if (inTable) html += renderTable(tableRows);
      
      // If a colon block was open at end of section, close it
      if (inColonBlock && colonBuffer.length > 0) {
        html += generateCodeBlockHTML("plaintext", colonBuffer.join('\n'));
      }

      // If a code block wasn't explicitly closed at end of section, close it
      if (inCodeBlock && codeBuffer.length > 0) {
        html += generateCodeBlockHTML(codeLang, codeBuffer.join('\n'));
      }

      return html;
    }

    function renderTable(rows) {
      if (rows.length === 0) return "";
      let html = `<table class="ppt-table">`;
      for (let i = 0; i < rows.length; i++) {
        let cols = rows[i].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
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

    function formatInlineOrg(str) {
      // *bold* -> <strong>
      str = str.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>');
      // =code= or ~code~ -> <code>
      str = str.replace(/[=~]([^=~]+)[=~]/g, '<code>$1</code>');
      // [[url][text]] -> link
      str = str.replace(/\[\[([^\]]+)\]\[([^\]]+)\]\]/g, '<a href="$1" target="_blank" style="color: var(--secondary);">$2</a>');
      // [[url]] -> link
      str = str.replace(/\[\[([^\]]+)\]\]/g, '<a href="$1" target="_blank" style="color: var(--secondary);">$1</a>');
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
      window.globalSlideData = slideData; // Expose for tree_view.js
      document.getElementById('landingPage').style.display = 'none';
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
              <button type="button" class="help-hint-inline" onclick="toggleHelp()" title="Keyboard Shortcuts">
                <kbd>Alt</kbd> + <kbd>?</kbd>
              </button>
              <span class="slide-counter">Slide ${idx + 1} of ${total}</span>
              <div class="footer-nav">
                <button class="footer-nav-btn" onclick="prev()" title="Previous Slide (Alt+K)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="footer-nav-btn" onclick="next()" title="Next Slide (Alt+J)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
      currentSlide = 0;
      updateSlide(0);

      if (window.LogoManager) {
        window.LogoManager.applyLogos();
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
      window.location.hash = `#${currentSlide + 1}`;
    }

    function next() {
      if (currentSlide < slides.length - 1) updateSlide(currentSlide + 1);
    }

    function prev() {
      if (currentSlide > 0) updateSlide(currentSlide - 1);
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
        const target = prompt(`Enter slide number (1 - ${slides.length}):`);
        if (target) {
          const pageNum = parseInt(target, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= slides.length) {
            updateSlide(pageNum - 1);
          } else {
            alert(`Invalid slide number. Please enter a number between 1 and ${slides.length}.`);
          }
        }
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

    // File Upload Handler (Parses any uploaded .org or .txt file)
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result;
        sessionStorage.setItem('orgSlide_savedText', text);
        const parsedSlides = parseOrgMode(text);
        renderDeck(parsedSlides);
      };
      reader.readAsText(file);
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
          sessionStorage.setItem('orgSlide_savedText', text);
          const parsedSlides = parseOrgMode(text);
          renderDeck(parsedSlides);
        };
        reader.readAsText(file);
      }
    });

    // Auto-load on refresh
    window.addEventListener('DOMContentLoaded', () => {
      if (sessionStorage.getItem('orgSlide_theme') === 'dark') {
        document.body.classList.add('theme-dark');
      } else if (sessionStorage.getItem('orgSlide_theme') === 'light') {
        document.body.classList.remove('theme-dark');
      }

      const savedText = sessionStorage.getItem('orgSlide_savedText');
      if (savedText) {
        const parsedSlides = parseOrgMode(savedText);
        renderDeck(parsedSlides);
      }
    });

    window.addEventListener('load', () => {
      handleHash();
    });

    function handleHash() {
      const hash = window.location.hash.replace('#', '');
      const parsed = parseInt(hash, 10);
      if (!isNaN(parsed) && parsed >= 1 && slides.length > 0 && parsed <= slides.length) {
        updateSlide(parsed - 1);
      }
    }
