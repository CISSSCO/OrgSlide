(function() {
  const exportOptions = [
    { id: 'html', name: 'Export as HTML', desc: 'Standalone webpage (.html) that contains all slides and themes' },
    { id: 'pdf', name: 'Export as PDF', desc: 'Download as PDF (Fixed 16:9 Slides)' },
    { id: 'pdf_extended', name: 'Export as Extended PDF', desc: 'Download as PDF (Auto-expanding pages for long code)' },
    { id: 'pptx', name: 'Export as PowerPoint', desc: 'Download as editable presentation (.pptx)' },
    { id: 'doc', name: 'Export as Word Document', desc: 'Download as editable document (.doc)' }
  ];

  let focusedIndex = 0;
  let filteredOptions = [...exportOptions];

  function renderExportList() {
    const container = document.getElementById('exportListContainer');
    if (!container) return;

    if (filteredOptions.length === 0) {
      container.innerHTML = `<div style="padding: 1rem; color: var(--text-muted); text-align: center;">No export options found.</div>`;
      return;
    }

    container.innerHTML = filteredOptions.map((opt, idx) => `
      <div class="theme-option-row ${idx === focusedIndex ? 'focused' : ''}" data-opt="${opt.id}" data-index="${idx}">
        <div class="theme-left" style="flex-direction: column; align-items: flex-start; gap: 0.2rem;">
          <span class="font-name" style="font-weight: 600; color: var(--text-main);">${opt.name}</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${opt.desc}</span>
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

      const updateFocusedExportUI = () => {
        container.querySelectorAll('.theme-option-row').forEach((r, idx) => {
          r.classList.toggle('focused', idx === focusedIndex);
        });
      };

      container.addEventListener('pointerup', (e) => {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        const elapsed = Date.now() - startTime;
        if (dx < 30 && dy < 30 && elapsed < 800) {
          const row = e.target.closest('.theme-option-row');
          if (row) {
            focusedIndex = parseInt(row.getAttribute('data-index'), 10);
            updateFocusedExportUI();
            selectExport(row.getAttribute('data-opt'));
          }
        }
      });

      container.addEventListener('click', (e) => {
        const row = e.target.closest('.theme-option-row');
        if (row) {
          focusedIndex = parseInt(row.getAttribute('data-index'), 10);
          updateFocusedExportUI();
          selectExport(row.getAttribute('data-opt'));
        }
      });
    }

    // Direct row click fallback + desktop-only hover
    container.querySelectorAll('.theme-option-row').forEach(row => {
      row.addEventListener('click', () => {
        focusedIndex = parseInt(row.getAttribute('data-index'), 10);
        container.querySelectorAll('.theme-option-row').forEach((r, idx) => {
          r.classList.toggle('focused', idx === focusedIndex);
        });
        const opt = row.getAttribute('data-opt');
        if (opt) selectExport(opt);
      });

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        row.addEventListener('mouseenter', () => {
          focusedIndex = parseInt(row.getAttribute('data-index'), 10);
          container.querySelectorAll('.theme-option-row').forEach(r => {
            r.classList.toggle('focused', r === row);
          });
        });
      }
    });

    const focusedEl = container.querySelector('.focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  let lastSelectExportTime = 0;
  async function selectExport(optId) {
    if (!optId) return;
    const now = Date.now();
    if (now - lastSelectExportTime < 300) return;
    lastSelectExportTime = now;
    window.ExportEngine.closeModal();
    
    // Show generating overlay
    const overlay = document.createElement('div');
    overlay.className = 'command-palette-modal show';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `<div style="color: white; font-size: 1.5rem; font-weight: bold;">Generating Preview...</div>`;
    document.body.appendChild(overlay);

    let htmlString = "";
    if (window.GenerateExportHTML) {
      htmlString = await window.GenerateExportHTML();
    }

    overlay.remove();
    showPreviewModal(optId, htmlString);
  }

  function showPreviewModal(mode, htmlString) {
    const blob = new Blob([htmlString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const modal = document.createElement('div');
    modal.className = 'command-palette-modal show';
    modal.style.zIndex = '999999';
    modal.style.alignItems = 'center';
    
    let title = 'HTML Export Preview (Interactive Presentation)';
    let btnText = 'Download HTML';
    if (mode === 'pdf') {
      title = 'PDF Export Preview (Clean Slides Only)';
      btnText = 'Download PDF';
    } else if (mode === 'pdf_extended') {
      title = 'Extended PDF Preview (Auto-expanding Slides)';
      btnText = 'Download Extended PDF';
    } else if (mode === 'pptx') {
      title = 'PowerPoint Export Preview';
      btnText = 'Download PPTX';
    } else if (mode === 'doc') {
      title = 'Word Document Export Preview';
      btnText = 'Download DOC';
    }

    modal.innerHTML = `
      <div class="command-palette-content" style="max-width: 90vw; height: 90vh; display: flex; flex-direction: column;">
        <div style="padding: 1rem; border-bottom: 1px solid var(--code-border); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 1.2rem; color: var(--text-main);">${title}</h2>
          <div>
            <button id="cancelExportBtn" class="breadcrumb-btn" style="background: rgba(255,255,255,0.1); margin-right: 0.5rem;">Cancel</button>
            <button id="confirmExportBtn" class="breadcrumb-btn" style="background: var(--primary); color: white; font-weight: bold;">${btnText}</button>
          </div>
        </div>
        <div style="flex: 1; background: #fff; overflow: hidden; position: relative;">
          <iframe id="previewIframe" src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>
          <div id="pdfLoadingOverlay" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.8); color: white; justify-content: center; align-items: center; font-size: 1.5rem; flex-direction: column;">
             <span>Generating PDF... Please wait</span>
             <span style="font-size: 1rem; margin-top: 1rem; color: #aaa;">This may take a few seconds depending on presentation size.</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    const iframe = document.getElementById('previewIframe');
    function initIframePreview() {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) return;

        const deck = iframeDoc.querySelector('.deck-container');
        if (deck) {
          deck.style.display = (mode === 'pdf' || mode === 'pdf_extended' || mode === 'doc' || mode === 'pptx') ? 'block' : 'flex';
        }

        if (mode === 'pdf' && window.PreparePDFPreview) {
          window.PreparePDFPreview(iframeDoc);
        } else if (mode === 'pdf_extended' && window.PrepareExtendedPDFPreview) {
          window.PrepareExtendedPDFPreview(iframeDoc);
        } else if (mode === 'pptx') {
          const removeSelectors = [
            '.top-controls', '.footer-nav', 'script', '.command-palette-modal',
            '#helpModal', '.help-hint-inline', '#landingPage', '#folderModal',
            '#goToSlideModal', '.help-modal'
          ];
          removeSelectors.forEach(sel => iframeDoc.querySelectorAll(sel).forEach(el => el.remove()));

          if (deck) {
            deck.style.display = 'block';
            deck.style.overflow = 'visible';
            deck.style.height = 'auto';
            deck.style.padding = '2rem 1rem';
          }
          iframeDoc.querySelectorAll('.slide').forEach(s => {
            s.style.display = 'flex';
            s.style.opacity = '1';
            s.style.visibility = 'visible';
            s.style.position = 'relative';
            s.style.width = '100%';
            s.style.maxWidth = '1000px';
            s.style.minHeight = '560px';
            s.style.margin = '0 auto 2rem auto';
            s.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            s.style.borderRadius = '8px';
            s.style.background = 'var(--slide-bg, #ffffff)';
          });
        } else if (mode === 'doc') {
          const removeSelectors = [
            '.top-controls', '.footer-nav', 'script', '.command-palette-modal',
            '#helpModal', '.help-hint-inline', '#landingPage', '#folderModal',
            '#goToSlideModal', '.help-modal', '.slide-counter', '.footer-btn', '.code-actions',
            '.slide-breadcrumbs'
          ];
          removeSelectors.forEach(sel => iframeDoc.querySelectorAll(sel).forEach(el => el.remove()));

          // Apply syntax highlighting styles to code spans in preview iframe
          const hljsPreviewStyles = {
            'hljs-keyword': 'color: #d73a49; font-weight: bold;',
            'hljs-doctag': 'color: #d73a49; font-weight: bold;',
            'hljs-type': 'color: #d73a49; font-weight: bold;',
            'hljs-title': 'color: #6f42c1; font-weight: bold;',
            'hljs-attr': 'color: #005cc5;',
            'hljs-attribute': 'color: #005cc5;',
            'hljs-literal': 'color: #005cc5; font-weight: bold;',
            'hljs-number': 'color: #005cc5;',
            'hljs-variable': 'color: #005cc5;',
            'hljs-string': 'color: #032f62;',
            'hljs-regexp': 'color: #032f62;',
            'hljs-built_in': 'color: #e36209; font-weight: bold;',
            'hljs-symbol': 'color: #e36209;',
            'hljs-comment': 'color: #6a737d; font-style: italic;',
            'hljs-quote': 'color: #6a737d; font-style: italic;',
            'hljs-name': 'color: #22863a; font-weight: bold;',
            'hljs-selector-tag': 'color: #22863a; font-weight: bold;',
            'hljs-selector-pseudo': 'color: #22863a; font-weight: bold;',
            'hljs-section': 'color: #005cc5; font-weight: bold;',
            'hljs-params': 'color: #24292e;'
          };
          iframeDoc.querySelectorAll('pre code span').forEach(span => {
            let extra = '';
            for (const [cls, styleStr] of Object.entries(hljsPreviewStyles)) {
              if (span.classList.contains(cls)) extra += styleStr + ' ';
            }
            if (extra) span.setAttribute('style', ((span.getAttribute('style') || '') + '; ' + extra).trim());
          });

          if (deck) {
            deck.style.display = 'block';
            deck.style.overflow = 'visible';
            deck.style.height = 'auto';
            deck.style.maxWidth = '900px';
            deck.style.margin = '0 auto';
            deck.style.padding = '2rem 1rem';
          }
          iframeDoc.querySelectorAll('.slide').forEach(s => {
            s.style.display = 'block';
            s.style.opacity = '1';
            s.style.visibility = 'visible';
            s.style.position = 'relative';
            s.style.height = 'auto';
            s.style.width = '100%';
            s.style.margin = '0 0 2.5rem 0';
            s.style.padding = '2.5rem';
            s.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
            s.style.borderRadius = '6px';
            s.style.background = '#ffffff';
            s.style.color = '#000000';
          });
        } else if (mode === 'html') {
          if (deck) {
            deck.style.display = 'flex';
            deck.style.height = '100%';
            deck.style.width = '100%';
          }
          const slides = iframeDoc.querySelectorAll('.deck-container > .slide');
          const hasActive = Array.from(slides).some(s => s.classList.contains('active'));
          if (!hasActive && slides.length > 0) {
            slides[0].classList.add('active');
          }
        }
      } catch (e) {
        console.warn("Iframe preview init error:", e);
      }
    }

    iframe.onload = initIframePreview;
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      initIframePreview();
    }

    
    const cancelBtn = document.getElementById('cancelExportBtn');
    if (cancelBtn) {
      const handleCancel = (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        modal.remove();
        URL.revokeObjectURL(url);
      };
      cancelBtn.addEventListener('click', handleCancel);
      cancelBtn.addEventListener('touchend', handleCancel);
      cancelBtn.addEventListener('pointerup', handleCancel);
    }

    const confirmBtn = document.getElementById('confirmExportBtn');
    if (confirmBtn) {
      let isExporting = false;
      const handleConfirm = async (e) => {
        if (e && e.type === 'touchend') e.preventDefault();
        if (isExporting) return;
        isExporting = true;

        if (mode === 'html') {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'presentation_export.html';
          document.body.appendChild(a);
          a.click();
          a.remove();
          modal.remove();
          URL.revokeObjectURL(url);
        } else if (mode === 'pdf') {
        document.getElementById('pdfLoadingOverlay').style.display = 'flex';
        const iframeDoc = document.getElementById('previewIframe').contentDocument || document.getElementById('previewIframe').contentWindow.document;
        if (window.ExportPDF) {
          window.ExportPDF(iframeDoc, () => {
             modal.remove();
             URL.revokeObjectURL(url);
          });
        }
      } else if (mode === 'pdf_extended') {
        document.getElementById('pdfLoadingOverlay').style.display = 'flex';
        const iframeDoc = document.getElementById('previewIframe').contentDocument || document.getElementById('previewIframe').contentWindow.document;
        if (window.ExportExtendedPDF) {
          window.ExportExtendedPDF(iframeDoc, () => {
             modal.remove();
             URL.revokeObjectURL(url);
          });
        }
      } else if (mode === 'doc') {
        // Prepare DOM for Word Document export
        const parser = new DOMParser();
        const docDom = parser.parseFromString(htmlString, 'text/html');

        // 1. Remove page number / slide-counter, navigation, breadcrumbs, and code actions
        docDom.querySelectorAll('.slide-counter, .footer-nav, .footer-btn, .code-actions, .slide-breadcrumbs').forEach(el => el.remove());

        // 2. Inline syntax highlighting styles on code spans for full Word compatibility
        const hljsStylesMap = {
          'hljs-keyword': 'color: #d73a49; font-weight: bold;',
          'hljs-doctag': 'color: #d73a49; font-weight: bold;',
          'hljs-type': 'color: #d73a49; font-weight: bold;',
          'hljs-title': 'color: #6f42c1; font-weight: bold;',
          'hljs-attr': 'color: #005cc5;',
          'hljs-attribute': 'color: #005cc5;',
          'hljs-literal': 'color: #005cc5; font-weight: bold;',
          'hljs-number': 'color: #005cc5;',
          'hljs-variable': 'color: #005cc5;',
          'hljs-string': 'color: #032f62;',
          'hljs-regexp': 'color: #032f62;',
          'hljs-built_in': 'color: #e36209; font-weight: bold;',
          'hljs-symbol': 'color: #e36209;',
          'hljs-comment': 'color: #6a737d; font-style: italic;',
          'hljs-quote': 'color: #6a737d; font-style: italic;',
          'hljs-name': 'color: #22863a; font-weight: bold;',
          'hljs-selector-tag': 'color: #22863a; font-weight: bold;',
          'hljs-selector-pseudo': 'color: #22863a; font-weight: bold;',
          'hljs-section': 'color: #005cc5; font-weight: bold;',
          'hljs-params': 'color: #24292e;'
        };

        docDom.querySelectorAll('pre code span').forEach(span => {
          let extra = '';
          for (const [cls, styleStr] of Object.entries(hljsStylesMap)) {
            if (span.classList.contains(cls)) extra += styleStr + ' ';
          }
          if (extra) {
            span.setAttribute('style', ((span.getAttribute('style') || '') + '; ' + extra).trim());
          }
        });

        // 3. Inject Word Compatible Styles
        const wordStyles = `
          /* Microsoft Word Compatible Fallback Styles */
          body { font-family: "Calibri", "Arial", sans-serif; color: #000000; background: #ffffff; }
          h1 { color: #1e3a8a; font-size: 24pt; margin-top: 24pt; margin-bottom: 12pt; border-bottom: 1pt solid #cccccc; page-break-after: avoid; }
          h2 { color: #1e3a8a; font-size: 18pt; margin-top: 18pt; margin-bottom: 9pt; page-break-after: avoid; }
          h3 { color: #333333; font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 7pt; page-break-after: avoid; }
          pre, .code-block-container pre { 
            background-color: #f6f8fa !important; 
            border: 1pt solid #d0d7de !important; 
            padding: 10pt !important; 
            font-family: "Consolas", "Courier New", monospace !important; 
            font-size: 10pt !important;
            white-space: pre-wrap !important; 
            word-break: break-all !important;
            border-radius: 4pt !important;
          }
          code, .code-block-container code { 
            font-family: "Consolas", "Courier New", monospace !important; 
            font-size: 10pt !important; 
          }
          .code-language-badge {
            color: #57606a !important;
            font-size: 9pt !important;
            font-family: "Consolas", "Courier New", monospace !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 4pt !important;
          }
          .code-actions { display: none !important; }
          
          /* Highlight.js Syntax Highlighting for Word */
          .hljs, pre code { color: #24292e; background-color: #f6f8fa; }
          .hljs-keyword, .hljs-doctag, .hljs-type { color: #d73a49 !important; font-weight: bold; }
          .hljs-title, .hljs-title.function_, .hljs-title.class_ { color: #6f42c1 !important; font-weight: bold; }
          .hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-variable { color: #005cc5 !important; }
          .hljs-string, .hljs-regexp { color: #032f62 !important; }
          .hljs-built_in, .hljs-symbol { color: #e36209 !important; font-weight: bold; }
          .hljs-comment, .hljs-quote, .hljs-code { color: #6a737d !important; font-style: italic; }
          .hljs-name, .hljs-selector-tag, .hljs-selector-pseudo { color: #22863a !important; font-weight: bold; }
          .hljs-section { color: #005cc5 !important; font-weight: bold; }
          .hljs-params { color: #24292e !important; }
          
          /* Slide Breaks & Hide Page Numbers / Breadcrumbs */
          .slide-counter, .footer-nav, .footer-btn, .slide-breadcrumbs { display: none !important; }
          .deck-container { display: block !important; }
          .slide { 
            display: block !important; 
            opacity: 1 !important; 
            visibility: visible !important; 
            position: static !important; 
            margin-bottom: 30pt; 
            page-break-after: always; 
          }
          .slide-title { text-align: left; }
        `;

        const styleEl = docDom.createElement('style');
        styleEl.textContent = wordStyles;
        docDom.head.appendChild(styleEl);

        const docHtmlString = "<!DOCTYPE html>\n" + docDom.documentElement.outerHTML;
        
        const a = document.createElement('a');
        const blob = new Blob([docHtmlString], { type: 'application/msword' });
        const docUrl = URL.createObjectURL(blob);
        a.href = docUrl;
        a.download = 'presentation_export.doc';
        document.body.appendChild(a);
        a.click();
        a.remove();
        modal.remove();
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(docUrl);
      } else if (mode === 'pptx') {
        document.getElementById('pdfLoadingOverlay').querySelector('span').textContent = 'Generating PowerPoint... Please wait';
        document.getElementById('pdfLoadingOverlay').style.display = 'flex';
        if (window.ExportPPTX) {
          window.ExportPPTX(htmlString, () => {
             modal.remove();
             URL.revokeObjectURL(url);
          });
        } else {
           alert("PPTX export script not loaded.");
           modal.remove();
           URL.revokeObjectURL(url);
        }
      }
      };

      confirmBtn.addEventListener('click', handleConfirm);
      confirmBtn.addEventListener('touchend', handleConfirm);
      confirmBtn.addEventListener('pointerup', handleConfirm);
    }
  }

  function handleKeydown(e) {
    const modal = document.getElementById('exportEngineModal');
    if (!modal || !modal.classList.contains('show')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % filteredOptions.length;
      renderExportList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + filteredOptions.length) % filteredOptions.length;
      renderExportList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[focusedIndex]) {
        selectExport(filteredOptions[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      window.ExportEngine.closeModal();
    }
  }

  window.ExportEngine = {
    openModal: function() {
      let modal = document.getElementById('exportEngineModal');
      
      filteredOptions = [...exportOptions];
      focusedIndex = 0;

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'exportEngineModal';
        modal.className = 'command-palette-modal';
        
        modal.innerHTML = `
          <div class="command-palette-content">
            <div class="command-palette-search">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg>
              <input type="text" id="exportSearchInput" placeholder="Select Export Format..." autocomplete="off">
              <button id="applyExportBtn" class="modal-apply-btn" type="button" title="Export with chosen format">Apply</button>
            </div>
            <div id="exportListContainer" class="command-palette-list">
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const applyBtn = document.getElementById('applyExportBtn');
        if (applyBtn) {
          const handleApply = (e) => {
            if (e && e.type === 'touchend') e.preventDefault();
            if (filteredOptions[focusedIndex]) {
              selectExport(filteredOptions[focusedIndex].id);
            }
          };
          applyBtn.addEventListener('click', handleApply);
          applyBtn.addEventListener('pointerup', handleApply);
          applyBtn.addEventListener('touchend', handleApply);
        }

        document.getElementById('exportSearchInput').addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          filteredOptions = exportOptions.filter(o => o.name.toLowerCase().includes(query) || o.desc.toLowerCase().includes(query));
          focusedIndex = 0;
          renderExportList();
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) window.ExportEngine.closeModal();
        });
        modal.addEventListener('touchend', (e) => {
          if (e.target === modal) {
            e.preventDefault();
            window.ExportEngine.closeModal();
          }
        });

        document.addEventListener('keydown', handleKeydown);
      } 
      
      modal.classList.add('show');
      const input = document.getElementById('exportSearchInput');
      input.value = '';
      
      renderExportList();
      
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        setTimeout(() => {
          input.focus();
        }, 50);
      }
    },
    closeModal: function() {
      const modal = document.getElementById('exportEngineModal');
      if (modal) modal.classList.remove('show');
    }
  };
})();
