(function() {
  window.EndSlide = {
    appendSlide: function(deckContainer) {
      // Remove any existing end slide to avoid duplicates
      const existing = document.getElementById('orgSlide-endSlide');
      if (existing) existing.remove();

      const data = window.socialLinksData || {};
      
      let endMessage = "Thanks and Open to questions.";
      if (data.endMessage !== undefined) {
        const msg = data.endMessage.trim();
        if (msg.toLowerCase() === 'na') endMessage = '';
        else if (msg !== '') endMessage = msg;
      }

      const name = (data.name && data.name.trim() !== '' && data.name.trim().toLowerCase() !== 'na') 
        ? data.name.trim() 
        : (window.globalDocAuthor || '');

      const slogan = (data.slogan && data.slogan.trim() !== '' && data.slogan.trim().toLowerCase() !== 'na') 
        ? data.slogan.trim() 
        : '';

      const slideEl = document.createElement('div');
      slideEl.className = 'slide';
      slideEl.id = 'orgSlide-endSlide';
      
      const totalSlides = window.globalSlideData ? window.globalSlideData.length + 1 : 0;
      slideEl.setAttribute('data-index', totalSlides);

      // Generate Social Links HTML for End Slide
      let socialHtml = '';
      if (window.socialIcons) {
        ['github', 'portfolio', 'repo', 'linkedin'].forEach(key => {
          const link = data[key];
          if (link && link.trim() !== '' && link.trim().toLowerCase() !== 'na') {
            let href = link.trim();
            if (!/^https?:\/\//i.test(href)) {
              href = 'https://' + href;
            }
            socialHtml += `
              <a href="${href}" target="_blank" class="end-slide-link" style="display: flex; align-items: center; gap: 0.8rem; text-decoration: none; color: var(--text-main); font-size: 1.25rem; font-weight: 500; padding: 0.8rem 1.2rem; border-radius: 8px; background: var(--code-bg); border: 1px solid var(--code-border); transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                  ${window.socialIcons[key].replace('width="16"', 'width="28"').replace('height="16"', 'height="28"')}
                </div>
                <span class="end-slide-link-text">${href.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
              </a>
            `;
          }
        });
      }

      const footerHtml = `
        <div class="slide-footer">
          <div class="footer-social-links">
            ${window.generateSocialLinksHtml ? window.generateSocialLinksHtml() : ''}
          </div>
          <div class="footer-right">
            <button class="help-hint-inline" onclick="toggleHelp()" title="Keyboard Shortcuts">
              <kbd>Alt</kbd>+<kbd>?</kbd>
            </button>
            <span class="slide-counter">End</span>
            <div class="footer-nav">
              <button class="footer-nav-btn" onclick="prev()" title="Previous Slide (Alt+K)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="footer-nav-btn" disabled style="opacity: 0.3; cursor: not-allowed;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      slideEl.innerHTML = `
        <div class="title-center" style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          ${endMessage ? `<h1 class="main-title" style="font-size: 3.5rem; color: var(--primary); margin-bottom: 2rem;">${endMessage}</h1>` : ''}
          
          ${name ? `<h2 style="font-size: 2.2rem; color: var(--secondary); font-family: var(--font-heading); margin-bottom: ${slogan ? '0.5rem' : '2.5rem'}; font-weight: bold;">${name}</h2>` : ''}
          ${slogan ? `<p style="font-size: 1.3rem; color: var(--text-muted); font-style: italic; margin-bottom: 2.5rem; max-width: 600px; line-height: 1.5;">"${slogan}"</p>` : ''}
          
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-top: 1rem; max-width: 800px;">
            ${socialHtml}
          </div>
        </div>
        ${footerHtml}
      `;

      // Add hover styles dynamically
      const styleId = 'end-slide-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          .end-slide-link:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
            border-color: var(--primary) !important;
          }
          body.theme-dark .end-slide-link {
            box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
          }
          body.theme-dark .end-slide-link:hover {
            box-shadow: 0 8px 15px rgba(0,0,0,0.4) !important;
          }
        `;
        document.head.appendChild(style);
      }

      deckContainer.appendChild(slideEl);
    },
    
    updateEndSlide: function() {
      const deckContainer = document.getElementById('deckContainer');
      const existing = document.getElementById('orgSlide-endSlide');
      if (deckContainer && existing) {
        const wasActive = existing.classList.contains('active');
        this.appendSlide(deckContainer);
        
        if (window.refreshSlidesList) {
          window.refreshSlidesList();
        }

        const newSlide = document.getElementById('orgSlide-endSlide');
        if (wasActive && newSlide) newSlide.classList.add('active');
      }
    }
  };
})();
