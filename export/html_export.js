window.GenerateExportHTML = async function() {
  const htmlClone = document.documentElement.cloneNode(true);

  // Synchronize root and body classes, styles, and state from live document
  htmlClone.className = document.documentElement.className;
  if (document.documentElement.getAttribute('style')) {
    htmlClone.setAttribute('style', document.documentElement.getAttribute('style'));
  }
  const bodyClone = htmlClone.querySelector('body');
  if (bodyClone) {
    bodyClone.className = document.body.className;
    if (document.body.getAttribute('style')) {
      bodyClone.setAttribute('style', document.body.getAttribute('style'));
    }
  }

  // Ensure active theme and render mode stylesheets are present in htmlClone head
  const headClone = htmlClone.querySelector('head');
  const dynamicStylesheetIds = [
    'css-render-mode',
    ...Array.from(document.querySelectorAll('link[id^="css-theme-"]')).map(l => l.id)
  ];
  dynamicStylesheetIds.forEach(id => {
    if (id) {
      const liveEl = document.getElementById(id);
      if (liveEl && !headClone.querySelector('#' + id)) {
        headClone.appendChild(liveEl.cloneNode(true));
      }
    }
  });

  // Helper to recursively fetch and inline CSS, resolving all relative @import statements
  async function resolveAndInlineCSS(href, baseUrl, visited = new Set()) {
    try {
      const fullUrl = new URL(href, baseUrl).href;
      if (visited.has(fullUrl)) return '';
      visited.add(fullUrl);

      const res = await fetch(fullUrl);
      if (!res.ok) return '';
      let cssText = await res.text();

      // Find relative @import statements (e.g. @import url('base.css'); or @import 'base.css';)
      const importRegex = /@import\s+(?:url\(['"]?([^'"\)]+)['"]?\)|['"]([^'"]+)['"])\s*;/g;
      const matches = [];
      let match;
      while ((match = importRegex.exec(cssText)) !== null) {
        matches.push({
          full: match[0],
          path: match[1] || match[2]
        });
      }

      for (const item of matches) {
        const importPath = item.path.trim();
        // If it's a relative/local import, resolve and inline it recursively
        if (!importPath.startsWith('http://') && !importPath.startsWith('https://') && !importPath.startsWith('//')) {
          const inlined = await resolveAndInlineCSS(importPath, fullUrl, visited);
          cssText = cssText.replace(item.full, () => inlined);
        }
      }

      return cssText;
    } catch (err) {
      console.warn('Error inlining CSS:', href, err);
      return '';
    }
  }

  // 1. Inline all stylesheets
  const links = Array.from(htmlClone.querySelectorAll('link[rel="stylesheet"]'));
  for (const link of links) {
    const rawHref = link.getAttribute('href');
    if (!rawHref) continue;

    const cssText = await resolveAndInlineCSS(rawHref, window.location.href);
    if (cssText && cssText.trim().length > 0) {
      const style = document.createElement('style');
      if (link.id) style.id = link.id;
      style.textContent = cssText;
      link.replaceWith(style);
    }
  }

  // 2. Inline / clean up JS
  const removeScriptPatterns = [
    'theme_engine.js',
    'font_engine.js',
    'logo_manager.js',
    'export_engine.js',
    'render_mode_engine.js',
    'folder_manager.js',
    'recent_docs.js',
    'html_export.js',
    'pdf_export.js',
    'pptx_export.js'
  ];

  const scripts = Array.from(htmlClone.querySelectorAll('script[src]'));
  for (const script of scripts) {
    const src = script.getAttribute('src');
    if (!src) continue;

    if (removeScriptPatterns.some(pat => src.includes(pat))) {
      script.remove();
      continue;
    }

    // Inline local scripts (or CDN scripts if accessible)
    try {
      const scriptUrl = new URL(src, window.location.href).href;
      const res = await fetch(scriptUrl);
      if (res.ok) {
        const jsText = await res.text();
        const inlineScript = document.createElement('script');
        inlineScript.textContent = jsText;
        script.replaceWith(inlineScript);
      }
    } catch (e) {
      // If external script fetch fails, keep original <script src="...">
    }
  }

  // 3. Setup state & initialization script
  const activeSlideIndex = typeof currentSlide !== 'undefined' ? currentSlide : 0;
  const globalDataStr = JSON.stringify(window.globalSlideData || []);

  const initScript = document.createElement('script');
  initScript.textContent = `
    window.addEventListener('DOMContentLoaded', () => {
      window.globalSlideData = ${globalDataStr};
      if (typeof window.refreshSlidesList === 'function') {
        window.refreshSlidesList();
      }
      if (typeof window.setExportedCurrentSlide === 'function') {
        window.setExportedCurrentSlide(${activeSlideIndex});
      }
      if (typeof window.updateSlide === 'function') {
        window.updateSlide(${activeSlideIndex});
      } else if (typeof updateSlide === 'function') {
        updateSlide(${activeSlideIndex});
      }
      const landing = document.getElementById('landingPage');
      if (landing) landing.style.display = 'none';
      const deck = document.getElementById('deckContainer');
      if (deck) deck.style.display = 'flex';
    });
  `;
  bodyClone.appendChild(initScript);

  // 4. Inject Fonts & Variables
  const rootStyles = document.createElement('style');
  rootStyles.textContent = `
    :root {
      --font-body: ${document.documentElement.style.getPropertyValue('--font-body') || 'inherit'};
      --font-heading: ${document.documentElement.style.getPropertyValue('--font-heading') || 'inherit'};
      --font-mono: ${document.documentElement.style.getPropertyValue('--font-mono') || 'inherit'};
    }
    .deck-container {
      display: flex !important;
    }
    /* Safety rule: Modals and landing page never show in export */
    .landing-page, #landingPage, .help-modal, #folderModal, #goToSlideModal, #helpModal, .command-palette-modal {
      display: none !important;
    }
  `;
  headClone.appendChild(rootStyles);

  // Ensure deckContainer and top-controls on htmlClone have display: flex
  const deckClone = htmlClone.querySelector('#deckContainer');
  if (deckClone) deckClone.style.display = 'flex';
  const topControls = htmlClone.querySelector('.top-controls');
  if (topControls) topControls.style.display = 'flex';

  // 5. Clean up DOM (strip authoring modals, landing page, and unnecessary controls)
  const removeSelectors = [
    '.command-palette-modal',
    '.help-modal',
    '#folderModal',
    '#goToSlideModal',
    '#helpModal',
    '#landingPage',
    '#recentDocsContainer',
    '#fileInput',
    '#folderInput',
    '#btn-render-mode',
    'button[title="Select Theme (Alt + T)"]',
    'button[title="Select Font"]',
    'button[title="Export Presentation"]',
    'button[title="Load / Replace .org File"]',
    'button[title="Select Render Mode (Alt + M)"]',
    'button[title="Open Main Menu (Home)"]',
    '.help-hint-inline'
  ];

  removeSelectors.forEach(sel => {
    htmlClone.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Ensure slides in deckContainer are in correct active state
  const slidesInClone = htmlClone.querySelectorAll('.deck-container > .slide');
  slidesInClone.forEach((slide, idx) => {
    if (idx === activeSlideIndex) {
      slide.classList.add('active');
    } else {
      const isContinuous = document.body.className.includes('render-mode-document') ||
                           document.body.className.includes('render-mode-book') ||
                           document.body.className.includes('render-mode-paper') ||
                           document.body.className.includes('render-mode-scientific') ||
                           document.body.className.includes('render-mode-terminal') ||
                           document.body.className.includes('render-mode-notebook') ||
                           document.body.className.includes('render-mode-outline');
      if (!isContinuous) {
        slide.classList.remove('active');
      }
    }
  });

  return "<!DOCTYPE html>\n" + htmlClone.outerHTML;
};
