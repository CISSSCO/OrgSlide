(function() {
  const STORAGE_KEY = 'orgSlide_logos';
  let logos = [];

  // Load from session storage
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      logos = JSON.parse(stored);
    }
  } catch(e) {
    console.error("Failed to load logos from sessionStorage", e);
  }

  // Create UI
  const modalHTML = `
    <div id="logoModal" class="help-modal">
      <div class="help-content" style="max-width: 450px;">
        <h2>Manage Header Logos</h2>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted); text-align: center; font-size: 0.95rem;">Upload up to 3 logos. They will be displayed on the top right of each slide. (Press <kbd>Alt + I</kbd> to toggle)</p>
        
        <div id="logoPreviewContainer" style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1.5rem; min-height: 80px;">
          <!-- Previews go here -->
        </div>

        <input type="file" id="logoFileInput" accept="image/*" style="display: none;" multiple>
        
        <div id="urlInputContainer" style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem;">
          <input type="text" id="logoUrlInput" placeholder="Or paste image URL here..." style="flex: 1; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--code-border); background: var(--code-bg); color: var(--text-main); font-family: var(--font-body);">
          <button id="addUrlBtn" style="background: var(--primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-heading); transition: all 0.2s;">Add URL</button>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
          <button id="uploadLogoBtn" style="background: var(--secondary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-heading); transition: all 0.2s;">Upload Image</button>
          <button id="clearLogosBtn" style="background: var(--accent); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-heading); transition: all 0.2s;">Clear All</button>
        </div>
        
        <button class="close-help-btn" onclick="LogoManager.closeModal()">Done</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('logoModal');
  const fileInput = document.getElementById('logoFileInput');
  const previewContainer = document.getElementById('logoPreviewContainer');
  const uploadBtn = document.getElementById('uploadLogoBtn');
  const clearBtn = document.getElementById('clearLogosBtn');
  const urlInput = document.getElementById('logoUrlInput');
  const addUrlBtn = document.getElementById('addUrlBtn');
  const urlContainer = document.getElementById('urlInputContainer');

  function updatePreview() {
    previewContainer.innerHTML = '';
    logos.forEach((logo, index) => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      
      const img = document.createElement('img');
      img.src = logo;
      img.style.maxHeight = '60px';
      img.style.maxWidth = '100px';
      img.style.objectFit = 'contain';
      img.style.border = '1px solid var(--code-border)';
      img.style.borderRadius = '6px';
      img.style.background = 'white'; // for transparent logos in dark mode
      img.style.padding = '4px';
      
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '×';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '-8px';
      removeBtn.style.right = '-8px';
      removeBtn.style.background = 'var(--accent)';
      removeBtn.style.color = 'white';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '22px';
      removeBtn.style.height = '22px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.lineHeight = '1';
      removeBtn.style.padding = '0';
      removeBtn.style.fontWeight = 'bold';
      removeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      removeBtn.onclick = () => {
        logos.splice(index, 1);
        saveAndApply();
      };

      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      previewContainer.appendChild(wrapper);
    });

    uploadBtn.style.display = logos.length >= 3 ? 'none' : 'block';
    urlContainer.style.display = logos.length >= 3 ? 'none' : 'flex';
    
    // Add hover effects for buttons dynamically
    uploadBtn.onmouseenter = () => uploadBtn.style.opacity = '0.9';
    uploadBtn.onmouseleave = () => uploadBtn.style.opacity = '1';
    clearBtn.onmouseenter = () => clearBtn.style.opacity = '0.9';
    clearBtn.onmouseleave = () => clearBtn.style.opacity = '1';
  }

  function saveAndApply() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
    updatePreview();
    LogoManager.applyLogos();
  }

  uploadBtn.onclick = () => {
    fileInput.click();
  };

  addUrlBtn.onclick = () => {
    const url = urlInput.value.trim();
    if (url && logos.length < 3) {
      logos.push(url);
      urlInput.value = '';
      saveAndApply();
    }
  };

  clearBtn.onclick = () => {
    logos = [];
    saveAndApply();
  };

  fileInput.onchange = (e) => {
    const files = Array.from(e.target.files);
    
    // Process each file sequentially
    files.forEach(file => {
      if (logos.length >= 3) return; // Max 3
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 250px height to save sessionStorage space but still look sharp
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const MAX_HEIGHT = 250;
          
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          logos.push(canvas.toDataURL(file.type));
          saveAndApply();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    
    fileInput.value = ''; // Reset
  };

  // Listen for Alt + I
  window.addEventListener('keydown', (e) => {
    // Only intercept if we are not inside an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.altKey && (e.key === 'i' || e.code === 'KeyI')) {
      e.preventDefault();
      e.stopPropagation();
      if (modal.classList.contains('active')) {
        LogoManager.closeModal();
      } else {
        LogoManager.openModal();
      }
    }
    
    // Allow closing with Esc
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      e.preventDefault();
      LogoManager.closeModal();
    }
  });

  window.LogoManager = {
    openModal: () => {
      updatePreview();
      modal.classList.add('active');
    },
    closeModal: () => {
      modal.classList.remove('active');
    },
    applyLogos: () => {
      const containers = document.querySelectorAll('.slide-header-logos');
      containers.forEach(container => {
        container.innerHTML = '';
        logos.forEach(logo => {
          const img = document.createElement('img');
          img.src = logo;
          img.style.height = '55px';
          img.style.width = 'auto';
          img.style.maxWidth = '200px';
          img.style.objectFit = 'contain';
          // Optional: Add a subtle background to logos if they are transparent in dark mode
          // img.style.background = 'rgba(255, 255, 255, 0.9)';
          // img.style.borderRadius = '4px';
          // img.style.padding = '2px';
          container.appendChild(img);
        });
      });
    }
  };

  // Initial apply in case deck is already rendered (e.g. refresh)
  setTimeout(() => {
    if (document.querySelectorAll('.slide-header-logos').length > 0) {
      LogoManager.applyLogos();
    }
  }, 100);

})();
