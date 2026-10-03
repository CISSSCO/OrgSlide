window.ExportPPTX = async function(htmlString, onComplete) {
  try {
    // 1. Load html2canvas if not present
    if (typeof html2canvas === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // 2. Load PptxGenJS if not present
    if (typeof PptxGenJS === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    // To capture properly, we use the active document DOM, but we need to iterate slides
    const slides = document.querySelectorAll('.deck-container > .slide');
    const originalActive = document.querySelector('.slide.active');
    
    // Disable smooth scrolling temporarily to speed up rendering
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Make it active to ensure it renders correctly
      slides.forEach(s => s.classList.remove('active'));
      slide.classList.add('active');
      
      // For continuous modes, it might already be visible, but let's ensure
      slide.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      // Wait a tiny bit for render
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(slide, {
        scale: 2, // higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: window.getComputedStyle(document.body).backgroundColor || '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      let pptxSlide = pptx.addSlide();
      pptxSlide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
    }

    // Restore state
    slides.forEach(s => s.classList.remove('active'));
    if (originalActive) originalActive.classList.add('active');
    if (originalActive) originalActive.scrollIntoView({ behavior: 'auto', block: 'start' });
    document.documentElement.style.scrollBehavior = originalScrollBehavior;

    // Save
    await pptx.writeFile({ fileName: 'presentation_export.pptx' });
    
    if (onComplete) onComplete();
  } catch (err) {
    console.error("PPTX Export Error:", err);
    alert("An error occurred while generating PowerPoint: " + err.message);
    if (onComplete) onComplete();
  }
};
