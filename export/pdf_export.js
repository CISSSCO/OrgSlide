window.PreparePDFPreview = function(iframeDoc) {
  const removeSelectors = ['.top-controls', '.footer-nav', 'script', '.command-palette-modal', '#helpModal', '.help-hint-inline'];
  removeSelectors.forEach(sel => iframeDoc.querySelectorAll(sel).forEach(el => el.remove()));

  const pdfStyles = iframeDoc.createElement('style');
  pdfStyles.textContent = `
    html, body { overflow: visible !important; height: auto !important; display: block !important; }
    .slide-content, .slide-body { overflow: visible !important; }
    /* Hide scrollbar in the iframe so it looks cleaner in print */
    ::-webkit-scrollbar { display: none; }
  `;
  iframeDoc.head.appendChild(pdfStyles);

  const container = iframeDoc.querySelector('.deck-container');
  if (container) {
    container.style.display = 'block';
    container.style.overflow = 'visible';
    container.style.height = 'auto';
  }

  iframeDoc.querySelectorAll('.slide').forEach(s => {
    s.style.display = 'flex'; // Keep flex for standard PDF to push footer
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.position = 'relative';
    s.style.height = '1080px';
    s.style.width = '1920px';
    s.style.margin = '0';
    s.style.boxShadow = 'none';
    s.style.border = 'none';
    s.style.pageBreakAfter = 'always'; 
  });
};

window.ExportPDF = function(iframeDoc, onComplete) {
  try {
    iframeDoc.defaultView.print();
  } catch (e) {
    console.error("Print failed", e);
  }
  if (onComplete) onComplete();
};

window.PrepareExtendedPDFPreview = function(iframeDoc) {
  const removeSelectors = ['.top-controls', '.footer-nav', 'script', '.command-palette-modal', '#helpModal', '.help-hint-inline'];
  removeSelectors.forEach(sel => iframeDoc.querySelectorAll(sel).forEach(el => el.remove()));

  const pdfStyles = iframeDoc.createElement('style');
  pdfStyles.textContent = `
    /* CRITICAL FIX for page breaks: Browsers cannot break pages inside flex containers. */
    html, body, .deck-container, .slide, .slide-body { 
      display: block !important; 
      overflow: visible !important; 
      height: auto !important; 
      flex: none !important; 
    }
    
    pre, .code-block-container, .org-results-label, .ppt-table, .ppt-list li { 
      page-break-inside: avoid !important; 
      break-inside: avoid !important; 
    }
    
    /* Ensure footer stays at the end of the content naturally since flex is off */
    .slide-footer {
      margin-top: 2rem !important;
    }

    ::-webkit-scrollbar { display: none; }

    /* Set print media page rules for nice landscape A4 scaling */
    @page {
      size: landscape;
      margin: 0.5cm;
    }
  `;
  iframeDoc.head.appendChild(pdfStyles);

  iframeDoc.querySelectorAll('.slide').forEach(s => {
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.position = 'relative';
    s.style.minHeight = '1080px';
    s.style.width = '1920px';
    s.style.margin = '0';
    s.style.boxShadow = 'none';
    s.style.border = 'none';
    s.style.pageBreakAfter = 'always';
  });
};

window.ExportExtendedPDF = function(iframeDoc, onComplete) {
  try {
    iframeDoc.defaultView.print();
  } catch (e) {
    console.error("Print failed", e);
  }
  if (onComplete) onComplete();
};
