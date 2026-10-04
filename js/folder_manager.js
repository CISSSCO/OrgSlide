window.FolderManager = {
  db: null,
  folders: {}, // in-memory cache mapped from DB

  init: async function() {
    // Mimic sessionStorage persistence: clear DB if new browser session
    // Permanent DB. No clearing on session start.
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OrgSlideDB', 2);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        if (!db.objectStoreNames.contains('imageOverrides')) {
          db.createObjectStore('imageOverrides', { keyPath: 'originalUrl' });
        }
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'folderName' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.loadFromDB().then(resolve);
      };
      request.onerror = reject;
    });
  },

  deleteDB: function() {
    return new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('OrgSlideDB');
      req.onsuccess = resolve;
      req.onerror = resolve;
    });
  },

  loadFromDB: function() {
    return new Promise((resolve) => {
      const tx = this.db.transaction('folders', 'readonly');
      const store = tx.objectStore('folders');
      const req = store.getAll();
      req.onsuccess = () => {
        this.folders = {};
        window.LocalFolderImages = {}; // Rebuild flat cache for image renderer
        if (!window.ImageOverrides) window.ImageOverrides = {};
        try {
          const local = JSON.parse(localStorage.getItem('orgSlide_imageOverrides') || '{}');
          Object.assign(window.ImageOverrides, local);
        } catch(e) {}
        
        for (const f of req.result) {
          this.folders[f.folderName] = f.files;
          for (const fileKey in f.files) {
            window.LocalFolderImages[fileKey] = f.files[fileKey].blob;
          }
        }
        this.updateUI();
        
        // Also load overrides
        const txOverride = this.db.transaction('imageOverrides', 'readonly');
        const reqOverride = txOverride.objectStore('imageOverrides').getAll();
        reqOverride.onsuccess = () => {
           for (const ov of reqOverride.result) {
              window.ImageOverrides[ov.originalUrl] = ov.base64;
           }
           try {
             localStorage.setItem('orgSlide_imageOverrides', JSON.stringify(window.ImageOverrides));
             sessionStorage.setItem('orgSlide_imageOverrides', JSON.stringify(window.ImageOverrides));
           } catch(e) {}
           resolve();
        };
        reqOverride.onerror = () => resolve();
      };
    });
  },

  saveFolderToDB: function(folderName, filesObj) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('folders', 'readwrite');
      const store = tx.objectStore('folders');
      store.put({ folderName, files: filesObj });
      tx.oncomplete = resolve;
    });
  },

  removeFolder: async function(folderName) {
    delete this.folders[folderName];
    
    // Clean global cache
    window.LocalFolderImages = {};
    for (const fName in this.folders) {
      for (const fileKey in this.folders[fName]) {
        window.LocalFolderImages[fileKey] = this.folders[fName][fileKey].blob;
      }
    }
    
    const tx = this.db.transaction('folders', 'readwrite');
    tx.objectStore('folders').delete(folderName);
    
    this.updateUI();
    this.renderModalContent();
  },

  removeFile: async function(folderName, fileKey) {
    if (this.folders[folderName] && this.folders[folderName][fileKey]) {
      delete this.folders[folderName][fileKey];
      delete window.LocalFolderImages[fileKey];
      await this.saveFolderToDB(folderName, this.folders[folderName]);
      this.renderModalContent();
    }
  },

  handleUpload: async function(event) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    
    // Determine folder name from the first file's relative path
    let folderName = "Uploaded Folder";
    if (fileList[0].webkitRelativePath) {
      folderName = fileList[0].webkitRelativePath.split('/')[0];
    } else {
      folderName = `Folder_${Date.now().toString().slice(-6)}`;
    }
    
    const folderFiles = this.folders[folderName] || {};
    
    // Read all files as Blobs
    const promises = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      promises.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const pathKey = file.webkitRelativePath || file.name;
          const isOrg = file.name.endsWith('.org') || file.name.endsWith('.txt');
          const blob = new Blob([e.target.result], { type: file.type });
          
          folderFiles[pathKey] = {
            name: file.name,
            path: pathKey,
            isOrg: isOrg,
            blob: blob
          };
          
          // Fallback name mapping
          if (pathKey !== file.name) {
            folderFiles[file.name] = folderFiles[pathKey];
          }
          resolve();
        };
        reader.readAsArrayBuffer(file);
      }));
    }
    
    // Show a loading state if we want, but local files are fast
    await Promise.all(promises);
    
    this.folders[folderName] = folderFiles;
    await this.saveFolderToDB(folderName, folderFiles);
    await this.loadFromDB(); // Re-sync caches
    
    this.showModal();
  },
  
  updateUI: function() {
    const viewBtn = document.getElementById('viewFolderBtn');
    if (viewBtn) {
      if (Object.keys(this.folders).length > 0) {
        viewBtn.style.display = 'inline-block';
      } else {
        viewBtn.style.display = 'none';
        this.hideModal();
      }
    }
  },
  
  openOrgFile: function(blob, docName) {
    const reader = new FileReader();
    reader.onload = function(e) {
      window.FolderManager.hideModal();
      document.getElementById('landingPage').classList.remove('active');
      document.getElementById('landingPage').style.display = '';
      
      if (window.resetPresentationState) {
        window.resetPresentationState();
      }

      try {
        sessionStorage.setItem('orgSlide_savedText', e.target.result);
        localStorage.setItem('orgSlide_savedText', e.target.result);
      } catch(err) {}

      if (window.RecentDocs) {
        window.RecentDocs.addDoc(docName || "Workspace Document.org", e.target.result);
      }

      const slidesData = parseOrgMode(e.target.result);
      window.globalSlideData = slidesData;
      renderDeck(slidesData);
    };
    reader.readAsText(blob);
  },
  
  showModal: function() {
    const modal = document.getElementById('folderModal');
    if (!modal) return;
    this.renderModalContent();
    modal.classList.add('active');
  },
  
  hideModal: function() {
    const modal = document.getElementById('folderModal');
    if (modal) modal.classList.remove('active');
  },

  renderModalContent: function() {
    const container = document.getElementById('folderContentsList');
    if (!container) return;
    container.innerHTML = '';
    
    if (Object.keys(this.folders).length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No folders uploaded in this session.</div>';
      return;
    }
    
    for (const folderName in this.folders) {
      // Folder Header
      const folderHeader = document.createElement('div');
      folderHeader.className = 'folder-header';
      folderHeader.innerHTML = `
        <div class="folder-title">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          <strong>${folderName}</strong>
        </div>
        <button class="remove-folder-btn" title="Remove Folder" onclick="window.FolderManager.removeFolder('${folderName}')">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      container.appendChild(folderHeader);
      
      const fileList = document.createElement('div');
      fileList.className = 'file-list';
      
      const uniquePaths = new Set();
      for (const fileKey in this.folders[folderName]) {
        const fileData = this.folders[folderName][fileKey];
        if (uniquePaths.has(fileData.path)) continue;
        uniquePaths.add(fileData.path);
        
        const fileRow = document.createElement('div');
        fileRow.className = 'file-row';
        
        const isOrg = fileData.isOrg;
        const icon = isOrg 
          ? '<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--primary)" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
          : '<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--text-muted)" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
        
        fileRow.innerHTML = `
          <div class="file-name" title="${fileData.path}">
            ${icon}
            <span>${fileData.path}</span>
          </div>
          <div class="file-actions">
            ${isOrg ? `<button class="action-btn open-btn" onclick="window.FolderManager.openOrgFile(window.FolderManager.folders['${folderName}']['${fileKey}'].blob, '${fileData.path}')">Open</button>` : ''}
            <button class="action-btn copy-btn" onclick="navigator.clipboard.writeText('${fileData.path}'); this.textContent='Copied!'; setTimeout(()=>this.textContent='Copy Link', 1500)">Copy Link</button>
            <button class="action-btn delete-btn" onclick="window.FolderManager.removeFile('${folderName}', '${fileKey}')">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;
        fileList.appendChild(fileRow);
      }
      container.appendChild(fileList);
    }
  }
};


