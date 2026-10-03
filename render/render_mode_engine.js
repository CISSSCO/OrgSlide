/**
 * render_mode_engine.js
 * Enables live in-browser multi-mode rendering for OrgSlide:
 * 1. slide     - Standard PowerPoint presentation mode
 * 2. beamer    - Academic LaTeX Beamer style with formal blocks and theme navigation
 * 3. document  - Continuous A4 reader/book document mode
 * 4. handout   - 2x2 presentation grid with lined note-taking margins
 */

(function() {
  const renderModes = [
    { id: 'slide', name: 'Presentation Slide', badge: 'PPT', desc: 'Standard interactive presentation view (16:9 widescreen)' },
    { id: 'beamer', name: 'LaTeX Beamer Style', badge: 'TEX', desc: 'Academic slides with formal header navigation bars and block styling' },
    { id: 'document', name: 'Book / Article Document', badge: 'DOC', desc: 'Continuous reading layout flowing like a published paper or book chapter' },
    { id: 'outline', name: 'Hierarchical Outline', badge: 'TREE', desc: 'Minimalistic text-based outline view flowing continuously' },
    { id: 'scientific', name: 'Scientific IEEE', badge: 'SCI', desc: 'Two-column academic research paper format with serif typography' },
    { id: 'book', name: 'LaTeX Book', badge: 'TEX', desc: 'Classic academic textbook layout mimicking standard LaTeX documents' },
    { id: 'paper', name: 'Preprint Manuscript', badge: 'ARXIV', desc: 'Single-column academic preprint with wide margins and classic serif font' },
    { id: 'terminal', name: 'Retro Terminal', badge: 'CLI', desc: 'Hacker-style monospace aesthetic with glowing green text' },
    { id: 'notebook', name: 'Jupyter Notebook', badge: 'IPYNB', desc: 'Data science notebook style emphasizing code blocks and output cells' },
    { id: 'glass', name: 'Glassmorphism UI', badge: 'UI', desc: 'Modern translucent design with frosted glass effects and vibrant gradients' }
  ];

  let currentMode = sessionStorage.getItem('orgSlide_renderMode') || 'slide';
  let focusedIndex = 0;
  let filteredModes = [...renderModes];

  function getMode(id) {
    return renderModes.find(m => m.id === id) || renderModes[0];
  }

  function applyMode(modeId) {
    const mode = getMode(modeId);
    currentMode = mode.id;
    sessionStorage.setItem('orgSlide_renderMode', currentMode);

    // Toggle body classes
    renderModes.forEach(m => {
      document.body.classList.remove(`render-mode-${m.id}`);
    });
    document.body.classList.add(`render-mode-${currentMode}`);

    // Dynamically load the layout CSS file
    const linkId = 'css-render-mode';
    let linkEl = document.getElementById(linkId);
    
    if (currentMode === 'slide') {
      if (linkEl) linkEl.remove();
    } else {
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = linkId;
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = `render/modes/${currentMode}/${currentMode}.css`;
      
      // Load optional JS script for the mode
      const scriptId = `js-render-mode-${currentMode}`;
      if (!document.getElementById(scriptId)) {
        const scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.src = `render/modes/${currentMode}/${currentMode}.js`;
        document.body.appendChild(scriptEl);
      }
    }

    // Update mode label UI
    const modeLabel = document.getElementById('current-mode-label');
    if (modeLabel) {
      modeLabel.textContent = mode.name;
    }
    const modeBtn = document.getElementById('btn-render-mode');
    if (modeBtn) {
      modeBtn.setAttribute('title', `Render Mode: ${mode.name} (Alt + M)`);
    }

    // Inform main slide navigation if required
    if (typeof window.refreshSlidesList === 'function') {
      window.refreshSlidesList();
    }

    // Scroll active slide into view for continuous reading modes
    const continuousModes = ['document', 'outline', 'scientific', 'paper', 'notebook', 'terminal', 'glass', 'book'];
    if (continuousModes.includes(currentMode)) {
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        setTimeout(() => {
          activeSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  }

  function renderModeList() {
    const container = document.getElementById('renderModeListContainer');
    if (!container) return;

    if (filteredModes.length === 0) {
      container.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No render modes found.</div>`;
      return;
    }

    container.innerHTML = filteredModes.map((m, idx) => `
      <div class="theme-option-row ${m.id === currentMode ? 'active' : ''} ${idx === focusedIndex ? 'focused' : ''}" data-mode="${m.id}" data-index="${idx}">
        <div class="theme-left" style="flex: 1; justify-content: flex-start; gap: 0.75rem;">
          <span class="theme-check" style="font-size: 1rem;">${m.id === currentMode ? '✓' : '&nbsp;&nbsp;'}</span>
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="font-name" style="font-weight: 600; color: var(--text-main); font-size: 1rem;">${m.name}</span>
              <span class="badge" style="background: var(--secondary); font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px;">${m.badge}</span>
            </div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${m.desc}</span>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.theme-option-row').forEach(row => {
      row.addEventListener('click', () => {
        selectMode(row.getAttribute('data-mode'));
      });
      row.addEventListener('mouseover', () => {
        focusedIndex = parseInt(row.getAttribute('data-index'), 10);
        renderModeList();
      });
    });

    const focusedEl = container.querySelector('.focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function selectMode(modeId) {
    applyMode(modeId);
    window.RenderModeEngine.closeModal();
  }

  function handleKeydown(e) {
    const modal = document.getElementById('renderModeModal');
    if (!modal || !modal.classList.contains('show')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % filteredModes.length;
      renderModeList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + filteredModes.length) % filteredModes.length;
      renderModeList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredModes[focusedIndex]) {
        selectMode(filteredModes[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      window.RenderModeEngine.closeModal();
    }
  }

  window.RenderModeEngine = {
    getModes: function() {
      return renderModes;
    },
    getCurrentMode: function() {
      return currentMode;
    },
    setMode: function(modeId) {
      applyMode(modeId);
    },
    openModal: function() {
      let modal = document.getElementById('renderModeModal');
      filteredModes = [...renderModes];
      focusedIndex = filteredModes.findIndex(m => m.id === currentMode);
      if (focusedIndex === -1) focusedIndex = 0;

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'renderModeModal';
        modal.className = 'command-palette-modal';
        modal.innerHTML = `
          <div class="command-palette-content">
            <div class="command-palette-search">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <input type="text" id="renderModeSearchInput" placeholder="Select Render Mode..." autocomplete="off">
            </div>
            <div id="renderModeListContainer" class="command-palette-list"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('renderModeSearchInput').addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          filteredModes = renderModes.filter(m => 
            m.name.toLowerCase().includes(query) || 
            m.desc.toLowerCase().includes(query) ||
            m.badge.toLowerCase().includes(query)
          );
          focusedIndex = 0;
          renderModeList();
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) window.RenderModeEngine.closeModal();
        });

        document.addEventListener('keydown', handleKeydown);
      }

      modal.classList.add('show');
      const input = document.getElementById('renderModeSearchInput');
      input.value = '';
      renderModeList();

      setTimeout(() => {
        input.focus();
      }, 50);
    },
    closeModal: function() {
      const modal = document.getElementById('renderModeModal');
      if (modal) modal.classList.remove('show');
    }
  };

// Keyboard shortcut: Alt + M
document.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key.toLowerCase() === 'm' || e.code === 'KeyM')) {
    e.preventDefault();
    const modal = document.getElementById('renderModeModal');
    if (modal && modal.classList.contains('show')) {
      window.RenderModeEngine.closeModal();
    } else {
      window.RenderModeEngine.openModal();
    }
  }
});

// Apply saved mode on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyMode(currentMode);
    patchUpdateSlide();
  });
} else {
  applyMode(currentMode);
  patchUpdateSlide();
}

function patchUpdateSlide() {
  if (window.updateSlide && !window.updateSlide.isPatched) {
    const orig = window.updateSlide;
    window.updateSlide = function(index) {
      orig(index);
      const continuousModes = ['document', 'outline', 'scientific', 'paper', 'notebook', 'terminal', 'glass', 'book'];
      if (continuousModes.includes(currentMode)) {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
          setTimeout(() => activeSlide.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      }
    };
    window.updateSlide.isPatched = true;
  }
}
})();
