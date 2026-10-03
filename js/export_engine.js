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

    container.querySelectorAll('.theme-option-row').forEach(row => {
      row.addEventListener('click', () => {
        selectExport(row.getAttribute('data-opt'));
      });
      row.addEventListener('mouseover', () => {
        focusedIndex = parseInt(row.getAttribute('data-index'));
        renderExportList();
      });
    });

    const focusedEl = container.querySelector('.focused');
    if (focusedEl) {
      focusedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  async function selectExport(optId) {
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
    iframe.onload = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (mode === 'pdf' && window.PreparePDFPreview) {
        window.PreparePDFPreview(iframeDoc);
      } else if (mode === 'pdf_extended' && window.PrepareExtendedPDFPreview) {
        window.PrepareExtendedPDFPreview(iframeDoc);
      }
    };

    
    document.getElementById('cancelExportBtn').addEventListener('click', () => {
      modal.remove();
      URL.revokeObjectURL(url);
    });

    document.getElementById('confirmExportBtn').addEventListener('click', async () => {
      if (mode === 'html') {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presentation_export.html';
        a.click();
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
        // MS Word doesn't support CSS variables or complex modern CSS.
        // We inject a highly compatible fallback stylesheet explicitly for Word.
        const wordStyles = `
          <style>
            /* Microsoft Word Compatible Fallback Styles */
            body { font-family: "Calibri", "Arial", sans-serif; color: #000000; background: #ffffff; }
            h1 { color: #1e3a8a; font-size: 24pt; margin-top: 24pt; margin-bottom: 12pt; border-bottom: 1pt solid #cccccc; page-break-after: avoid; }
            h2 { color: #1e3a8a; font-size: 18pt; margin-top: 18pt; margin-bottom: 9pt; page-break-after: avoid; }
            h3 { color: #333333; font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 7pt; page-break-after: avoid; }
            pre { 
              background-color: #f4f4f4; 
              border: 1pt solid #dddddd; 
              padding: 10pt; 
              font-family: "Consolas", "Courier New", monospace; 
              font-size: 10pt;
              white-space: pre-wrap; 
              word-break: break-all;
            }
            code { font-family: "Consolas", "Courier New", monospace; background-color: #f4f4f4; padding: 2pt; }
            
            /* Syntax Highlighting for Word */
            .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #008000; font-style: italic; }
            .token.punctuation { color: #999999; }
            .token.namespace { opacity: .7; }
            .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #905; }
            .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #690; }
            .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #9a6e3a; }
            .token.atrule, .token.attr-value, .token.keyword { color: #07a; font-weight: bold; }
            .token.function, .token.class-name { color: #dd4a68; font-weight: bold; }
            .token.regex, .token.important, .token.variable { color: #e90; }
            
            /* Slide Breaks */
            .slide { margin-bottom: 30pt; page-break-after: always; }
            .slide-title { text-align: left; }
          </style>
        `;
        
        let docHtmlString = htmlString.replace('</head>', wordStyles + '</head>');
        
        const a = document.createElement('a');
        const blob = new Blob([docHtmlString], { type: 'application/msword' });
        a.href = URL.createObjectURL(blob);
        a.download = 'presentation_export.doc';
        a.click();
        modal.remove();
        URL.revokeObjectURL(url);
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
    });
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
            </div>
            <div id="exportListContainer" class="command-palette-list">
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('exportSearchInput').addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          filteredOptions = exportOptions.filter(o => o.name.toLowerCase().includes(query) || o.desc.toLowerCase().includes(query));
          focusedIndex = 0;
          renderExportList();
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) window.ExportEngine.closeModal();
        });

        document.addEventListener('keydown', handleKeydown);
      } 
      
      modal.classList.add('show');
      const input = document.getElementById('exportSearchInput');
      input.value = '';
      
      renderExportList();
      
      setTimeout(() => {
        input.focus();
      }, 50);
    },
    closeModal: function() {
      const modal = document.getElementById('exportEngineModal');
      if (modal) modal.classList.remove('show');
    }
  };
})();
