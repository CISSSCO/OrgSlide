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
,
    { id: 'ayu_mirage', name: 'Ayu Mirage', colors: ['#ffcc66', '#212733', '#f28779'] },
    { id: 'night_owl', name: 'Night Owl', colors: ['#82aaff', '#011627', '#c792ea'] },
    { id: 'synthwave', name: 'SynthWave 84', colors: ['#f92aad', '#262335', '#36f9f6'] },
    { id: 'cobalt2', name: 'Cobalt2', colors: ['#ffc600', '#193549', '#ff628c'] },
    { id: 'github', name: 'GitHub Dark', colors: ['#58a6ff', '#0d1117', '#ff7b72'] },
    { id: 'ubuntu', name: 'Ubuntu', colors: ['#dd4814', '#300a24', '#f57900'] },
    { id: 'oceanic_next', name: 'Oceanic Next', colors: ['#fac863', '#1b2b34', '#ec5f67'] },
    { id: 'snazzy', name: 'Snazzy', colors: ['#5af78e', '#282a36', '#ff5c57'] },
    { id: 'drifter', name: 'Drifter', colors: ['#e6b22c', '#1e1e1e', '#eb6e21'] },
    { id: 'shades_of_purple', name: 'Shades of Purple', colors: ['#fad000', '#2d2b55', '#ff2c70'] }
,
    { id: 'omni', name: 'Omni', colors: ['#ff79c6', '#191622', '#ff5555'] },
    { id: 'poimandres', name: 'Poimandres', colors: ['#5de4c7', '#1b1e28', '#add7ff'] },
    { id: 'city_lights', name: 'City Lights', colors: ['#5ec4ff', '#1d252c', '#d98e48'] },
    { id: 'panda', name: 'Panda', colors: ['#ff75b5', '#292a2b', '#ffb86c'] },
    { id: 'andromeda', name: 'Andromeda', colors: ['#00e8c6', '#23262e', '#ffe66d'] },
    { id: 'halcyon', name: 'Halcyon', colors: ['#ffcc66', '#1d2433', '#ef6b73'] },
    { id: 'fairy_floss', name: 'Fairy Floss', colors: ['#f92672', '#5a5475', '#e6c000'] },
    { id: 'laserwave', name: 'LaserWave', colors: ['#eb64b9', '#27212e', '#74dfc4'] },
    { id: 'darcula', name: 'Darcula', colors: ['#cc7832', '#2b2b2b', '#9876aa'] },
    { id: 'high_contrast', name: 'High Contrast', colors: ['#ffff00', '#000000', '#ff0000'] },
    { id: 'slack', name: 'Slack', colors: ['#2eb67d', '#220f2e', '#36c5f0'] },
    { id: 'vitesse', name: 'Vitesse', colors: ['#4d9375', '#121212', '#cb7676'] },
    { id: 'min_dark', name: 'Minimal Dark', colors: ['#ffffff', '#000000', '#444444'] },
    { id: 'outrun', name: 'Outrun', colors: ['#ff00ff', '#14002e', '#fffc00'] },
    { id: 'blood_moon', name: 'Blood Moon', colors: ['#ff5050', '#0c0c0c', '#c60000'] },
    { id: 'monokai_pro', name: 'Monokai Pro', colors: ['#ffd866', '#2d2a2e', '#ff6188'] },
    { id: 'spacegray', name: 'Spacegray', colors: ['#bf616a', '#2b303b', '#ebcb8b'] },
    { id: 'material_palenight', name: 'Palenight', colors: ['#c792ea', '#292d3e', '#f07178'] },
    { id: 'lucario', name: 'Lucario', colors: ['#f8f8f2', '#2b3e50', '#f92672'] },
    { id: 'seti', name: 'Seti', colors: ['#e6cd69', '#151718', '#cd3f45'] }
,
    { id: 'catppuccin_mocha', name: 'Catppuccin Mocha', colors: ['#cba6f7', '#1e1e2e', '#89b4fa'] },
    { id: 'catppuccin_frappe', name: 'Catppuccin Frappé', colors: ['#ca9ee6', '#303446', '#8caaee'] },
    { id: 'everforest', name: 'Everforest', colors: ['#a7c080', '#2b3339', '#e67e80'] },
    { id: 'kanagawa', name: 'Kanagawa', colors: ['#7aa89f', '#1f1f28', '#957fb8'] },
    { id: 'gruvbox_material', name: 'Gruvbox Material', colors: ['#a9b665', '#282828', '#ea6962'] },
    { id: 'winter_is_coming', name: 'Winter is Coming', colors: ['#82aaff', '#011627', '#ecc48d'] },
    { id: 'fleet', name: 'Fleet', colors: ['#6fb1f5', '#181818', '#e06c75'] },
    { id: 'bluloco', name: 'Bluloco', colors: ['#3a95fd', '#282c34', '#ff9d00'] },
    { id: 'moonlight', name: 'Moonlight', colors: ['#82aaff', '#222436', '#c099ff'] },
    { id: 'challenger_deep', name: 'Challenger Deep', colors: ['#91ddff', '#1e1e2e', '#ffe900'] },
    { id: 'tender', name: 'Tender', colors: ['#73cef4', '#282828', '#f43753'] },
    { id: 'aura', name: 'Aura', colors: ['#a277ff', '#15141b', '#ffca85'] },
    { id: 'iceberg', name: 'Iceberg', colors: ['#84a0c6', '#161821', '#e27878'] },
    { id: 'github_dimmed', name: 'GitHub Dimmed', colors: ['#539bf5', '#22272e', '#f47067'] },
    { id: 'sublime_material', name: 'Sublime Material', colors: ['#82aaff', '#263238', '#f07178'] },
    { id: 'material_ocean', name: 'Material Ocean', colors: ['#82aaff', '#0f111a', '#ff5370'] },
    { id: 'tokyo_night_storm', name: 'Tokyo Storm', colors: ['#7dcfff', '#24283b', '#f7768e'] },
    { id: 'rose_pine_moon', name: 'Rosé Pine Moon', colors: ['#c4a7e7', '#232136', '#eb6f92'] },
    { id: 'midnight_city', name: 'Midnight City', colors: ['#8c91fa', '#141729', '#ffb266'] },
    { id: 'cyberpunk_2077', name: 'Cyberpunk', colors: ['#00fff9', '#0c0c27', '#f8e81c'] }
,
    { id: 'catppuccin_macchiato', name: 'Catppuccin Macchiato', colors: ['#c6a0f6', '#24273a', '#8aadf4'] },
    { id: 'dracula_pro', name: 'Dracula Pro', colors: ['#ff79c6', '#22212c', '#ff9580'] },
    { id: 'onedark_pro', name: 'One Dark Pro', colors: ['#61afef', '#282c34', '#e06c75'] },
    { id: 'solarized_osaka', name: 'Solarized Osaka', colors: ['#2aa198', '#002b36', '#cb4b16'] },
    { id: 'vesper', name: 'Vesper', colors: ['#000000', '#101010', '#ff5f5f'] },
    { id: 'oxocarbon', name: 'Oxocarbon', colors: ['#ff7eb6', '#161616', '#82cfff'] },
    { id: 'campbell', name: 'Campbell (CMD)', colors: ['#3b78ff', '#0c0c0c', '#e74856'] },
    { id: 'powershell', name: 'PowerShell', colors: ['#00ffff', '#012456', '#ff0000'] },
    { id: 'retrocast', name: 'Retrocast', colors: ['#8bd649', '#222222', '#df740c'] },
    { id: 'carbonfox', name: 'Carbonfox', colors: ['#78a9ff', '#161616', '#ee5396'] },
    { id: 'nightfox', name: 'Nightfox', colors: ['#81b29a', '#192330', '#c94f6d'] },
    { id: 'duskfox', name: 'Duskfox', colors: ['#569fba', '#232136', '#ea9a97'] },
    { id: 'nordic', name: 'Nordic', colors: ['#88c0d0', '#191d24', '#bf616a'] },
    { id: 'zeon', name: 'Zeon', colors: ['#e45649', '#000000', '#986801'] },
    { id: 'neon_genesis', name: 'Neon Genesis', colors: ['#ff0099', '#000000', '#00ff00'] },
    { id: 'arc_dark', name: 'Arc Dark', colors: ['#5294e2', '#2f343f', '#cc575d'] },
    { id: 'sweet_pastel', name: 'Sweet Pastel', colors: ['#c678dd', '#282c34', '#e06c75'] },
    { id: 'minty', name: 'Minty', colors: ['#4dc696', '#0f1419', '#f07178'] },
    { id: 'peachy', name: 'Peachy', colors: ['#ffb86c', '#2b2d3a', '#f1fa8c'] },
    { id: 'obsidian', name: 'Obsidian', colors: ['#93c763', '#293134', '#d39745'] },
    { id: 'twilight', name: 'Twilight', colors: ['#cda869', '#1e1e1e', '#cf6a4c'] },
    { id: 'cobalt_next', name: 'Cobalt Next', colors: ['#3a8bba', '#1e272c', '#FF6E4A'] },
    { id: 'bamboo', name: 'Bamboo', colors: ['#3c9654', '#252526', '#e75d50'] },
    { id: 'mountain', name: 'Mountain', colors: ['#000000', '#0f0f0f', '#f0f0f0'] }
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
