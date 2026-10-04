// Interactive 8-way resize, drag-and-drop, inline corner scaling, and locking
window.Interact = {
  init: function(el) {
    if (!el) return;
    
    // 1. Create 8-way absolute resize handles for free mode if not present
    if (!el.querySelector('.resize-nw')) {
      const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
      handles.forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${dir}`;
        handle.dataset.dir = dir;
        el.appendChild(handle);
      });
      this.attachResize(el);
    }

    // 2. Create bottom-right inline corner resize handle
    if (!el.querySelector('.inline-resize-handle')) {
      const inlineHandle = document.createElement('div');
      inlineHandle.className = 'inline-resize-handle';
      inlineHandle.title = 'Drag to resize';
      el.appendChild(inlineHandle);
      this.attachInlineResize(el, inlineHandle);
    }

    // 3. Attach drag listener to image for free mode
    const imgElement = el.querySelector('img');
    if (imgElement && !el.dataset.dragAttached) {
      el.dataset.dragAttached = 'true';
      this.attachDrag(el, imgElement);
    }
  },

  enableFreeMode: function(btn) {
    const el = btn.closest('.org-image-container');
    if (!el) return;
    
    // Toggle free mode
    const isFree = el.classList.contains('free-mode');
    if (isFree) {
      el.classList.remove('free-mode');
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      btn.classList.remove('active');
    } else {
      el.classList.remove('align-left', 'align-right', 'align-center', 'align-middle');
      el.classList.add('free-mode');
      
      // Calculate current position relative to slide
      const slide = el.closest('.slide-body') || el.closest('.slide') || document.body;
      const rect = el.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      
      el.style.position = 'absolute';
      el.style.left = (rect.left - slideRect.left) + 'px';
      el.style.top = (rect.top - slideRect.top + slide.scrollTop) + 'px';
      el.style.width = rect.width + 'px';
      el.style.height = rect.height + 'px';
      
      this.init(el);
      btn.classList.add('active');
    }
    
    if (window.ImageManager && window.ImageManager.saveLayout) {
      window.ImageManager.saveLayout(el);
    }
  },

  attachDrag: function(el, handle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener('mousedown', (e) => {
      // Don't drag if locked or not in free mode
      if (!el.classList.contains('free-mode') || el.classList.contains('is-locked')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = parseFloat(el.style.left) || 0;
      initialTop = parseFloat(el.style.top) || 0;
      e.stopPropagation();
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = (initialLeft + dx) + 'px';
      el.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (window.ImageManager && window.ImageManager.saveLayout) {
          window.ImageManager.saveLayout(el);
        }
      }
    });
  },

  attachResize: function(el) {
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startW, startH, startL, startT;

    el.addEventListener('mousedown', (e) => {
      if (el.classList.contains('is-locked')) return;
      if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        currentHandle = e.target.dataset.dir;
        startX = e.clientX;
        startY = e.clientY;
        const rect = el.getBoundingClientRect();
        startW = rect.width;
        startH = rect.height;
        startL = parseFloat(el.style.left) || 0;
        startT = parseFloat(el.style.top) || 0;
        e.stopPropagation();
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (currentHandle.includes('e')) el.style.width = Math.max(50, (startW + dx)) + 'px';
      if (currentHandle.includes('s')) el.style.height = Math.max(50, (startH + dy)) + 'px';
      
      if (currentHandle.includes('w')) {
        el.style.width = Math.max(50, (startW - dx)) + 'px';
        el.style.left = (startL + dx) + 'px';
      }
      if (currentHandle.includes('n')) {
        el.style.height = Math.max(50, (startH - dy)) + 'px';
        el.style.top = (startT + dy) + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        currentHandle = null;
        if (window.ImageManager && window.ImageManager.saveLayout) {
          window.ImageManager.saveLayout(el);
        }
      }
    });
  },

  attachInlineResize: function(el, handle) {
    let isResizing = false;
    let startX, startW;

    handle.addEventListener('mousedown', (e) => {
      if (el.classList.contains('is-locked')) return;
      isResizing = true;
      startX = e.clientX;
      startW = el.getBoundingClientRect().width;
      e.stopPropagation();
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const newW = Math.max(80, startW + dx);
      el.style.width = newW + 'px';
      el.style.maxWidth = '100%';
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        if (window.ImageManager && window.ImageManager.saveLayout) {
          window.ImageManager.saveLayout(el);
        }
      }
    });
  }
};
