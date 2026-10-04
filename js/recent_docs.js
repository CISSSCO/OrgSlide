// Recently Opened Documents Manager (Persists in sessionStorage until browser restart)
window.RecentDocs = {
  STORAGE_KEY: 'orgSlide_recentDocs',

  getDocs: function() {
    try {
      return JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch(e) {
      return [];
    }
  },

  addDoc: function(name, text) {
    if (!name || !text) return;
    let docs = this.getDocs();
    
    // Remove if already exists with the same name to move to front
    docs = docs.filter(d => d.name !== name);
    
    // Calculate slide count and preview title
    let slideCount = 1;
    let firstTitle = '';
    try {
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') && !firstTitle) {
          firstTitle = trimmed.substring(2).trim();
        }
      }
      const headers = lines.filter(l => l.trim().startsWith('* '));
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

    // Limit to max 10 recent documents
    if (docs.length > 10) docs = docs.slice(0, 10);

    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
    } catch(e) {}

    this.render();
  },

  removeDoc: function(name, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    let docs = this.getDocs().filter(d => d.name !== name);
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
    } catch(e) {}
    this.render();
  },

  clear: function() {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch(e) {}
    this.render();
  },

  openDoc: function(name) {
    const doc = this.getDocs().find(d => d.name === name);
    if (!doc) return;

    if (window.resetPresentationState) {
      window.resetPresentationState();
    }

    try {
      sessionStorage.setItem('orgSlide_savedText', doc.text);
      localStorage.setItem('orgSlide_savedText', doc.text);
    } catch(e) {}

    // Move to top of recent list
    this.addDoc(doc.name, doc.text);

    const landing = document.getElementById('landingPage');
    if (landing) {
      landing.classList.remove('active');
      landing.style.display = '';
    }

    if (window.parseOrgMode && window.renderDeck) {
      const parsed = window.parseOrgMode(doc.text);
      window.globalSlideData = parsed;
      window.renderDeck(parsed);
    }
  },

  render: function() {
    const container = document.getElementById('recentDocsContainer');
    const list = document.getElementById('recentDocsList');
    if (!container || !list) return;

    const docs = this.getDocs();
    if (!docs || docs.length === 0) {
      container.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = docs.map(doc => `
      <div class="recent-doc-item" onclick="window.RecentDocs.openDoc('${this.escapeAttr(doc.name)}')" title="Click to open ${this.escapeAttr(doc.name)}">
        <div class="recent-doc-info">
          <svg class="recent-doc-icon" viewBox="0 0 24 24" width="20" height="20" stroke="var(--primary, #38bdf8)" stroke-width="2" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <div style="text-align: left; overflow: hidden;">
            <div class="recent-doc-title">${this.escapeHtml(doc.name)}</div>
            <div class="recent-doc-meta">${doc.slideCount} slides &bull; Opened ${this.escapeHtml(doc.time)}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span class="recent-doc-open-tag">Open</span>
          <button class="recent-doc-remove" onclick="window.RecentDocs.removeDoc('${this.escapeAttr(doc.name)}', event)" title="Remove from list">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  escapeHtml: function(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  escapeAttr: function(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
};

// Render on page load
window.addEventListener('DOMContentLoaded', () => {
  if (window.RecentDocs) {
    window.RecentDocs.render();
  }
});
