---
title: OrgSlide - Complete Markdown Guide & Manual
subtitle: A Comprehensive Reference Manual for the Markdown Presentation Engine
author: Cisco Ramon
date: 2026-10-05
end_message: Thank you for exploring OrgSlide!
---

# 1. Executive Overview of OrgSlide

Welcome to **OrgSlide**, the modern, zero-dependency presentation and document engine built natively for technical professionals, researchers, and developers.

- **Unified Dual-Engine**: Seamlessly author presentations using either GNU Emacs Org-mode or CommonMark / GitHub-Flavored Markdown.
- **Client-Side Runtime**: Runs 100% in any web browser without Node.js, Python, or Ruby servers.
- **Full Typography**: Supports code highlighting, mathematical formulas, responsive data tables, task lists, and interactive image manipulation.
- **Multiple Rendering Perspectives**: Instantly switch between PowerPoint Slide, LaTeX Beamer, Continuous Book, and Tree Outline modes.

> [!NOTE]
> This entire presentation is written in plain Markdown and rendered directly by OrgSlide's built-in parser!

---

# 2. Developer Profile: Cisco Ramon (Abhi)

OrgSlide was conceptualized, architected, and engineered by **Cisco Ramon** (Abhi), an open-source software developer dedicated to crafting distraction-free tools.

![Developer Profile Card](https://avatars.githubusercontent.com/u/60824572?v=4)

- **GitHub**: [github.com/CISSSCO](https://github.com/CISSSCO)
- **Portfolio**: [ciscoramon.netlify.app](https://ciscoramon.netlify.app)
- **LinkedIn**: [linkedin.com/in/abhi581b](https://www.linkedin.com/in/abhi581b/)
- **Repository**: [github.com/CISSSCO/OrgSlide](https://github.com/CISSSCO/OrgSlide)

> "Tools should adapt to the programmer's thoughts, not constrain them to proprietary presentation software."

---

# 3. Project Vision & Open-Source Philosophy

Traditional presentation suites (PowerPoint, Keynote, Google Slides) force users into tedious manual alignment and proprietary file formats.

OrgSlide delivers an alternative paradigm based on plain-text agility:
- **Plain Text as Source of Truth**: Manage your slides in Git alongside your source code.
- **Zero Build Friction**: No Docker containers, compilation pipelines, or LaTeX engines required.
- **Distraction-Free Authoring**: Write pure Markdown or Org-mode text while letting OrgSlide generate typography and layouts.
- **Offline Resilient**: Local storage, IndexedDB asset bundling, and standalone exports ensure 100% offline functionality.

---

# 4. Core Architecture & Technical Design

OrgSlide operates on a modular, decoupled presentation pipeline:

```
[Markdown / Org Source] 
       │
       ▼ (Parser Layer: markdown_parser.js / parseOrgMode)
[Normalized Slide Objects Array]
       │
       ▼ (Render Layer: renderDeck)
[Interactive DOM Slides] ───► [Themes & Fonts Engine]
       │
       ├──► [PowerPoint / Beamer / Book / Outline Modes]
       ├──► [PDF / PPTX / Word / HTML Export Engines]
       └──► [Interactive Image & Canvas Manipulator]
```

Every slide object is normalized into structured JSON with title, breadcrumbs, hierarchy levels, and clean HTML content.

---

# 5. Quickstart Guide: Your First Markdown Deck

Getting started with Markdown presentations in OrgSlide requires zero configuration:

1. Create a new text file ending in `.md` (e.g., `deck.md`).
2. Add optional YAML frontmatter at the very top:
```yaml
---
title: My Project Showcase
author: Your Name
date: 2026-10-05
---
```
3. Separate individual slides using three hyphens (`---`):
```markdown
# Slide One Title
Here is the first slide content.

---
# Slide Two Title
Here is the second slide content.
```
4. Drag and drop `deck.md` directly onto the OrgSlide browser window!

---

# 6. Slide Delimiters: Boundaries & Headings

In OrgSlide, slides can be demarcated in two intuitive ways:

### Method A: Explicit Dividers (`---`)
Use three hyphens on a line by itself to create distinct, focused slides:
```markdown
# Slide 1
Content...
---
# Slide 2
Content...
```

### Method B: Outline Headings
Top-level headings (`#`, `##`) automatically generate slides while creating hierarchical breadcrumbs navigation.

> [!TIP]
> Use `---` before `# Heading` for clean slide pagination without creating empty slides!

---

# 7. Frontmatter Configuration & Global Metadata

You can customize global presentation properties at the very top of your Markdown file using YAML frontmatter:

```yaml
---
title: Advanced Distributed Computing
subtitle: Consensus Algorithms and Fault Tolerance
author: Cisco Ramon
date: 2026-10-05
end_message: Questions and Discussions Welcome!
---
```

- `title`: Displayed prominently on the Title Slide (Slide 1) and in the window title.
- `subtitle`: Renders directly below the title in secondary accent colors.
- `author`: Added to slide metadata and attribution footers.
- `date`: Timestamp of the presentation.
- `end_message`: Custom headline shown on the automatic closing slide.

---

# 8. Heading Hierarchy & Breadcrumbs Navigation

OrgSlide builds an interactive navigation hierarchy based on your Markdown headings:

- `# Level 1 Heading`: Primary chapter or major presentation topic.
- `## Level 2 Heading`: Detailed slide topic within the active chapter.
- `### Level 3 Heading`: In-depth sub-topic slide.

### Dynamic Breadcrumb Trail
Look at the upper-left corner of this slide:
`DOC TITLE ❯ CHAPTER ❯ SLIDE TITLE`

Every breadcrumb item is clickable, allowing your audience to jump directly to parent sections during questions!

---

# 9. Text Formatting: Bold, Italic, Strikethrough & Marks

Format your presentation body text using standard inline Markdown syntax:

- **Bold Typography**: Wrap text in `**bold**` or `__bold__` for strong visual weight.
- *Italic Emphasis*: Wrap text in `*italic*` or `_italic_` for subtle citations and quotes.
- ***Bold & Italic Combined***: Use `***text***` for high-impact emphasis.
- ~~Strikethrough~~: Wrap text in `~~strikethrough~~` to indicate deprecated concepts.
- ==Highlighted Mark==: Wrap text in `==mark==` to generate fluorescent highlight tags.
- Inline Code: Wrap text in backticks `` `code` `` for variables, functions, and commands.

---

# 10. Typography: Superscripts, Subscripts & Keys

For scientific, technical, and engineering presentations, OrgSlide provides extended typography:

### Chemical Formulas & Subscripts
- Water molecule: `H~2~O` renders as H~2~O
- Carbon dioxide: `CO~2~` renders as CO~2~
- Glucose: `C~6~H~12~O~6~` renders as C~6~H~12~O~6~

### Mathematics & Superscripts
- Mass-energy: `E = mc^2^` renders as E = mc^2^
- Polynomial: `x^3^ + y^3^ = z^3^` renders as x^3^ + y^3^ = z^3^

### Keyboard Badges
- Display key combinations using `<kbd>Alt</kbd> + <kbd>J</kbd>`

---

# 11. Blockquotes & Stylized Citations

Incorporate quotes, design principles, and literature references using Markdown blockquotes:

> "Programs must be written for people to read, and only incidentally for machines to execute."  
> — *Harold Abelson and Gerald Jay Sussman, Structure and Interpretation of Computer Programs*

Blockquotes feature theme-aware accent borders, italic typography, and subtle contrast backgrounds in both Light and Dark themes.

You can also nest lists or inline code directly inside blockquotes:
> - Rule 1: Make it work.
> - Rule 2: Make it right.
> - Rule 3: Make it fast.

---

# 12. Callouts: [!NOTE] Informational Admonitions

Communicate supplementary insights without cluttering body text using GitHub-flavored callouts:

```markdown
> [!NOTE]
> OrgSlide automatically parses GitHub callouts into styled alert boxes.
```

> [!NOTE]
> This is a **NOTE** callout. Use it to provide helpful context, background information, or relevant reference links that enrich the main narrative.

- Features a soothing blue accent border.
- Includes an automatic SVG info icon.
- Dynamically adapts to dark and light modes.

---

# 13. Callouts: [!TIP] Recommendations & Best Practices

Highlight shortcuts, performance enhancements, and clever tips using the tip callout:

```markdown
> [!TIP]
> Press Alt + . during any slide to toggle the interactive Tree View!
```

> [!TIP]
> Presentations look stunning in fullscreen mode! Press <kbd>F11</kbd> or click the Fullscreen icon in the top-right toolbar to enter a distraction-free presentation experience.

- Emphasized with an emerald green border.
- Includes a dedicated lightbulb icon.
- Ideal for presenter notes, productivity hacks, and recommended workflows.

---

# 14. Callouts: [!IMPORTANT] Critical Insights

When presenting mission-critical requirements or architectural invariants, use the important callout:

```markdown
> [!IMPORTANT]
> Always verify that your image assets are placed in the uploaded folder.
```

> [!IMPORTANT]
> Presentations rendered with OrgSlide are 100% self-contained in your browser. No user data, files, or presentations are ever uploaded to external cloud servers.

- Features a vibrant violet accent border.
- Commands visual focus immediately upon slide transition.
- Perfect for security considerations and core invariants.

---

# 15. Callouts: [!WARNING] Cautions & Pre-conditions

Alert your audience to breaking changes, prerequisites, or potential pitfalls using the warning callout:

```markdown
> [!WARNING]
> Clearing browser storage removes cached recent documents.
```

> [!WARNING]
> When exporting presentations to Microsoft PowerPoint (.pptx), ensure that custom fonts are installed on the viewing machine to preserve typographic fidelity.

- Highlighted with an amber warning border.
- Accompanied by a warning triangle icon.
- Advises presenters and readers of critical caveats.

---

# 16. Callouts: [!CAUTION] High-Risk Alerts

Use caution alerts for destructive operations, data-loss scenarios, and breaking incompatibilities:

```markdown
> [!CAUTION]
> The 'Clear Session' button purges all saved presentation drafts.
```

> [!CAUTION]
> Never delete original image files from your computer while relying on relative workspace links unless you have uploaded the folder into OrgSlide's IndexedDB.

- Rendered with a high-contrast red border.
- Features a stop sign alert glyph.
- Catches immediate attention for critical warnings.

---

# 17. Code Highlighting Architecture

OrgSlide integrates **Highlight.js** to deliver syntax highlighting across dozens of programming languages:

```
Supported Languages:
- Python, JavaScript, TypeScript, Rust, Go, C, C++, Java
- Bash, Shell, SQL, JSON, YAML, HTML, CSS, SCSS, Markdown
```

Syntax colors automatically synchronize with the active presentation theme:
- **Light Themes**: Clean GitHub Light syntax colors with crisp contrast.
- **Dark Themes**: Catppuccin / Dracula dark tokens with vibrant keyword highlights.

---

# 18. Code Block Interactive Controls

Every code block in OrgSlide is equipped with a hovering action toolbar in the upper-right corner:

1. **Language Badge**: Displays the detected language (e.g., `PYTHON`, `RUST`).
2. **Font Scaling (<kbd>A+</kbd> / <kbd>A-</kbd>)**: Increase or decrease code font size in real time.
3. **Reset Font (↺)**: Restores the code font to default presentation size.
4. **Copy Code**: Copies the raw code snippet to the system clipboard with 1-click confirmation.
5. **Fullscreen Code (⛶)**: Expands the code block to fill the entire monitor for live code reviews!

---

# 19. Python Programming: NumPy & Data Analysis

OrgSlide formats multi-line Python code with clean keyword, string, and comment coloring:

```python
import numpy as np

def compute_eigenvalues(matrix: np.ndarray) -> dict:
    """Calculate eigenvalues and eigenvectors of a square matrix."""
    if matrix.shape[0] != matrix.shape[1]:
        raise ValueError("Matrix must be square")
    
    eigenvalues, eigenvectors = np.linalg.eig(matrix)
    return {
        "eigenvalues": eigenvalues.tolist(),
        "trace": float(np.trace(matrix)),
        "determinant": float(np.linalg.det(matrix))
    }

A = np.array([[4.0, -2.0], [1.0, 1.0]])
metrics = compute_eigenvalues(A)
print(f"Spectral Analysis: {metrics}")
```

---

# 20. JavaScript & TypeScript: Asynchronous Web APIs

Present modern TypeScript algorithms, interfaces, and asynchronous workflows:

```typescript
interface SlidePayload {
  readonly id: string;
  readonly index: number;
  title: string;
  breadcrumbs: Array<{ title: string; index: number }>;
}

class SlideEngine {
  private currentIndex: number = 0;

  async loadDeck(sourceUrl: string): Promise<SlidePayload[]> {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const markdownText = await response.text();
    return window.parseMarkdown(markdownText);
  }

  jumpTo(slideNumber: number): void {
    this.currentIndex = Math.max(0, slideNumber - 1);
    window.updateSlide(this.currentIndex);
  }
}
```

---

# 21. Systems Programming: Rust Memory Safety

Rust code blocks demonstrate syntax highlighting for lifetimes, traits, and macros:

```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct PresentationDeck<'a> {
    pub title: &'a str,
    pub slides: Vec<String>,
    pub metadata: HashMap<&'a str, &'a str>,
}

impl<'a> PresentationDeck<'a> {
    pub fn new(title: &'a str) -> Self {
        Self {
            title,
            slides: Vec::new(),
            metadata: HashMap::new(),
        }
    }

    pub fn push_slide(&mut self, slide_html: String) {
        self.slides.push(slide_html);
    }
}
```

---

# 22. Systems Programming: Modern C++20 Algorithms

Present modern C++ concepts, lambdas, and parallel standard algorithms:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50, 60};

    // C++20 Ranges & Lambda expression
    auto total = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Sum: " << total << std::endl;

    std::for_each(numbers.begin(), numbers.end(), [](const int& n) {
        if (n % 20 == 0) {
            std::cout << "Divisible by 20: " << n << '\n';
        }
    });

    return 0;
}
```

---

# 23. Shell Scripting: Bash Automation Pipelines

Format command-line tools, deployment scripts, and UNIX pipelines:

```bash
#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="./dist/presentation"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "==> Packaging OrgSlide distribution at ${TIMESTAMP}..."
mkdir -p "${TARGET_DIR}"

# Minify assets and bundle presentation
tar -czf "${TARGET_DIR}/deck_${TIMESTAMP}.tar.gz" \
  --exclude='.git' \
  --exclude='node_modules' \
  .

echo "==> Build complete! Output: ${TARGET_DIR}/deck_${TIMESTAMP}.tar.gz"
```

---

# 24. Database Queries: ANSI SQL Analytics

Present SQL database schemas, analytics aggregations, and window functions:

```sql
WITH MonthlySlideMetrics AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) AS presentation_month,
    COUNT(presentation_id) AS total_decks,
    SUM(slide_count) AS total_slides_authored,
    AVG(duration_minutes) AS avg_presentation_time
  FROM user_presentations
  WHERE status = 'published'
  GROUP BY user_id, DATE_TRUNC('month', created_at)
)
SELECT 
  user_id,
  presentation_month,
  total_decks,
  total_slides_authored,
  RANK() OVER (PARTITION BY presentation_month ORDER BY total_slides_authored DESC) AS presenter_rank
FROM MonthlySlideMetrics
ORDER BY presentation_month DESC, presenter_rank ASC;
```

---

# 25. Unordered Lists & Deep Nesting

Create multi-level bulleted lists with automatic indentation and square bullet markers:

- Strategic Product Goals
  - Deliver seamless Markdown & Org dual-engine support
  - Guarantee zero-install web browser compatibility
  - Maintain 100% offline document rendering
- Technical Benchmarks
  - Sub-10ms slide switching latency
  - Zero memory leaks over 500+ slide presentations
  - Native vector typography rendering
- Target Audience
  - Software Engineers & Architects
  - University Professors & Researchers
  - Emacs & Markdown power users

---

# 26. Ordered Lists & Custom Start Indices

Enumerate step-by-step procedures with numbered lists:

1. Draft your presentation outline in your favorite text editor (Vim, VS Code, Emacs).
2. Insert code blocks, LaTeX formulas, and image links.
3. Open OrgSlide in Chrome, Firefox, Safari, or Edge.
4. Drag and drop the `.md` file to render instantly.
5. Present using keyboard shortcuts or export to PowerPoint/PDF.

### Custom Starting Numbers
Numbered lists preserve starting positions (e.g., starting at step 6):

6. Review audience questions during the presentation.
7. Switch between Beamer, Book, and Slide views on demand.
8. Distribute standalone HTML slides to attendees.

---

# 27. Interactive Task Lists & Checklists

Manage deployment checklists and roadmap milestones with interactive task checkboxes:

- [x] Implement robust CommonMark & GFM parsing engine
- [x] Integrate KaTeX for high-performance LaTeX formula rendering
- [x] Refine floating glassmorphic image manipulation controls
- [x] Support 5 varieties of GitHub-flavored alert callouts
- [x] Eliminate phantom blank slides across all heading levels
- [ ] Test 50-page presentation across PDF and PPTX export engines
- [ ] Share OrgSlide with the developer community!

Checked items automatically display subtle strikethroughs and muted text contrast.

---

# 28. Markdown Tables: Alignments & Syntax

Structure multi-column technical data using standard Markdown pipe tables:

```markdown
| Left Aligned | Center Aligned | Right Aligned |
| :--- | :---: | ---: |
| Text column | Centered status | Numbers / Metrics |
```

| Left Aligned (Text) | Center Aligned (Status) | Right Aligned (Value) |
| :--- | :---: | ---: |
| JavaScript Parsing Engine | Active | 1.84 ms |
| KaTeX Math Formatter | Loaded | 0.42 ms |
| Image Layout Engine | Ready | 100% |
| Export Pipeline | Verified | 4 Formats |

Tables automatically feature alternating row striping and theme contrast.

---

# 29. Data Tables: Performance Comparison Matrix

Compare tools, frameworks, and architecture patterns using full-width tables:

| Capability | OrgSlide | Reveal.js | Marp | PowerPoint |
| :--- | :---: | :---: | :---: | :---: |
| Markdown Support | Native | Plugin | Native | No |
| Org-Mode Support | Native | Third-party | No | No |
| LaTeX Math (KaTeX) | Built-in | Plugin | MathJax | Plugin |
| Interactive Image Resize | Built-in | No | CSS Only | Manual |
| Multiple Render Modes | 6 Modes | 1 Mode | 1 Mode | 1 Mode |
| Zero Build Tooling | 100% | Requires npm | CLI tool | Heavy App |

---

# 30. LaTeX Math Equations: Inline Formulas

Scientific presentations require mathematical typesetting. OrgSlide renders inline math formulas via **KaTeX**:

- Einstein's mass-energy equivalence: $E = mc^2$
- Planck's quantum relation: $E = h\nu = \hbar\omega$
- Heisenberg's uncertainty principle: $\Delta x \Delta p \ge \frac{\hbar}{2}$
- Newton's universal gravitation: $F = G \frac{m_1 m_2}{r^2}$
- Standard deviation definition: $\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^N (x_i - \mu)^2}$

Inline math formulas automatically blend with body font sizes and line heights.

---

# 31. LaTeX Math Equations: Display Blocks

Render multi-line, centered mathematical equations using double dollar delimiters (`$$ ... $$`):

The Gaussian normal distribution probability density integral:

$$\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}$$

Euler's identity connecting the fundamental mathematical constants:

$$e^{i\pi} + 1 = 0$$

General solution to the quadratic equation $ax^2 + bx + c = 0$:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

---

# 32. Mathematical Physics: Classical & Quantum

Render advanced field equations and quantum wavefunctions:

### Maxwell's Equations in Differential Form
$$\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}, \quad \nabla \cdot \mathbf{B} = 0$$

$$\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}, \quad \nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}$$

### Time-Dependent Schrödinger Equation
$$i\hbar \frac{\partial}{\partial t}\Psi(\mathbf{r}, t) = \left[ -\frac{\hbar^2}{2m}\nabla^2 + V(\mathbf{r}, t) \right] \Psi(\mathbf{r}, t)$$

---

# 33. Mathematical Statistics: Probability & Matrices

Present machine learning loss functions and matrix transformations:

### Bayes' Theorem for Conditional Probability
$$P(A \mid B) = \frac{P(B \mid A) \, P(A)}{P(B)}$$

### Linear Algebra: Matrix Determinant
$$\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$$

### Softmax Activation Function
$$\sigma(\mathbf{z})_i = \frac{e^{z_i}}{\sum_{j=1}^K e^{z_j}} \quad \text{for } i = 1, \dots, K$$

---

# 34. Images & Graphics: URLs, Local Files & Paths

Embed high-resolution images using standard Markdown syntax:

```markdown
![Alt Text](https://images.unsplash.com/photo-1557804506-669a67965ba0?w=700)
```

![Modern Tech Workspace](https://images.unsplash.com/photo-1557804506-669a67965ba0?w=700&auto=format&fit=crop)

### Supported Image Sources
- Web URLs (`https://...`)
- Local workspace paths (`./images/diagram.png`)
- Base64 data URIs (`data:image/png;base64,...`)
- Uploaded folder assets cached in IndexedDB

---

# 35. Interactive Image Controls: Floating Toolbar

Hover your cursor over any image in OrgSlide to reveal the floating glassmorphic toolbar:

```
[Left] [Center] [Middle] [Right] | [-15%] [+15%] [100%] [1:1] | [Free] [Lock] [Zoom] | [Fix] [Reset]
```

- **Alignment Presets**: Instantly float images to the Left, Center, Middle, or Right with automatic text wrapping.
- **Scaling Presets**: Scale up/down in 15% increments or snap to 100% full slide width.
- **Corner Handle**: Drag the bottom-right handle to dynamically resize images to any custom dimension.
- **Layout Persistence**: Image dimensions and alignments automatically persist across sessions!

---

# 36. Free-Move Canvas Mode & Fixed Image Locking

Need total freedom over image positioning on your slide canvas?

### 1. Free-Move Mode (8-Way Resize)
- Click the **Free Move** button on the image toolbar.
- Eight circular handles appear around the image borders.
- Drag the central handle to position the image anywhere on the slide!
- Drag any corner or edge handle to resize without aspect ratio limits.

### 2. Lock Position
- Click the **Lock Position** padlock button to lock your layout.
- Prevents accidental moves or resize actions during live presentations.

---

# 37. Footnotes & Academic Citations System

Reference research papers, technical reports, and side remarks with footnotes:

```markdown
OrgSlide provides academic citation capabilities[^1] for technical writers[^2].

[^1]: Footnotes appear cleanly indexed at the base of the slide.
[^2]: Both number indices and named tags are supported.
```

OrgSlide provides academic citation capabilities[^1] for technical writers and researchers[^2].

[^1]: Footnotes appear cleanly indexed and formatted at the base of the slide.
[^2]: Both number indices and alphanumeric tags are supported.

---

# 38. Table of Contents: Interactive Tree View Modal

Need an instant overview of your entire slide deck? Press <kbd>Alt</kbd> + <kbd>.</kbd>!

OrgSlide launches the **Presentation Outline Modal**:
- **Mindmap Tree View**: Infinite-canvas orthogonal tree diagram connecting chapters to slides.
- **Compact List View**: Traditional linear outline with slide numbers.
- **Details View**: Indented hierarchical outline with chapter headers.
- **Card View**: Responsive grid of visual slide cards.
- **Overview Mode**: Live scaled visual previews of all slides on an infinite canvas!
- **Visibility Toggle**: Click the checkbox next to any slide to hide or reveal it during the talk.

---

# 39. Keyboard Shortcuts & Navigation Cheat Sheet

Navigate seamlessly during live presentations using keyboard shortcuts:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Alt</kbd> + <kbd>J</kbd> or <kbd>Space</kbd> | Next Slide | Advance presentation |
| <kbd>Alt</kbd> + <kbd>K</kbd> | Previous Slide | Go back one slide |
| <kbd>Alt</kbd> + <kbd>.</kbd> | Table of Contents | Open Tree View outline |
| <kbd>Alt</kbd> + <kbd>G</kbd> | Go to Slide | Jump directly to slide number |
| <kbd>Alt</kbd> + <kbd>E</kbd> | Profile Editor | Edit presenter social links |
| <kbd>Alt</kbd> + <kbd>?</kbd> | Help Dialog | Display all keyboard shortcuts |
| <kbd>Home</kbd> / <kbd>End</kbd> | Start / End | Jump to First / Last slide |

---

# 40. Presentation Themes: Light, Dark & Custom

Toggle instantly between Light and Dark themes or select customized color palettes:

- **Theme Toggle**: Click the Moon / Sun icon in the top-right toolbar or press shortcut.
- **Light Theme**:
  - High-contrast Navy Blue primary accents
  - Tech Blue secondary headers
  - Crisp GitHub Light syntax highlighting
- **Dark Theme**:
  - Deep Catppuccin dark workspace background
  - Soft pastel blue and violet accents
  - Dimmed, non-distracting code blocks with Dracula tokens

All themes maintain strict WCAG AAA contrast ratios for optimal projector readability.

---

# 41. Typography Engine: Google Fonts & Monospace

OrgSlide features an integrated typography engine with popular font pairings:

### Body & Heading Typefaces
- **Inter**: Neutral, legible Swiss-style sans-serif optimized for digital screens.
- **Roboto & Poppins**: Modern geometric presentation typography.
- **Playfair Display & Lora**: Elegant editorial serif typography for literary decks.

### Monospace Code Typefaces
- **Fira Code**: High-legibility developer font with programming ligatures.
- **JetBrains Mono**: Engineered specifically for reading source code.
- **Source Code Pro**: Classic Adobe monospace typeface.

---

# 42. Render Mode: PowerPoint Slide vs Beamer

Switch between different document paradigms on the fly using the render mode selector:

### 1. Slide Mode (Default)
- Traditional 16:9 widescreen presentation canvas.
- Clean PowerPoint-style layout with header breadcrumbs and footer navigation.
- Ideal for conferences, workshops, and business presentations.

### 2. LaTeX Beamer Mode
- Classic academic LaTeX presentation theme.
- Features top navigation bars, section dots, and block theorem environments.
- Perfect for academic lectures, mathematics defenses, and scientific symposiums.

---

# 43. Render Mode: LaTeX Book vs Outline Mode

### 3. LaTeX Book Mode
- Converts the slide deck into a continuous, readable digital book.
- Eliminates slide breaks in favor of numbered academic sections and chapters.
- Ideal for reading presentation notes as a continuous whitepaper or textbook.

### 4. Hierarchical Outline Mode
- Clean collapsible tree view of the entire document.
- Expands and collapses sections with a single click.
- Excellent for high-level executive summaries and quick reference navigation.

---

# 44. Export Ecosystem: 1-Click PDF Generation

Export your presentation directly to publication-ready PDF:

1. Click the **Export** button in the top controls or press Print (<kbd>Ctrl</kbd> + <kbd>P</kbd>).
2. OrgSlide's print stylesheet activates:
   - Removes all UI controls, toolbars, and background modals.
   - Formats every slide into a distinct landscape page.
   - Preserves high-resolution vector fonts and SVG diagrams.
3. In the browser print dialog:
   - Destination: **Save as PDF**
   - Layout: **Landscape**
   - Margins: **None**
   - Background Graphics: **Checked**

---

# 45. Export Ecosystem: Microsoft PowerPoint (PPTX)

Need to deliver your presentation in native `.pptx` format?

- OrgSlide includes a built-in PowerPoint export engine powered by **PptxGenJS**.
- Converts slide titles, body text, lists, and images into native PowerPoint shapes.
- Automatically creates slide masters with branding, slide numbers, and footers.
- The exported `.pptx` file can be opened and edited directly in Microsoft PowerPoint, Apple Keynote, or Google Slides!

> [!TIP]
> Use PowerPoint export when collaborating with teammates who use traditional office suites.

---

# 46. Export Ecosystem: Microsoft Word & HTML

### 1. Microsoft Word Export (.docx / Printable Document)
- Compiles the presentation into a clean, paginated Word document.
- Heading navigation breadcrumbs and slide counters are removed for document cleanliness.
- Code blocks retain full Highlight.js syntax coloring directly inside Word!

### 2. Standalone HTML Export
- Generates a single, self-contained `.html` file.
- Embeds all slides, styles, scripts, and fonts into a zero-dependency file that can be hosted on GitHub Pages or emailed to clients.

---

# 47. Folder Manager & Local Asset Bundling

Presenting offline with dozens of local diagrams, charts, and photos?

Use OrgSlide's **Upload Folder** feature:
1. Click **Upload Folder** on the landing page.
2. Select your presentation directory containing `presentation.md` and your image assets.
3. OrgSlide reads all assets into an isolated **IndexedDB** database in your browser.
4. Images referenced via relative paths (e.g., `![Architecture](./images/arch.png)`) resolve instantly without uploading to any cloud server!
5. Assets remain cached for offline presentations even across browser restarts.

---

# 48. Developer API & Headless Programmatic Usage

Integrate OrgSlide into your custom developer workflows and automated pipelines:

```javascript
// Access the global OrgSlide API in the browser console or scripts
const sampleMarkdown = `
# Slide 1
First slide content.
---
# Slide 2
Second slide content.
`;

// 1. Parse markdown text into slide objects
const slides = window.parseMarkdown(sampleMarkdown);

// 2. Render the deck into the DOM
window.renderDeck(slides);

// 3. Jump to a specific slide programmatically
window.updateSlide(1); // 0-indexed
```

---

# 49. Troubleshooting & Best Practices

Tips for authoring flawless Markdown presentations:

- **Slide Division**: Place `---` on a line by itself with blank lines above and below.
- **Code Fences**: Ensure closing triple backticks (```` ``` ````) are aligned to the left margin.
- **Math Formulas**: Use `$$` on separate lines for display equations, and `$inline$` for variables.
- **Image Paths**: Use web URLs or upload your project folder if images are stored locally.
- **Session Storage**: Click **Clear Session** on the main menu to reset cached drafts and start fresh.

---

# 50. Acknowledgments & Community Links

Thank you for choosing **OrgSlide** for your presentations!

- **Developer**: Cisco Ramon (Abhi)
- **GitHub Repository**: [github.com/CISSSCO/OrgSlide](https://github.com/CISSSCO/OrgSlide)
- **Portfolio**: [ciscoramon.netlify.app](https://ciscoramon.netlify.app)
- **LinkedIn**: [linkedin.com/in/abhi581b](https://www.linkedin.com/in/abhi581b/)
- **License**: MIT Open Source License

> Star the project on GitHub and share your slide decks with the developer community!
