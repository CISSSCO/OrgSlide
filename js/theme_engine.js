(function() {
    const availableThemes = [
    { id: 'default', name: 'Default', colors: ['#89b4fa', '#1e1e2e', '#cdd6f4'] },
    { id: 'dracula', name: 'Dracula', colors: ['#ff79c6', '#282a36', '#f8f8f2'] },
    { id: 'glassmorphism', name: 'Glass', colors: ['#2997ff', '#1a1b26', '#a855f7'] },
    { id: 'serika', name: 'Serika', colors: ['#e2b714', '#323437', '#d1d0c5'] },
    { id: 'tokyo_night', name: 'Tokyo Night', colors: ['#7aa2f7', '#1a1b26', '#c0caf5'] },
    { id: 'nord', name: 'Nord', colors: ['#88c0d0', '#2e3440', '#eceff4'] },
    { id: 'solarized', name: 'Solarized', colors: ['#2aa198', '#002b36', '#839496'] },
    { id: 'rose_pine', name: 'Rosé Pine', colors: ['#c4a7e7', '#191724', '#e0def4'] },
    { id: 'gruvbox', name: 'Gruvbox', colors: ['#fe8019', '#282828', '#fb4934'] },
    { id: 'horizon', name: 'Horizon', colors: ['#e95678', '#1c1e26', '#fac29a'] },
    { id: 'cyberspace', name: 'Cyberspace', colors: ['#00ce7c', '#181c18', '#9578d3'] },
    { id: 'matrix', name: 'Matrix', colors: ['#00ff41', '#000000', '#00cc11'] },
    { id: 'metaverse', name: 'Metaverse', colors: ['#d92d27', '#171717', '#5094d1'] },
    { id: 'material', name: 'Material', colors: ['#80cbc4', '#263238', '#eeffff'] },
    { id: 'fire', name: 'Fire', colors: ['#ff3300', '#0f0000', '#ffcc00'] },
    { id: 'dots', name: 'Dots', colors: ['#ffffff', '#121520', '#717cb4'] },
    { id: 'cherry_blossom', name: 'Cherry Blossom', colors: ['#ffb7b2', '#1f1a24', '#f3e8f8'] },
    { id: 'aether', name: 'Aether', colors: ['#cf6bdd', '#101820', '#5c7bb2'] },
    { id: 'anti_hero', name: 'Anti Hero', colors: ['#ff003c', '#121212', '#00e5ff'] },
    { id: 'aurora', name: 'Aurora', colors: ['#00e980', '#011926', '#00a3ff'] },
    { id: 'joker', name: 'Joker', colors: ['#7532fa', '#1a0e25', '#99de1e'] },
    { id: 'monokai', name: 'Monokai', colors: ['#f92672', '#272822', '#a6e22e'] },
    { id: 'nebula', name: 'Nebula', colors: ['#be3c88', '#212135', '#19b3b8'] },
    { id: 'palelight', name: 'Palelight', colors: ['#b75276', '#292c3d', '#a6accd'] },
    { id: 'doom_one', name: 'Doom One', colors: ['#51afef', '#282c34', '#98be65'] },
    { id: 'one', name: 'One', colors: ['#61afef', '#282c34', '#98c379'] }
  ];

  let currentTheme = sessionStorage.getItem('orgSlide_extTheme') || 'default';
  let focusedIndex = 0;
  let filteredThemes = [...availableThemes];

  function applyTheme(themeId) {
    availableThemes.forEach(t => {
      document.body.classList.remove(`theme-${t.id}`);
    });

    if (themeId !== 'default') {
      document.body.classList.add(`theme-${themeId}`);
      
      const linkId = `css-theme-${themeId}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `themes/${themeId}/style.css`;
        document.head.appendChild(link);
      }
    }
  }

  applyTheme(currentTheme);

  function renderThemeList() {
    const container = document.getElementById('themeListContainer');
    if (!container) return;

    if (filteredThemes.length === 0) {
      container.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No themes found.</div>`;
      return;
    }

    container.innerHTML = filteredThemes.map((t, idx) => `
      <div class="theme-option-row ${t.id === currentTheme ? 'active' : ''} ${idx === focusedIndex ? 'focused' : ''}" data-theme="${t.id}" data-index="${idx}">
        <div class="theme-left">
          <span class="theme-check">${t.id === currentTheme ? '✓' : '&nbsp;&nbsp;'}</span>
          <span class="theme-name">${t.name}</span>
        </div>
        <div class="theme-colors-pill" style="background: ${t.colors[1]};">
          <div class="theme-dot" style="background: ${t.colors[0]};"></div>
          <div class="theme-dot" style="background: ${t.colors[2]};"></div>
        </div>
      </div>
    `).join('');

    // Re-bind click events
    container.querySelectorAll('.theme-option-row').forEach(row => {
      row.addEventListener('click', (e) => {
        selectTheme(row.getAttribute('data-theme'));
      });
      row.addEventListener('mouseover', (e) => {
        focusedIndex = parseInt(row.getAttribute('data-index'));
        renderThemeList();
      });
    });

    // Scroll focused into view if needed
    const focusedEl = container.querySelector('.focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function selectTheme(themeId) {
    currentTheme = themeId;
    sessionStorage.setItem('orgSlide_extTheme', currentTheme);
    applyTheme(currentTheme);
    renderThemeList();
  }

  function handleKeydown(e) {
    const modal = document.getElementById('themeEngineModal');
    if (!modal || !modal.classList.contains('show')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % filteredThemes.length;
      renderThemeList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + filteredThemes.length) % filteredThemes.length;
      renderThemeList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredThemes[focusedIndex]) {
        selectTheme(filteredThemes[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      window.ThemeEngine.closeModal();
    }
  }

  window.ThemeEngine = {
    openModal: function() {
      let modal = document.getElementById('themeEngineModal');
      
      // Reset filter state
      filteredThemes = [...availableThemes];
      focusedIndex = filteredThemes.findIndex(t => t.id === currentTheme);
      if (focusedIndex === -1) focusedIndex = 0;

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'themeEngineModal';
        modal.className = 'command-palette-modal';
        
        modal.innerHTML = `
          <div class="command-palette-content">
            <div class="command-palette-search">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="themeSearchInput" placeholder="Theme..." autocomplete="off">
            </div>
            <div id="themeListContainer" class="command-palette-list">
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Styles for command palette
        const style = document.createElement('style');
        style.innerHTML = `
          .command-palette-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 99999;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 10vh;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
          }
          .command-palette-modal.show {
            opacity: 1;
            pointer-events: auto;
          }
          .command-palette-content {
            width: 100%;
            max-width: 600px;
            background: var(--bg-workspace);
            border-radius: 12px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: var(--font-body);
            border: 1px solid var(--code-border);
          }
          .command-palette-search {
            display: flex;
            align-items: center;
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--code-border);
            gap: 0.75rem;
          }
          .command-palette-search input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: var(--text-main);
            font-size: 1.2rem;
            font-family: inherit;
          }
          .command-palette-list {
            max-height: 50vh;
            overflow-y: auto;
            padding: 0.5rem;
          }
          .theme-option-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-radius: 8px;
            color: var(--text-muted);
            transition: background 0.1s;
          }
          .theme-option-row.focused {
            background: var(--code-bg);
            color: var(--text-main);
          }
          .theme-option-row.active {
            color: var(--text-main);
          }
          .theme-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
          }
          .theme-check {
            font-family: monospace;
            font-weight: bold;
            color: var(--primary);
            width: 1.2rem;
          }
          .theme-colors-pill {
            display: flex;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 12px;
            border: 1px solid rgba(128,128,128,0.2);
            align-items: center;
          }
          .theme-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid rgba(128,128,128,0.3);
          }
        `;
        document.head.appendChild(style);

        document.getElementById('themeSearchInput').addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          filteredThemes = availableThemes.filter(t => t.name.toLowerCase().includes(query));
          focusedIndex = 0;
          renderThemeList();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) window.ThemeEngine.closeModal();
        });

        document.addEventListener('keydown', handleKeydown);
      } 
      
      modal.classList.add('show');
      const input = document.getElementById('themeSearchInput');
      input.value = '';
      
      renderThemeList();
      
      setTimeout(() => {
        input.focus();
      }, 50);
    },
    closeModal: function() {
      const modal = document.getElementById('themeEngineModal');
      if (modal) modal.classList.remove('show');
    }
  };

  // Bind Alt + T
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      const modal = document.getElementById('themeEngineModal');
      if (modal && modal.classList.contains('show')) {
        window.ThemeEngine.closeModal();
      } else {
        window.ThemeEngine.openModal();
      }
    }
  });

})();
