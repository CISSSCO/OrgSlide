/**
 * OrgSlide - Markdown Integration Engine
 * Connects markdown parsing seamlessly into OrgSlide's workflow
 * Guarantees zero disruption to existing Org-mode processing
 */
(function() {
  'use strict';

  // Helper: Detect whether content or filename is Markdown
  function isMarkdownContent(text, filename) {
    if (filename) {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.md') || lower.endsWith('.markdown')) return true;
      if (lower.endsWith('.org')) return false;
    }
    if (!text || typeof text !== 'string') return false;

    // Check for explicit Org-mode directives first (#+TITLE, #+BEGIN_SRC, :PROPERTIES:, etc.)
    const hasOrgDirectives = /^#\+[A-Za-z0-9_-]+:/m.test(text) || /^\s*:PROPERTIES:/im.test(text);
    if (hasOrgDirectives) return false;

    // Check for Markdown frontmatter
    const hasFrontmatter = /^---\r?\n[\s\S]*?\r?\n---/m.test(text);
    if (hasFrontmatter) return true;

    // Check for Markdown headings (# Heading, ## Heading) or fenced code blocks
    const hasMdHeadings = /^#{1,4}\s+[^\s#]/m.test(text);
    const hasFencedCode = /^```[a-zA-Z0-9_-]*\r?\n/m.test(text);

    if (hasMdHeadings || hasFencedCode) return true;

    return false;
  }

  // Unified parser dispatcher
  function parsePresentationDocument(text, filename) {
    if (isMarkdownContent(text, filename) && window.parseMarkdown) {
      return window.parseMarkdown(text);
    }
    if (window.parseOrgModeOriginal) {
      return window.parseOrgModeOriginal(text);
    }
    if (window.parseOrgMode) {
      return window.parseOrgMode(text);
    }
    return [];
  }

  // Expose to window
  window.isMarkdownContent = isMarkdownContent;
  window.parsePresentationDocument = parsePresentationDocument;

  // Helper to load sample markdown presentation
  window.loadMarkdownSample = async function() {
    try {
      let text = null;

      // Candidate locations to fetch from
      const candidates = [
        'sample.md',
        './sample.md',
        (typeof window !== 'undefined' && window.location && window.location.pathname) ? (window.location.pathname.replace(/\/[^/]*$/, '') + '/sample.md') : null,
        'https://raw.githubusercontent.com/CISSSCO/OrgSlide/bugFixes/sample.md',
        'https://raw.githubusercontent.com/CISSSCO/OrgSlide/master/sample.md'
      ].filter(Boolean);

      for (const url of candidates) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const candidateText = await response.text();
            // Verify it is actual Markdown content and not an HTML 404 error page
            if (candidateText && !candidateText.trim().toLowerCase().startsWith('<!doctype html>') && !candidateText.trim().startsWith('<html')) {
              text = candidateText;
              break;
            }
          }
        } catch (e) {
          // ignore network error and try next candidate
        }
      }

      // If network fetch fails (e.g. GitHub Pages Jekyll 404 or offline), fall back to embedded sample content
      if (!text && window.EMBEDDED_SAMPLE_MD) {
        text = window.EMBEDDED_SAMPLE_MD;
      }

      if (!text) {
        throw new Error("Failed to load sample.md from server or local sources");
      }

      const landing = document.getElementById('landingPage');
      if (landing) {
        landing.classList.remove('active');
        landing.style.display = '';
      }

      document.body.className = '';
      document.body.classList.add('theme-light');
      document.body.classList.add('render-mode-slide');

      if (window.resetPresentationState) {
        window.resetPresentationState();
      }
      try {
        sessionStorage.setItem('orgSlide_savedText', text);
        localStorage.setItem('orgSlide_savedText', text);
      } catch (e) {}

      if (window.RecentDocs) {
        window.RecentDocs.addDoc("sample.md", text);
      }

      const slidesData = window.parseMarkdown(text);
      window.globalSlideData = slidesData;
      if (window.renderDeck) {
        window.renderDeck(slidesData);
      }
    } catch (err) {
      alert("Error loading sample markdown: " + err.message);
    }
  };

  // Initialize hooks once DOM is loaded or script runs
  function initMarkdownIntegration() {
    // 1. Wrap window.parseOrgMode cleanly so all existing callers (recent_docs, folder_manager, auto-restore) work automatically
    if (window.parseOrgMode && !window.parseOrgModeOriginal) {
      window.parseOrgModeOriginal = window.parseOrgMode;
      window.parseOrgMode = function(text, filename) {
        if (isMarkdownContent(text, filename) && window.parseMarkdown) {
          return window.parseMarkdown(text);
        }
        return window.parseOrgModeOriginal(text);
      };
    }

    // 1b. Wrap window.renderDeck to ensure KaTeX math formulas are rendered
    if (window.renderDeck && !window.renderDeckOriginal) {
      window.renderDeckOriginal = window.renderDeck;
      window.renderDeck = function(slideData) {
        window.renderDeckOriginal(slideData);
        if (window.katex) {
          const mathEls = document.querySelectorAll('.math-display, .math-inline');
          mathEls.forEach(el => {
            const raw = el.getAttribute('data-latex');
            if (raw && !el.querySelector('.katex')) {
              try {
                const isDisplay = el.classList.contains('math-display');
                el.innerHTML = window.katex.renderToString(raw, {
                  displayMode: isDisplay,
                  throwOnError: false
                });
              } catch(e) {}
            }
          });
        }
      };
    }

    // 2. Update fileInput to accept markdown files
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.setAttribute('accept', '.org,.md,.markdown,.txt');
    }

    // 3. Enhance RecentDocs if available
    if (window.RecentDocs && window.RecentDocs.addDoc && !window.RecentDocs.__mdHooked) {
      window.RecentDocs.__mdHooked = true;
      const origAddDoc = window.RecentDocs.addDoc.bind(window.RecentDocs);

      window.RecentDocs.addDoc = function(name, text) {
        if (isMarkdownContent(text, name)) {
          let docs = this.getDocs ? this.getDocs().filter(d => d.name !== name) : [];
          let slideCount = 1;
          let firstTitle = '';

          try {
            const lines = text.split('\n');
            for (let i = 0; i < lines.length; i++) {
              let trimmed = lines[i].trim();
              if (trimmed.startsWith('# ') && !firstTitle) {
                firstTitle = trimmed.substring(2).trim();
              }
            }
            const headers = lines.filter(l => {
              const t = l.trim();
              return t.startsWith('# ') || t.startsWith('## ') || t === '---';
            });
            slideCount = Math.max(1, headers.length);
          } catch(e) {}

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          docs.unshift({
            name: name,
            title: firstTitle || name,
            text: text,
            slideCount: slideCount,
            time: timeStr
          });

          if (docs.length > 10) docs = docs.slice(0, 10);
          try {
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
          } catch(e) {}

          if (this.render) this.render();
          return;
        }

        return origAddDoc(name, text);
      };
    }

    // 4. Enhance FolderManager to recognize .md files
    if (window.FolderManager && window.FolderManager.handleUpload && !window.FolderManager.__mdHooked) {
      window.FolderManager.__mdHooked = true;
      const origHandleUpload = window.FolderManager.handleUpload.bind(window.FolderManager);

      window.FolderManager.handleUpload = async function(event) {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) return;

        let folderName = "Uploaded Folder";
        if (fileList[0].webkitRelativePath) {
          folderName = fileList[0].webkitRelativePath.split('/')[0];
        } else {
          folderName = `Folder_${Date.now().toString().slice(-6)}`;
        }

        const folderFiles = this.folders[folderName] || {};
        const promises = [];

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          promises.push(new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const pathKey = file.webkitRelativePath || file.name;
              const isPresentation = file.name.endsWith('.org') || 
                                     file.name.endsWith('.txt') || 
                                     file.name.endsWith('.md') || 
                                     file.name.endsWith('.markdown');
              const blob = new Blob([e.target.result], { type: file.type });

              folderFiles[pathKey] = {
                name: file.name,
                path: pathKey,
                isOrg: isPresentation, // Enables Open button in folder manager
                isMd: file.name.endsWith('.md') || file.name.endsWith('.markdown'),
                blob: blob
              };

              if (pathKey !== file.name) {
                folderFiles[file.name] = folderFiles[pathKey];
              }
              resolve();
            };
            reader.readAsArrayBuffer(file);
          }));
        }

        await Promise.all(promises);
        this.folders[folderName] = folderFiles;
        await this.saveFolderToDB(folderName, folderFiles);
        await this.loadFromDB();
        this.showModal();
      };
    }
  }

  // Run on DOM ready or immediate if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkdownIntegration);
  } else {
    initMarkdownIntegration();
  }

})();
