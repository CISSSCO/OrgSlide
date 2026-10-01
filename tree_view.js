// tree_view.js
// Provides an interactive Table of Contents / Tree View for OrgSlide

(function() {
  // 1. Inject CSS for the Tree View Modal
  const style = document.createElement('style');
  style.textContent = `
    .tree-modal {
      position: fixed;
      inset: 0;
      background: var(--slide-bg);
      z-index: 3000;
      display: none;
      flex-direction: column;
      padding: 1rem 2rem;
      color: var(--text-main);
    }
    .tree-modal.active {
      display: flex;
    }
    .tree-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      flex-shrink: 0;
    }
    .tree-header h1 {
      font-family: var(--font-heading);
      color: var(--primary);
      font-size: 1.5rem;
      margin: 0;
    }
    .tree-controls {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .tree-btn {
      background: var(--code-bg);
      color: var(--text-main);
      border: 1px solid var(--code-border);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      font-family: var(--font-heading);
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .tree-btn:hover {
      background: var(--code-border);
    }
    .tree-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
    
    .canvas-controls {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      gap: 0.5rem;
      background: var(--slide-bg);
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid var(--code-border);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 4000;
    }
    
    .tree-viewport {
      flex: 1;
      overflow: auto;
      position: relative;
      border-radius: 8px;
      background: var(--slide-bg);
      cursor: grab;
    }
    
    .tree-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      transition: zoom 0.1s ease-out;
      margin: 0 auto;
    }
    
    /* Global tree-item styles */
    .tree-item {
      cursor: pointer;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      transition: background 0.2s, transform 0.1s, border-color 0.2s;
      border: 1px solid transparent;
      position: relative;
      outline: none;
    }
    .tree-item:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.3);
    }
    .tree-item:hover {
      background: rgba(2, 132, 199, 0.1);
      border-color: rgba(2, 132, 199, 0.2);
    }
    .tree-item.is-active {
      border-color: var(--primary) !important;
      background: rgba(2, 132, 199, 0.15) !important;
      box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4) !important;
    }
    
    .tree-item-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tree-item-name {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .tree-item-slide {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      background: var(--code-bg);
      padding: 0.15rem 0.4rem;
      border-radius: 12px;
      border: 1px solid var(--code-border);
    }

    .slide-preview-container { display: none; }
    
    /* Collapse Toggle for text-mode views */
    .collapse-toggle { display: none; }
    .collapse-toggle { 
      display: inline-flex; align-items: center; justify-content: center; 
      width: 1.2rem; height: 1.2rem; border-radius: 4px; background: var(--code-bg); 
      border: 1px solid var(--code-border); margin-left: 0.5rem; 
      font-family: monospace; font-weight: bold; font-size: 0.8rem; cursor: pointer; color: var(--text-main);
    }
    .collapse-toggle:hover { background: var(--primary); color: white; border-color: var(--primary); }
    
    .collapse-toggle::before { content: "-"; }
    li.level-collapsed > .tree-item .collapse-toggle::before,
    li.manual-collapsed > .tree-item .collapse-toggle::before { content: "+"; }
    
    /* Collapse Toggle for Overview mode */
    .overview-collapse-toggle { display: none; }
    .view-overview .overview-collapse-toggle {
      display: flex; position: absolute; bottom: -1rem; left: 50%; transform: translateX(-50%);
      width: 2rem; height: 2rem; border-radius: 50%; background: var(--code-bg);
      color: var(--text-main); align-items: center; justify-content: center; z-index: 10;
      cursor: pointer; font-weight: bold; font-family: monospace; border: 2px solid var(--code-border);
      transition: all 0.2s;
    }
    .view-overview .overview-collapse-toggle:hover { background: var(--primary); border-color: var(--primary); color: white; }
    
    .overview-collapse-toggle::before { content: "-"; }
    li.level-collapsed > .tree-item .overview-collapse-toggle::before,
    li.manual-collapsed > .tree-item .overview-collapse-toggle::before { content: "+"; }

    /* Hide children logic! 
       Level filters apply globally.
       Manual collapse ONLY applies in Tree & Overview so it doesn't break List/Cards! */
    li.level-collapsed > ul { display: none !important; }
    .view-tree li.manual-collapsed > ul,
    .view-overview li.manual-collapsed > ul { display: none !important; }

    /* -------------------------------------------
       1. Details View (The old straight-line tree) 
       ------------------------------------------- */
    .view-details ul, .view-details li { display: contents; } 
    .view-details { gap: 0.15rem; display: flex; flex-direction: column; width: 100%; max-width: 1000px; padding-bottom: 4rem; }
    .view-details .tree-level-1 { font-size: 1.15rem; font-weight: bold; color: var(--primary); margin-top: 1rem; border-bottom: 2px solid var(--code-border); padding-bottom: 0.5rem; border-radius: 0; }
    .view-details .tree-level-2 { font-size: 1rem; margin-left: 1.5rem; color: var(--secondary); font-weight: 600; border-left: 2px solid rgba(2, 132, 199, 0.4); padding-left: 1rem; border-radius: 0; }
    .view-details .tree-level-3 { font-size: 0.95rem; margin-left: 3.5rem; color: var(--text-main); font-weight: 400; font-style: italic; border-left: 2px dashed rgba(148, 163, 184, 0.4); padding-left: 1rem; border-radius: 0; }
    .view-details .tree-level-4 { font-size: 0.85rem; margin-left: 5.5rem; color: var(--text-muted); padding-left: 1rem; }
    .view-details .tree-item:hover { background: transparent; transform: translateX(6px); }
    .view-details .tree-item:hover .tree-item-title { color: var(--primary); }
    .view-details .collapse-toggle { display: none; }

    /* -------------------------------------------
       2. Compact List View 
       ------------------------------------------- */
    .view-list ul, .view-list li { display: contents; } 
    .view-list { gap: 0; display: flex; flex-direction: column; width: 100%; max-width: 1000px; padding-bottom: 4rem; }
    .view-list .tree-item { margin-left: 0 !important; margin-top: 0 !important; border-bottom: 1px solid var(--code-border); border-radius: 0; padding: 0.4rem 0.6rem; }
    .view-list .tree-item-title { font-size: 0.9rem; font-weight: normal; }
    .view-list .tree-level-1 .tree-item-title { font-weight: bold; color: var(--primary); font-size: 0.95rem; }
    .view-list .collapse-toggle { display: none; }
    
    /* -------------------------------------------
       3. Modern Card View 
       ------------------------------------------- */
    .view-card ul, .view-card li { display: contents; } 
    .view-card.tree-content { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; padding: 0.5rem; width: 100%; max-width: 1200px; padding-bottom: 4rem; }
    .view-card .tree-item { margin: 0 !important; background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 12px; padding: 1.2rem 1rem; display: flex; flex-direction: column; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); height: 100%; transition: all 0.3s ease; }
    .view-card .tree-item:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-color: var(--primary); background: var(--slide-bg); }
    .view-card .tree-item-title { flex-direction: column; justify-content: space-between; gap: 1rem; width: 100%; height: 100%; }
    .view-card .tree-item-name { flex-direction: column; gap: 0.5rem; justify-content: center; }
    .view-card .tree-item-slide { background: var(--primary); color: #fff; border: none; font-size: 0.75rem; padding: 0.3rem 0.8rem; font-weight: bold; align-self: center; }
    .view-card .tree-level-1 { font-size: 1.1rem; font-weight: bold; color: var(--primary); }
    .view-card .tree-level-2 { font-size: 1rem; color: var(--secondary); font-weight: 600; }
    .view-card .tree-level-3 { font-size: 0.9rem; color: var(--text-main); font-style: italic; }
    .view-card .collapse-toggle { display: none; }

    /* -------------------------------------------
       4 & 5. Mindmap (Tree) and Overview 
       (Both use the same beautiful infinite canvas tree structure)
       ------------------------------------------- */
    .view-tree, .view-overview {
      display: flex; flex-direction: row; align-items: center; justify-content: center;
      padding: 10rem; width: max-content; min-width: 100%;
    }
    .view-tree ul, .view-overview ul {
      display: flex; flex-direction: column; position: relative; padding-left: 3rem; margin: 0; list-style: none;
    }
    .view-tree li, .view-overview li {
      position: relative; display: flex; align-items: center; padding: 0.5rem 0;
    }
    
    /* Perfect Orthogonal Mindmap Lines */
    .view-tree li::before, .view-overview li::before {
      content: ""; position: absolute; left: -3rem; top: 50%; width: 3rem; border-top: 2px solid var(--secondary); z-index: 0;
    }
    .view-tree li::after, .view-overview li::after {
      content: ""; position: absolute; left: -3rem; top: 0; height: 100%; border-left: 2px solid var(--secondary); z-index: 0;
    }
    /* Trim lines for first/last children */
    .view-tree li:first-child::after, .view-overview li:first-child::after { top: 50%; height: 50%; }
    .view-tree li:last-child::after, .view-overview li:last-child::after { height: 50%; }
    .view-tree li:first-child:last-child::after, .view-overview li:first-child:last-child::after { display: none; }
    
    /* Hide lines for root node */
    .view-tree .tree-root-ul, .view-overview .tree-root-ul { padding-left: 0; gap: 3rem; }
    .view-tree .tree-root-ul > li::before, .view-overview .tree-root-ul > li::before { display: none; }
    .view-tree .tree-root-ul > li::after, .view-overview .tree-root-ul > li::after { display: none; }

    /* Node content in Mindmap mode */
    .view-tree .tree-item {
      background: var(--code-bg); border: 1px solid var(--code-border); border-radius: 8px; 
      padding: 0.5rem 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); white-space: nowrap; z-index: 2;
    }
    .view-tree .tree-item:hover { border-color: var(--primary); transform: scale(1.05); }
    .view-tree .tree-item-slide { display: none; }
    .view-tree .tree-item-name { gap: 0.4rem; font-size: 0.9rem; font-weight: 500; }
    .view-tree .tree-level-1 { font-size: 1.05rem; font-weight: bold; color: var(--primary); border: 2px solid var(--primary); }

    /* Node content in Overview mode (Preview boxes) */
    .view-overview .tree-item { 
      margin: 0 !important; border-radius: 8px; padding: 0; 
      width: 280px; height: 180px; overflow: visible; position: relative; display: block; 
      background: var(--slide-bg); border: 2px solid var(--code-border); 
      box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.2s, border-color 0.2s;
      z-index: 2;
    }
    .view-overview .tree-item:hover { border-color: var(--primary); transform: scale(1.05); z-index: 20; }
    .view-overview .tree-item-title { display: none; }
    .view-overview .slide-preview-container { 
      display: block; width: 100%; height: 100%; position: relative; overflow: hidden; pointer-events: none; border-radius: 6px;
    }
    .view-overview .slide-preview-content {
      width: 800px; height: 600px; transform-origin: top left; transform: scale(0.35); 
      padding: 2rem; background: var(--slide-bg); color: var(--text-main); font-size: 1.2rem;
    }
    .view-overview .slide-preview-content h2 { font-family: var(--font-heading); color: var(--primary); margin-bottom: 1rem; font-size: 2.2rem; border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }
    .view-overview .slide-number-overlay {
      position: absolute; bottom: 0.5rem; right: 0.5rem; background: var(--primary); color: #fff; 
      font-size: 0.7rem; font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; z-index: 10;
    }

    .badge {
      font-size: 0.65rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      background: var(--primary);
      color: white;
      text-transform: uppercase;
      font-family: var(--font-mono);
    }
  `;
  document.head.appendChild(style);

  // 2. Inject HTML Structure for the Modal
  const modal = document.createElement('div');
  modal.id = 'treeModal';
  modal.className = 'tree-modal';
  
  // Isolate clicks completely
  modal.addEventListener('click', (e) => e.stopPropagation());

  modal.innerHTML = `
    <div class="tree-header">
      <h1>Presentation Outline</h1>
      <div class="tree-controls">
        <button class="tree-btn active" id="btn-view-tree" onclick="window.treeView.setView('tree')">Tree</button>
        <button class="tree-btn" id="btn-view-list" onclick="window.treeView.setView('list')">List</button>
        <button class="tree-btn" id="btn-view-details" onclick="window.treeView.setView('details')">Details</button>
        <button class="tree-btn" id="btn-view-card" onclick="window.treeView.setView('card')">Cards</button>
        <button class="tree-btn" id="btn-view-overview" onclick="window.treeView.setView('overview')" style="background: var(--secondary); color: white; border-color: var(--secondary);">Overview</button>
        <span style="border-left: 1px solid var(--code-border); height: 1.2rem; margin: 0 0.2rem;"></span>
        <button class="tree-btn" id="btn-lvl-1" onclick="window.treeView.setLevel(1)">Level 1</button>
        <button class="tree-btn" id="btn-lvl-2" onclick="window.treeView.setLevel(2)">Level 2</button>
        <button class="tree-btn active" id="btn-lvl-3" onclick="window.treeView.setLevel(99)">All Levels</button>
        <span style="border-left: 1px solid var(--code-border); height: 1.2rem; margin: 0 0.2rem;"></span>
        <button class="tree-btn" onclick="window.treeView.close()" style="background: transparent; color: #ef4444; border-color: #ef4444;">Close (Esc)</button>
      </div>
    </div>
    <div id="treeViewport" class="tree-viewport">
      <div id="treeContent" class="tree-content view-tree"></div>
    </div>
    <div class="canvas-controls" id="canvasControls">
      <button class="tree-btn" onclick="window.treeView.zoomIn()">Zoom In (+)</button>
      <button class="tree-btn" onclick="window.treeView.zoomOut()">Zoom Out (-)</button>
      <button class="tree-btn" onclick="window.treeView.fitZoom()">Fit to Page</button>
      <button class="tree-btn" onclick="window.treeView.centerZoom()">Center</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Drag to Pan & Pinch to Zoom Logic for Viewport
  const viewport = document.getElementById('treeViewport');
  let isDragging = false, startX, startY, scrollLeft, scrollTop;
  let initialPinchDistance = null;
  let initialZoom = 1;

  function getClientPos(e) {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function onDragStart(e) {
    if (e.target.closest('.tree-item') || e.target.closest('.tree-btn') || e.target.closest('.collapse-toggle') || e.target.closest('.overview-collapse-toggle')) return;
    isDragging = true;
    viewport.style.cursor = 'grabbing';
    
    const pos = getClientPos(e);
    startX = pos.x - viewport.offsetLeft;
    startY = pos.y - viewport.offsetTop;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
  }

  function onDragEnd() { 
    isDragging = false; 
    viewport.style.cursor = 'grab'; 
    initialPinchDistance = null;
  }

  function onDragMove(e) {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      
      if (!initialPinchDistance) {
        initialPinchDistance = dist;
        initialZoom = window.treeView ? currentZoom : 1;
        return;
      }
      
      if (window.treeView && (activeView === 'tree' || activeView === 'overview')) {
        const scale = dist / initialPinchDistance;
        currentZoom = Math.min(Math.max(initialZoom * scale, 0.1), 3);
        window.treeView.updateZoomCSS();
      }
      return;
    }

    if (!isDragging) return;
    e.preventDefault();

    const pos = getClientPos(e);
    const x = pos.x - viewport.offsetLeft;
    const y = pos.y - viewport.offsetTop;
    viewport.scrollLeft = scrollLeft - ((x - startX) * 1.5);
    viewport.scrollTop = scrollTop - ((y - startY) * 1.5);
  }

  viewport.addEventListener('mousedown', onDragStart);
  viewport.addEventListener('mouseleave', onDragEnd);
  viewport.addEventListener('mouseup', onDragEnd);
  viewport.addEventListener('mousemove', onDragMove);

  // Add Touch Gestures
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isDragging = false;
    } else {
      onDragStart(e);
    }
  }, { passive: false });
  viewport.addEventListener('touchend', onDragEnd);
  viewport.addEventListener('touchcancel', onDragEnd);
  viewport.addEventListener('touchmove', onDragMove, { passive: false });

  // Pinch-to-Zoom / Ctrl+Wheel
  viewport.addEventListener('wheel', (e) => {
    if (activeView !== 'tree' && activeView !== 'overview') return;
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY > 0) window.treeView.zoomOut();
      else window.treeView.zoomIn();
    }
  }, { passive: false });

  // 3. State & Logic
  let currentSlides = [];
  let updateCb = null;
  let expandLevel = 99; // Tracks what level should be expanded by default
  let currentZoom = 1;
  let activeView = sessionStorage.getItem('orgSlide_tocView') || 'tree';

  window.treeView = {
    show: function(slidesData, cb, activeIndex = 0) {
      if (!slidesData || slidesData.length === 0) {
        alert("Please load a presentation first!");
        return;
      }
      currentSlides = slidesData;
      updateCb = cb;
      this.activeIndex = activeIndex;
      modal.classList.add('active');
      
      // Force reset to All Levels so it doesn't get stuck collapsed!
      expandLevel = 99;
      document.getElementById('btn-lvl-1').classList.remove('active');
      document.getElementById('btn-lvl-2').classList.remove('active');
      document.getElementById('btn-lvl-3').classList.add('active');

      this.setView(activeView); // Enforce saved view
      this.render();
      
      setTimeout(() => {
        const activeItem = modal.querySelector('.tree-item.is-active');
        if (activeItem) {
          activeItem.focus();
          // Center the active node precisely in the viewport
          const itemRect = activeItem.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();
          
          viewport.scrollLeft += (itemRect.left - viewportRect.left) - (viewportRect.width / 2) + (itemRect.width / 2);
          viewport.scrollTop += (itemRect.top - viewportRect.top) - (viewportRect.height / 2) + (itemRect.height / 2);
        } else {
          const first = modal.querySelector('.tree-item');
          if (first) first.focus();
          this.centerZoom();
        }
      }, 50);
    },
    
    close: function() {
      modal.classList.remove('active');
    },
    
    setView: function(view) {
      activeView = view;
      sessionStorage.setItem('orgSlide_tocView', view);
      document.getElementById('treeContent').className = 'tree-content view-' + view;
      ['tree', 'list', 'details', 'card', 'overview'].forEach(v => {
        const btn = document.getElementById('btn-view-' + v);
        if (btn) {
          if (v === 'overview') {
            btn.style.opacity = (view === v) ? '1' : '0.7';
            btn.style.transform = (view === v) ? 'scale(1.05)' : 'none';
          } else {
            btn.classList.toggle('active', v === view);
          }
        }
      });
      document.getElementById('canvasControls').style.display = (view === 'tree' || view === 'overview') ? 'flex' : 'none';
      this.updateZoomCSS();
      this.centerZoom();
    },

    zoomIn: function() { currentZoom = Math.min(currentZoom * 1.15, 3); this.updateZoomCSS(); },
    zoomOut: function() { currentZoom = Math.max(currentZoom * 0.85, 0.1); this.updateZoomCSS(); },
    fitZoom: function() {
      const content = document.getElementById('treeContent');
      // temporarily reset to measure true size
      content.style.zoom = 1;
      const contentW = content.offsetWidth;
      const contentH = content.offsetHeight;
      const scaleX = viewport.clientWidth / contentW;
      const scaleY = viewport.clientHeight / contentH;
      currentZoom = Math.max(0.1, Math.min(scaleX, scaleY, 2));
      this.updateZoomCSS();
      this.centerZoom();
    },
    centerZoom: function() {
      setTimeout(() => {
        viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
        viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
      }, 10);
    },
    updateZoomCSS: function() {
      const content = document.getElementById('treeContent');
      if (activeView === 'tree' || activeView === 'overview') {
        content.style.zoom = currentZoom;
      } else {
        content.style.zoom = 1;
      }
    },
    
    setLevel: function(lvl) {
      expandLevel = lvl;
      ['btn-lvl-1', 'btn-lvl-2', 'btn-lvl-3'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
      });
      if (lvl === 1 && document.getElementById('btn-lvl-1')) document.getElementById('btn-lvl-1').classList.add('active');
      if (lvl === 2 && document.getElementById('btn-lvl-2')) document.getElementById('btn-lvl-2').classList.add('active');
      if (lvl === 99 && document.getElementById('btn-lvl-3')) document.getElementById('btn-lvl-3').classList.add('active');
      
      this.render();
      setTimeout(() => this.centerZoom(), 10);
    },
    
    goTo: function(index) {
      // Decouple to guarantee clicks don't double-trigger things
      setTimeout(() => {
        this.close();
        if(updateCb) updateCb(index);
      }, 10);
    },

    toggleNode: function(e, btn) {
      e.stopPropagation();
      const li = btn.closest('li');
      
      // If it was hidden globally by the level filter, expanding it overrides the filter!
      if (li.classList.contains('level-collapsed')) {
         li.classList.remove('level-collapsed');
      } else {
         // Otherwise toggle manual collapse (which only applies to Tree/Overview)
         li.classList.toggle('manual-collapsed');
      }
    },
    
    render: function() {
      const content = document.getElementById('treeContent');
      content.innerHTML = '';
      
      let rootNode = { slide: { title: "Title Slide", level: 0 }, index: 0, children: [] };
      let path = [rootNode];

      // DO NOT filter by level anymore! Build the complete tree.
      currentSlides.forEach((slide, idx) => {
        if (slide.isTitle) return; // Skip title slide since rootNode represents it
        
        let node = { slide: slide, index: idx, children: [] };
        while (path.length > 1 && path[path.length - 1].slide.level >= slide.level) {
          path.pop();
        }
        path[path.length - 1].children.push(node);
        path.push(node);
      });

      const self = this;
      function renderNode(node, isRoot = false) {
         let li = document.createElement('li');
         
         // Level filter collapsing
         if (isRoot || (node.slide && node.slide.level < expandLevel)) {
           // Fully expanded
         } else {
           // Hidden by default due to Level button selection
           li.classList.add('level-collapsed');
         }
         
         let item = document.createElement('a');
         item.href = '#';
         const styleLevel = isRoot ? 1 : Math.min(node.slide.level, 4);
         let classStr = 'tree-item tree-level-' + styleLevel;
         if (node.index === self.activeIndex) {
           classStr += ' is-active';
         }
         item.className = classStr;
         item.setAttribute('tabindex', '0');
         item.style.textDecoration = 'none'; // Prevent default hyperlink underline
         item.style.color = 'inherit';
         
         // Guarantee bulletproof navigation
         item.onclick = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            self.goTo(node.index); 
         };

         let badgeHtml = '';
         if (isRoot) badgeHtml = '<span class="badge" style="background:var(--primary)">START</span>';
         else if (node.slide.level === 1) badgeHtml = '<span class="badge" style="background:var(--primary)">SEC</span>';
         else if (node.slide.level === 2) badgeHtml = '<span class="badge" style="background:var(--secondary)">SUB</span>';
         else badgeHtml = '<span class="badge" style="background:#64748b">ITEM</span>';

         let collapseHtml = '';
         let collapseHtmlOverview = '';
         if (node.children.length > 0) {
           collapseHtml = `<span class="collapse-toggle" onclick="window.treeView.toggleNode(event, this)"></span>`;
           collapseHtmlOverview = `<div class="overview-collapse-toggle" onclick="window.treeView.toggleNode(event, this)"></div>`;
         }

         const safeBody = node.slide.body ? node.slide.body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") : "";
         const previewBody = isRoot ? '<p style="text-align:center;">Title Slide</p>' : safeBody;
         const previewTitleClass = isRoot ? 'style="font-size:3rem; text-align:center;"' : '';

         // Revert numbering to perfectly match original 1-indexed scheme
         const slideNumText = 'Slide ' + (node.index + 1);

         item.innerHTML = `
            <div class="tree-item-title">
              <div class="tree-item-name">
                ${badgeHtml}
                <span>${node.slide.title}</span>
                ${collapseHtml}
              </div>
              <span class="tree-item-slide">${slideNumText}</span>
            </div>
            <div class="slide-preview-container">
              <div class="slide-preview-content">
                <h2 ${previewTitleClass}>${node.slide.title}</h2>
                ${previewBody}
              </div>
              <div class="slide-number-overlay">${slideNumText}</div>
            </div>
            ${collapseHtmlOverview}
         `;
         li.appendChild(item);

         if (node.children.length > 0) {
            let ul = document.createElement('ul');
            node.children.forEach(child => ul.appendChild(renderNode(child)));
            li.appendChild(ul);
         }
         return li;
      }

      let rootUl = document.createElement('ul');
      rootUl.className = 'tree-root-ul';
      rootUl.appendChild(renderNode(rootNode, true));
      content.appendChild(rootUl);
    }
  };

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      window.treeView.close();
      return;
    }
    
    const items = Array.from(modal.querySelectorAll('.tree-item'));
    if (items.length === 0) return;
    
    let currentIndex = items.indexOf(document.activeElement);
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault(); e.stopPropagation();
      let next = (currentIndex + 1) % items.length;
      items[next].focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault(); e.stopPropagation();
      let prev = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      items[prev].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); e.stopPropagation();
      if (document.activeElement && document.activeElement.classList.contains('tree-item')) {
         document.activeElement.click();
      }
    }
  }, true);

})();
