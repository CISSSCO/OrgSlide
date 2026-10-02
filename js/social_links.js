(function() {
  const defaultSocialLinks = {
    endMessage: "Thanks and Open to questions.",
    name: "",
    slogan: "",
    github: "https://github.com/CISSSCO",
    portfolio: "https://ciscoramon.netlify.app",
    repo: "https://github.com/CISSSCO/OrgSlide",
    linkedin: "https://www.linkedin.com/in/abhi581b/"
  };

  window.socialLinksData = JSON.parse(sessionStorage.getItem('orgSlide_socialLinks')) || defaultSocialLinks;

  const icons = {
    github: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    portfolio: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    repo: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
  };

  window.socialIcons = icons; // export for end slide

  const titles = {
    github: "GitHub Profile",
    portfolio: "Portfolio",
    repo: "GitHub Repository",
    linkedin: "LinkedIn"
  };

  window.generateSocialLinksHtml = function() {
    let html = '';
    ['github', 'portfolio', 'repo', 'linkedin'].forEach(key => {
      const link = window.socialLinksData[key];
      if (link && link.trim() !== '' && link.trim().toLowerCase() !== 'na') {
        let href = link.trim();
        if (!/^https?:\/\//i.test(href)) {
          href = 'https://' + href;
        }
        html += `<a href="${href}" target="_blank" title="${titles[key]}">${icons[key]}</a>`;
      }
    });
    return html;
  };

  window.updateAllFooters = function() {
    const containers = document.querySelectorAll('.footer-social-links');
    const newHtml = window.generateSocialLinksHtml();
    containers.forEach(c => { c.innerHTML = newHtml; });
  };

  function initModal() {
    const modal = document.createElement('div');
    modal.className = 'help-modal'; // reuse glassmorphism class
    modal.id = 'socialLinksModal';
    modal.innerHTML = `
      <div class="help-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
        <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Edit Profile & Social Links</h2>
        <p style="text-align:center; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          These populate the footer and the final "Thank You" slide.<br>Type <strong>NA</strong> to hide a field.
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; text-align: left;">
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">End Message</label>
            <input type="text" id="social-in-endmsg" placeholder="e.g. Thanks and Open to questions." style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">Name (Author)</label>
            <input type="text" id="social-in-name" placeholder="Leave empty to use Org #+AUTHOR" style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">Slogan / Bio</label>
            <input type="text" id="social-in-slogan" placeholder="e.g. Building tools for the future" style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">GitHub Profile</label>
            <input type="text" id="social-in-github" style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">Portfolio</label>
            <input type="text" id="social-in-portfolio" style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">GitHub Repository</label>
            <input type="text" id="social-in-repo" style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
          <div>
            <label style="display:block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">LinkedIn</label>
            <input type="text" id="social-in-linkedin" style="width:100%; padding: 0.6rem; background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-main); border-radius: 6px;">
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="close-help-btn" style="background: var(--code-bg); color: var(--text-main); border: 1px solid var(--code-border);" onclick="window.socialLinksEditor.close()">Cancel</button>
          <button class="close-help-btn" style="background: var(--primary); color: white;" onclick="window.socialLinksEditor.save()">Save Profile</button>
        </div>
      </div>
    `;
    
    modal.querySelectorAll('input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          window.socialLinksEditor.save();
        } else if (e.key === 'Escape') {
          window.socialLinksEditor.close();
        }
      });
    });

    document.body.appendChild(modal);

    window.socialLinksEditor = {
      open: function() {
        document.getElementById('social-in-endmsg').value = window.socialLinksData.endMessage !== undefined ? window.socialLinksData.endMessage : "Thanks and Open to questions.";
        document.getElementById('social-in-name').value = window.socialLinksData.name || "";
        document.getElementById('social-in-slogan').value = window.socialLinksData.slogan || "";
        document.getElementById('social-in-github').value = window.socialLinksData.github || "";
        document.getElementById('social-in-portfolio').value = window.socialLinksData.portfolio || "";
        document.getElementById('social-in-repo').value = window.socialLinksData.repo || "";
        document.getElementById('social-in-linkedin').value = window.socialLinksData.linkedin || "";
        modal.classList.add('active');
        setTimeout(() => document.getElementById('social-in-endmsg').focus(), 50);
      },
      close: function() {
        modal.classList.remove('active');
      },
      save: function() {
        window.socialLinksData.endMessage = document.getElementById('social-in-endmsg').value.trim();
        window.socialLinksData.name = document.getElementById('social-in-name').value.trim();
        window.socialLinksData.slogan = document.getElementById('social-in-slogan').value.trim();
        window.socialLinksData.github = document.getElementById('social-in-github').value.trim();
        window.socialLinksData.portfolio = document.getElementById('social-in-portfolio').value.trim();
        window.socialLinksData.repo = document.getElementById('social-in-repo').value.trim();
        window.socialLinksData.linkedin = document.getElementById('social-in-linkedin').value.trim();
        
        sessionStorage.setItem('orgSlide_socialLinks', JSON.stringify(window.socialLinksData));
        window.updateAllFooters();
        if (window.EndSlide) window.EndSlide.updateEndSlide();
        this.close();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
  } else {
    initModal();
  }
})();
