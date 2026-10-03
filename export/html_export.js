window.GenerateExportHTML = async function() {
  const htmlClone = document.documentElement.cloneNode(true);
  
  // 1. Inline CSS
  const links = htmlClone.querySelectorAll('link[rel="stylesheet"]');
  for (const link of links) {
    if ((link.href && link.href.startsWith(window.location.origin)) || link.href.includes('/css/') || link.href.includes('/themes/') || link.href.includes('/render/')) {
      try {
        const res = await fetch(link.href);
        const cssText = await res.text();
        const style = document.createElement('style');
        style.textContent = cssText;
        link.replaceWith(style);
      } catch (e) {}
    }
  }

  // 2. Inline JS
  const scripts = htmlClone.querySelectorAll('script[src]');
  for (const script of scripts) {
    const src = script.getAttribute('src');
    if (src.includes('theme_engine.js') || src.includes('font_engine.js') || src.includes('logo_manager.js') || src.includes('export_engine.js') || src.includes('render_mode_engine.js')) {
      script.remove();
      continue;
    }
    if ((script.src && script.src.startsWith(window.location.origin)) || script.src.includes('/js/') || script.src.includes('/export/')) {
      try {
        const res = await fetch(script.src);
        const jsText = await res.text();
        const inlineScript = document.createElement('script');
        inlineScript.textContent = jsText;
        script.replaceWith(inlineScript);
      } catch (e) {}
    }
  }

  // 3. Setup state
  const activeSlideIndex = typeof currentSlide !== 'undefined' ? currentSlide : 0;
  const globalDataStr = JSON.stringify(window.globalSlideData || []);
  
  const initScript = document.createElement('script');
  initScript.textContent = `
    window.addEventListener('DOMContentLoaded', () => {
      window.globalSlideData = ${globalDataStr};
      if (typeof window.refreshSlidesList === 'function') {
         window.refreshSlidesList();
         if (typeof currentSlide !== 'undefined') {
           if(window.setExportedCurrentSlide) window.setExportedCurrentSlide(${activeSlideIndex});
         }
      }
    });
  `;
  htmlClone.querySelector('body').appendChild(initScript);

  // 4. Inject Fonts
  const rootStyles = document.createElement('style');
  rootStyles.textContent = `:root {
    --font-body: ${document.documentElement.style.getPropertyValue('--font-body') || 'inherit'};
    --font-heading: ${document.documentElement.style.getPropertyValue('--font-heading') || 'inherit'};
    --font-mono: ${document.documentElement.style.getPropertyValue('--font-mono') || 'inherit'};
  }`;
  htmlClone.querySelector('head').appendChild(rootStyles);

  // 5. Clean up DOM (HTML Export specific cleanup)
  htmlClone.querySelectorAll('.command-palette-modal').forEach(m => m.remove());

  let removeSelectors = [
    'button[title="Select Theme (Alt + T)"]',
    'button[title="Select Font"]',
    'button[title="Export Presentation"]',
    'button[title="Load / Replace .org File"]',
    'button[title="Select Render Mode (Alt + M)"]',
    '#btn-render-mode',
    '#fileInput',
    '#helpModal',
    '.help-hint-inline'
  ];

  removeSelectors.forEach(sel => {
    htmlClone.querySelectorAll(sel).forEach(el => el.remove());
  });

  return "<!DOCTYPE html>\n" + htmlClone.outerHTML;
};
