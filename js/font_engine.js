(function() {
    const availableFonts = [
    { id: 'default', name: 'Default (Inter)', family: "'Inter', sans-serif" },
    { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif" },
    { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif" },
    { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif" },
    { id: 'nunito', name: 'Nunito', family: "'Nunito', sans-serif" },
    { id: 'geist', name: 'Geist', family: "'Geist', sans-serif" },
    { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif" },
    { id: 'fira_code', name: 'Fira Code', family: "'Fira Code', monospace" },
    { id: 'jetbrains_mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
    { id: 'inconsolata', name: 'Inconsolata', family: "'Inconsolata', monospace" },
    { id: 'source_code_pro', name: 'Source Code Pro', family: "'Source Code Pro', monospace" },
    { id: 'ibm_plex_mono', name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace" },
    { id: 'ubuntu_mono', name: 'Ubuntu Mono', family: "'Ubuntu Mono', monospace" },
    { id: 'space_mono', name: 'Space Mono', family: "'Space Mono', monospace" },
    { id: 'roboto_mono', name: 'Roboto Mono', family: "'Roboto Mono', monospace" },
    { id: 'anonymous_pro', name: 'Anonymous Pro', family: "'Anonymous Pro', monospace" },
    { id: 'cousine', name: 'Cousine', family: "'Cousine', monospace" },
    { id: 'victor_mono', name: 'Victor Mono', family: "'Victor Mono', monospace" },
    { id: 'sometype_mono', name: 'Sometype Mono', family: "'Sometype Mono', monospace" },
    { id: 'lato', name: 'Lato', family: "'Lato', sans-serif" },
    { id: 'open_sans', name: 'Open Sans', family: "'Open Sans', sans-serif" },
    { id: 'source_sans_3', name: 'Source Sans 3', family: "'Source Sans 3', sans-serif" },
    { id: 'noto_sans', name: 'Noto Sans', family: "'Noto Sans', sans-serif" },
    { id: 'quicksand', name: 'Quicksand', family: "'Quicksand', sans-serif" },
    { id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif" },
    { id: 'rubik', name: 'Rubik', family: "'Rubik', sans-serif" },
    { id: 'work_sans', name: 'Work Sans', family: "'Work Sans', sans-serif" },
    { id: 'ibm_plex_sans', name: 'IBM Plex Sans', family: "'IBM Plex Sans', sans-serif" },
    { id: 'ubuntu', name: 'Ubuntu', family: "'Ubuntu', sans-serif" },
    { id: 'barlow', name: 'Barlow', family: "'Barlow', sans-serif" },
    { id: 'mulish', name: 'Mulish', family: "'Mulish', sans-serif" },
    { id: 'kanit', name: 'Kanit', family: "'Kanit', sans-serif" },
    { id: 'merriweather_sans', name: 'Merriweather Sans', family: "'Merriweather Sans', sans-serif" },
    { id: 'playfair_display', name: 'Playfair Display', family: "'Playfair Display', serif" },
    { id: 'lora', name: 'Lora', family: "'Lora', serif" },
    { id: 'space_grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
    { id: 'syne', name: 'Syne', family: "'Syne', sans-serif" },
    { id: 'cabin', name: 'Cabin', family: "'Cabin', sans-serif" },
    { id: 'josefin_sans', name: 'Josefin Sans', family: "'Josefin Sans', sans-serif" }
  ];

  let currentFont = sessionStorage.getItem('orgSlide_extFont') || 'default';
  let applyToCode = sessionStorage.getItem('orgSlide_fontApplyToCode') === 'true';
  let focusedIndex = 0;
  let filteredFonts = [...availableFonts];

  function applyFont(fontId) {
    let targetFamily = "'Inter', system-ui, -apple-system, sans-serif";
    
    if (fontId !== 'default') {
      const fontObj = availableFonts.find(f => f.id === fontId);
      if (fontObj) {
        targetFamily = fontObj.family;
      }
    }

    document.documentElement.style.setProperty('--font-body', targetFamily);
    document.documentElement.style.setProperty('--font-heading', targetFamily);

    if (applyToCode) {
      document.documentElement.style.setProperty('--font-mono', targetFamily);
    } else {
      document.documentElement.style.setProperty('--font-mono', "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, Menlo, Monaco, 'Courier New', monospace");
    }
  }

  applyFont(currentFont);

  function renderFontList() {
    const container = document.getElementById('fontListContainer');
    if (!container) return;

    if (filteredFonts.length === 0) {
      container.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No fonts found.</div>`;
      return;
    }

    container.innerHTML = filteredFonts.map((f, idx) => `
      <div class="font-option-row ${f.id === currentFont ? 'active' : ''} ${idx === focusedIndex ? 'focused' : ''}" data-font="${f.id}" data-index="${idx}">
        <div class="font-left">
          <span class="font-check">${f.id === currentFont ? '✓' : '&nbsp;&nbsp;'}</span>
          <span class="font-name" style="font-family: ${f.family} !important;">${f.name}</span>
        </div>
      </div>
    `).join('');

    // Container-level delegation for robust touch and mouse handling
    if (!container._hasDelegation) {
      container._hasDelegation = true;
      let startX = 0, startY = 0, startTime = 0;

      container.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
      });

      const updateFocusedFontUI = () => {
        container.querySelectorAll('.font-option-row').forEach((r, idx) => {
          r.classList.toggle('focused', idx === focusedIndex);
        });
        if (filteredFonts[focusedIndex]) {
          applyFont(filteredFonts[focusedIndex].id);
        }
      };

      container.addEventListener('pointerup', (e) => {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        const elapsed = Date.now() - startTime;
        if (dx < 30 && dy < 30 && elapsed < 800) {
          const row = e.target.closest('.font-option-row');
          if (row) {
            focusedIndex = parseInt(row.getAttribute('data-index'), 10);
            updateFocusedFontUI();
            selectFont(row.getAttribute('data-font'));
          }
        }
      });

      container.addEventListener('click', (e) => {
        const row = e.target.closest('.font-option-row');
        if (row) {
          focusedIndex = parseInt(row.getAttribute('data-index'), 10);
          updateFocusedFontUI();
          selectFont(row.getAttribute('data-font'));
        }
      });
    }

    // Direct row click fallback + desktop-only hover preview
    container.querySelectorAll('.font-option-row').forEach(row => {
      row.addEventListener('click', () => {
        focusedIndex = parseInt(row.getAttribute('data-index'), 10);
        container.querySelectorAll('.font-option-row').forEach((r, idx) => {
          r.classList.toggle('focused', idx === focusedIndex);
        });
        if (filteredFonts[focusedIndex]) {
          applyFont(filteredFonts[focusedIndex].id);
        }
        selectFont(row.getAttribute('data-font'));
      });

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        row.addEventListener('mouseenter', () => {
          focusedIndex = parseInt(row.getAttribute('data-index'), 10);
          container.querySelectorAll('.font-option-row').forEach(r => {
            r.classList.toggle('focused', r === row);
          });
          if (filteredFonts[focusedIndex]) {
            applyFont(filteredFonts[focusedIndex].id);
          }
        });
      }
    });

    const focusedEl = container.querySelector('.focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ block: 'nearest' });
    }

    // Live preview on desktop keyboard navigation
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && filteredFonts[focusedIndex]) {
      applyFont(filteredFonts[focusedIndex].id);
    }
  }

  let lastSelectFontTime = 0;
  function selectFont(fontId) {
    if (!fontId) return;
    const now = Date.now();
    if (now - lastSelectFontTime < 300) return;
    lastSelectFontTime = now;
    currentFont = fontId;
    sessionStorage.setItem('orgSlide_extFont', currentFont);
    applyFont(currentFont);
    window.FontEngine.closeModal();
  }

  function handleKeydown(e) {
    const modal = document.getElementById('fontEngineModal');
    if (!modal || !modal.classList.contains('show')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % filteredFonts.length;
      renderFontList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + filteredFonts.length) % filteredFonts.length;
      renderFontList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFonts[focusedIndex]) {
        selectFont(filteredFonts[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      window.FontEngine.closeModal();
    }
  }

  window.FontEngine = {
    openModal: function() {
      let modal = document.getElementById('fontEngineModal');
      
      filteredFonts = [...availableFonts];
      focusedIndex = filteredFonts.findIndex(f => f.id === currentFont);
      if (focusedIndex === -1) focusedIndex = 0;

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fontEngineModal';
        modal.className = 'command-palette-modal';
        
        modal.innerHTML = `
          <div class="command-palette-content">
            <div class="command-palette-search">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
              <input type="text" id="fontSearchInput" placeholder="Font..." autocomplete="off">
              <button id="applyFontBtn" class="modal-apply-btn" type="button" title="Apply chosen font">Apply</button>
            </div>
            <div style="padding: 0.5rem 1.25rem; border-bottom: 1px solid var(--code-border); display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted); background: rgba(0,0,0,0.1);">
              <input type="checkbox" id="fontApplyToCodeCheckbox" style="cursor: pointer;" ${applyToCode ? 'checked' : ''}>
              <label for="fontApplyToCodeCheckbox" style="cursor: pointer; user-select: none;">Apply font to Code Blocks</label>
            </div>
            <div id="fontListContainer" class="command-palette-list">
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const applyBtn = document.getElementById('applyFontBtn');
        if (applyBtn) {
          const handleApply = (e) => {
            if (e && e.type === 'touchend') e.preventDefault();
            if (filteredFonts[focusedIndex]) {
              selectFont(filteredFonts[focusedIndex].id);
            }
          };
          applyBtn.addEventListener('click', handleApply);
          applyBtn.addEventListener('pointerup', handleApply);
          applyBtn.addEventListener('touchend', handleApply);
        }

        document.getElementById('fontApplyToCodeCheckbox').addEventListener('change', (e) => {
          applyToCode = e.target.checked;
          sessionStorage.setItem('orgSlide_extFontApplyToCode', applyToCode.toString());
          if (filteredFonts[focusedIndex]) {
            applyFont(filteredFonts[focusedIndex].id);
          } else {
            applyFont(currentFont);
          }
        });

        document.getElementById('fontSearchInput').addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          filteredFonts = availableFonts.filter(f => f.name.toLowerCase().includes(query));
          focusedIndex = 0;
          renderFontList();
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) window.FontEngine.closeModal();
        });
        modal.addEventListener('touchend', (e) => {
          if (e.target === modal) {
            e.preventDefault();
            window.FontEngine.closeModal();
          }
        });

        document.addEventListener('keydown', handleKeydown);
      } else {
        const checkbox = document.getElementById('fontApplyToCodeCheckbox');
        if (checkbox) checkbox.checked = applyToCode;
      }
      
      modal.classList.add('show');
      const input = document.getElementById('fontSearchInput');
      input.value = '';
      
      renderFontList();
      
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        setTimeout(() => {
          input.focus();
        }, 50);
      }
    },
    closeModal: function() {
      const modal = document.getElementById('fontEngineModal');
      if (modal) modal.classList.remove('show');
      applyFont(currentFont); // Revert preview if canceled
    }
  };

})();
