// Image Manager: Layout persistence, manual link replacement, resizing, locking, and fallback UI
(function() {
  // Synchronously initialize ImageOverrides from storage
  function getStoredOverrides() {
    try {
      const local = JSON.parse(localStorage.getItem('orgSlide_imageOverrides') || '{}');
      const session = JSON.parse(sessionStorage.getItem('orgSlide_imageOverrides') || '{}');
      return Object.assign({}, local, session);
    } catch(e) {
      return {};
    }
  }

  window.ImageOverrides = getStoredOverrides();

  window.ImageManager = {

    saveLayout: function(container) {
      const img = container.querySelector('img.org-image');
      if (!img) return;
      const key = img.getAttribute('data-original-url') || img.getAttribute('alt') || img.getAttribute('src');
      if (!key) return;
      
      const layout = {
        classes: Array.from(container.classList).filter(c => [
          'align-left', 'align-center', 'align-right', 'align-middle', 'free-mode', 'is-locked'
        ].includes(c)),
        style: container.style.cssText,
        isLocked: container.classList.contains('is-locked')
      };
      
      let layouts = {};
      try {
        layouts = Object.assign(
          {},
          JSON.parse(localStorage.getItem('orgSlide_imageLayouts') || '{}'),
          JSON.parse(sessionStorage.getItem('orgSlide_imageLayouts') || '{}')
        );
      } catch(e) {}
      
      layouts[key] = layout;
      const filename = key.split('/').pop().split('?')[0].split('#')[0];
      if (filename && filename !== key) {
        layouts[filename] = layout;
      }
      
      try {
        sessionStorage.setItem('orgSlide_imageLayouts', JSON.stringify(layouts));
        localStorage.setItem('orgSlide_imageLayouts', JSON.stringify(layouts));
      } catch(e) {}
    },

    restoreLayouts: function() {
      let layouts = {};
      try {
        layouts = Object.assign(
          {},
          JSON.parse(localStorage.getItem('orgSlide_imageLayouts') || '{}'),
          JSON.parse(sessionStorage.getItem('orgSlide_imageLayouts') || '{}')
        );
      } catch(e) {}
      
      document.querySelectorAll('.org-image-container').forEach(container => {
        // Initialize interactive handles
        if (window.Interact) {
          window.Interact.init(container);
        }

        const img = container.querySelector('img.org-image');
        if (!img) return;
        const key = img.getAttribute('data-original-url') || img.getAttribute('alt') || img.getAttribute('src');
        const filename = key ? key.split('/').pop().split('?')[0].split('#')[0] : '';
        const layoutData = layouts[key] || (filename ? layouts[filename] : null);
        
        if (layoutData) {
          container.classList.remove('align-left', 'align-center', 'align-right', 'align-middle', 'free-mode', 'is-locked');
          if (layoutData.classes) container.classList.add(...layoutData.classes);
          if (layoutData.isLocked) container.classList.add('is-locked');
          
          if (layoutData.style) {
            container.style.cssText = layoutData.style;
          }
          
          const btns = container.querySelectorAll('.image-toolbar button');
          btns.forEach(b => b.classList.remove('active'));
          
          // Restore free-mode button state
          if (container.classList.contains('free-mode')) {
            const freeBtn = Array.from(btns).find(b => b.getAttribute('title') && b.getAttribute('title').includes('Free Move'));
            if (freeBtn) freeBtn.classList.add('active');
          } else {
            // Restore alignment button state
            const alignClass = Array.from(container.classList).find(c => c.startsWith('align-'));
            if (alignClass) {
              const alignVal = alignClass.replace('align-', '');
              const alignBtn = Array.from(btns).find(b => b.getAttribute('title') && b.getAttribute('title').toLowerCase().includes(alignVal));
              if (alignBtn) alignBtn.classList.add('active');
            }
          }

          // Restore lock button state
          const lockBtn = container.querySelector('button[data-action="lock"]');
          if (lockBtn) {
            const isLocked = container.classList.contains('is-locked');
            lockBtn.classList.toggle('active', isLocked);
            lockBtn.setAttribute('title', isLocked ? 'Unlock Position' : 'Lock / Fix Position');
            lockBtn.innerHTML = isLocked ? `
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            ` : `
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
            `;
          }
        }
      });
    },

    toggleLock: function(btn) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      
      const isLocked = container.classList.toggle('is-locked');
      btn.classList.toggle('active', isLocked);
      btn.setAttribute('title', isLocked ? 'Unlock Position' : 'Lock / Fix Position');
      btn.innerHTML = isLocked ? `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      ` : `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
      `;
      
      if (window.ImageManager.saveLayout) {
        window.ImageManager.saveLayout(container);
      }
    },

    scaleImage: function(btn, factor) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      const currentWidth = container.getBoundingClientRect().width;
      const newWidth = Math.max(80, Math.round(currentWidth * (1 + factor)));
      container.style.width = newWidth + 'px';
      container.style.maxWidth = '100%';
      
      if (window.ImageManager.saveLayout) {
        window.ImageManager.saveLayout(container);
      }
    },

    setWidthPreset: function(btn, widthVal) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      container.style.width = widthVal;
      container.style.maxWidth = '100%';
      
      if (window.ImageManager.saveLayout) {
        window.ImageManager.saveLayout(container);
      }
    },

    resetSize: function(btn) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      container.style.width = '';
      container.style.height = '';
      
      if (window.ImageManager.saveLayout) {
        window.ImageManager.saveLayout(container);
      }
    },

    removeOverride: function(originalUrl, btn) {
      if (!originalUrl && btn) {
        const container = btn.closest('.org-image-container');
        const img = container ? container.querySelector('img.org-image') : null;
        if (img) originalUrl = img.getAttribute('data-original-url') || img.getAttribute('alt') || img.getAttribute('src');
      }
      if (!originalUrl) return;
      
      const trimmed = originalUrl.trim();
      const filename = trimmed.split('/').pop().split('?')[0].split('#')[0];
      
      if (window.ImageOverrides) {
        delete window.ImageOverrides[trimmed];
        if (filename) delete window.ImageOverrides[filename];
        if (trimmed.startsWith('file:')) delete window.ImageOverrides[trimmed.substring(5)];
      }
      
      try {
        const local = JSON.parse(localStorage.getItem('orgSlide_imageOverrides') || '{}');
        delete local[trimmed];
        if (filename) delete local[filename];
        localStorage.setItem('orgSlide_imageOverrides', JSON.stringify(local));

        const session = JSON.parse(sessionStorage.getItem('orgSlide_imageOverrides') || '{}');
        delete session[trimmed];
        if (filename) delete session[filename];
        sessionStorage.setItem('orgSlide_imageOverrides', JSON.stringify(session));
      } catch(e) {}
      
      if (window.FolderManager && window.FolderManager.db) {
        try {
          const tx = window.FolderManager.db.transaction('imageOverrides', 'readwrite');
          tx.objectStore('imageOverrides').delete(trimmed);
        } catch(e) {}
      }
      
      // Reset layout
      try {
        let layouts = JSON.parse(sessionStorage.getItem('orgSlide_imageLayouts') || localStorage.getItem('orgSlide_imageLayouts') || '{}');
        delete layouts[trimmed];
        if (filename) delete layouts[filename];
        sessionStorage.setItem('orgSlide_imageLayouts', JSON.stringify(layouts));
        localStorage.setItem('orgSlide_imageLayouts', JSON.stringify(layouts));
      } catch(e) {}
      
      const savedText = sessionStorage.getItem('orgSlide_savedText') || localStorage.getItem('orgSlide_savedText');
      if (savedText && window.parseOrgMode && window.renderDeck) {
        window.renderDeck(window.parseOrgMode(savedText));
      }
    },

    saveOverride: function(originalUrl, val) {
      if (!originalUrl || !val) return;
      if (!window.ImageOverrides) window.ImageOverrides = {};
      
      const trimmed = originalUrl.trim();
      window.ImageOverrides[trimmed] = val;
      
      const filename = trimmed.split('/').pop().split('?')[0].split('#')[0];
      if (filename && filename !== trimmed) {
        window.ImageOverrides[filename] = val;
      }
      if (trimmed.startsWith('file:')) {
        window.ImageOverrides[trimmed.substring(5)] = val;
      }
      
      try {
        const stored = Object.assign(
          {},
          JSON.parse(localStorage.getItem('orgSlide_imageOverrides') || '{}'),
          window.ImageOverrides
        );
        localStorage.setItem('orgSlide_imageOverrides', JSON.stringify(stored));
        sessionStorage.setItem('orgSlide_imageOverrides', JSON.stringify(stored));
      } catch(e) {
        console.warn("Storage save failed:", e);
      }

      if (window.FolderManager && window.FolderManager.db) {
        try {
          const tx = window.FolderManager.db.transaction('imageOverrides', 'readwrite');
          tx.objectStore('imageOverrides').put({ originalUrl: trimmed, base64: val });
        } catch(e) {}
      }
    },

    handleBrokenImage: function(img) {
      if (!img) return;
      
      // Auto-resolve local images if a Folder was uploaded
      if (window.LocalFolderImages) {
        const src = img.getAttribute('data-original-url') || img.getAttribute('src') || '';
        let filename = src.split('/').pop().split('?')[0].split('#')[0];
        try { filename = decodeURIComponent(filename); } catch(e) {}
        
        const blob = window.LocalFolderImages[src] || window.LocalFolderImages[filename];
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target.result;
            img.dataset.handled = "true";
            img.classList.remove('broken');
            const container = img.closest('.org-image-container');
            if (container) {
              container.classList.remove('is-broken');
              const ui = container.querySelector('.broken-image-ui');
              if (ui) ui.remove();
            }
            const orig = img.getAttribute('data-original-url') || img.getAttribute('alt') || src;
            window.ImageManager.saveOverride(orig, e.target.result);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }

      // Show broken state UI
      img.dataset.handled = "true";
      img.classList.add('broken');
      const container = img.closest('.org-image-container');
      if (container) {
        container.classList.add('is-broken');
        
        if (!container.querySelector('.broken-image-ui')) {
          const uiDiv = document.createElement('div');
          uiDiv.className = 'broken-image-ui';
          uiDiv.innerHTML = `
            <div style="color: var(--accent); font-weight: bold; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Image Unreachable / Replace Link
            </div>
            <div style="display: flex; gap: 0.5rem; width: 85%; max-width: 440px;">
              <input type="text" class="workspace-link-input" placeholder="Paste Workspace path or Online URL..." style="flex: 1; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--code-border); background: var(--slide-bg); color: var(--text-main); font-family: var(--font-mono); font-size: 0.8rem;">
              <button class="action-btn open-btn" onclick="window.ImageManager.applyWorkspaceLink(this)">Apply</button>
            </div>
            <div style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem;">or</div>
            <button class="action-btn copy-btn" onclick="window.ImageManager.triggerUpload(this)" style="margin-top: 0.5rem;">Browse Local File...</button>
          `;
          container.appendChild(uiDiv);
        }
      }
    },

    applyWorkspaceLink: function(btn) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      const img = container.querySelector('img.org-image');
      const input = container.querySelector('.workspace-link-input');
      let path = input ? input.value.trim() : '';
      if (!path) return;
      
      const originalUrl = img ? (
        img.getAttribute('data-original-url') ||
        img.getAttribute('alt') ||
        img.getAttribute('src') ||
        path
      ) : path;
      
      if (path.startsWith('www.')) {
        path = 'https://' + path;
      }
      
      // 1. Direct Web/Data URL
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('//')) {
        if (img) {
          img.src = path;
          img.classList.remove('broken');
          img.dataset.handled = "true";
        }
        container.classList.remove('is-broken');
        const ui = container.querySelector('.broken-image-ui');
        if (ui) ui.remove();
        
        window.ImageManager.saveOverride(originalUrl, path);
        return;
      }
      
      // 2. Local file from uploaded folder
      const filename = path.split('/').pop().split('?')[0].split('#')[0];
      const fileBlob = window.LocalFolderImages && (
        window.LocalFolderImages[path] ||
        window.LocalFolderImages[filename] ||
        (decodeURIComponent(path) in window.LocalFolderImages ? window.LocalFolderImages[decodeURIComponent(path)] : null)
      );
      
      if (fileBlob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (img) {
            img.src = e.target.result;
            img.classList.remove('broken');
            img.dataset.handled = "true";
          }
          container.classList.remove('is-broken');
          const ui = container.querySelector('.broken-image-ui');
          if (ui) ui.remove();
          
          window.ImageManager.saveOverride(originalUrl, e.target.result);
        };
        reader.readAsDataURL(fileBlob);
        return;
      }
      
      // 3. Fallback: treat as custom path
      if (img) {
        img.src = path;
        img.classList.remove('broken');
        img.dataset.handled = "true";
      }
      container.classList.remove('is-broken');
      const ui = container.querySelector('.broken-image-ui');
      if (ui) ui.remove();
      window.ImageManager.saveOverride(originalUrl, path);
    },

    toggleFullscreen: function(btn) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      if (container.classList.contains('fullscreen-img')) {
        container.classList.remove('fullscreen-img');
        btn.classList.remove('active');
      } else {
        container.classList.add('fullscreen-img');
        btn.classList.add('active');
      }
    },

    setAlignment: function(btn, alignStr) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      
      container.classList.remove('align-left', 'align-right', 'align-center', 'align-middle', 'free-mode');
      container.style.position = '';
      container.style.left = '';
      container.style.top = '';
      container.classList.add('align-' + alignStr);
      
      if (window.ImageManager.saveLayout) {
        window.ImageManager.saveLayout(container);
      }
      
      const toolbar = container.querySelector('.image-toolbar');
      if (toolbar) {
        const alignBtns = toolbar.querySelectorAll('button[data-align]');
        alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    },

    triggerUpload: function(btn) {
      const container = btn.closest('.org-image-container');
      if (!container) return;
      const img = container.querySelector('img.org-image');
      if (!img) return;
      
      const originalUrl = img.getAttribute('data-original-url') || img.getAttribute('alt') || img.getAttribute('src');
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          img.src = event.target.result;
          img.classList.remove('broken');
          img.dataset.handled = "true";
          container.classList.remove('is-broken');
          const ui = container.querySelector('.broken-image-ui');
          if (ui) ui.remove();
          
          window.ImageManager.saveOverride(originalUrl, event.target.result);
        };
        reader.onerror = () => {
          alert("Failed to read the image file.");
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };
})();
