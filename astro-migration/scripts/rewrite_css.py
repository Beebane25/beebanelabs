import re, sys

css_path = r"C:\Users\user\Documents\pribadi\web adsence\astro-migration\public\css\style.css"

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

print(f"Input: {len(css)} chars, {css.count(chr(10))} lines")

# ============================================================
# STEP 1: Replace design tokens
# ============================================================

new_tokens = """/* --- DAY MODE (default — no body class needed) --- */
:root {
  /* Panel & surface — frosted glass for Three.js sky */
  --sky-panel: rgba(234, 244, 240, 0.82);
  --sky-panel-border: rgba(255, 255, 255, 0.25);
  --sky-surface: rgba(255, 255, 255, 0.35);
  --sky-surface-hover: rgba(255, 255, 255, 0.50);
  --sky-bg-solid: #f0f7f4;

  /* Text — high contrast on bright sky */
  --sky-text: #10231F;
  --sky-muted: #3d5450;

  /* Accent — teal from reference */
  --sky-accent: #39D9C4;
  --sky-accent-hover: #2FC4B2;

  /* Derived tokens */
  --sky-accent-rgb: 57, 217, 196;
  --sky-panel-blur: 14px;
  --sky-panel-blur-heavy: 18px;
  --sky-radius-sm: 8px;
  --sky-radius-md: 12px;
  --sky-radius-lg: 18px;
  --sky-radius-pill: 9999px;
  --sky-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  --sky-glow: 0 0 20px rgba(var(--sky-accent-rgb), 0.2);
  --sky-transition: 1.2s ease;
  --sky-fast: 0.2s ease;
  --sky-medium: 0.4s ease;
  --sky-font: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --sky-font-heading: 'Fraunces', Georgia, 'Times New Roman', serif;
  --sky-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  --sky-container: 1200px;
  --sky-gutter: 24px;
}

/* --- NIGHT MODE (body.reading-sky-night) --- */
body.reading-sky-night {
  --sky-panel: rgba(14, 18, 36, 0.72);
  --sky-panel-border: rgba(255, 255, 255, 0.06);
  --sky-surface: rgba(255, 255, 255, 0.04);
  --sky-surface-hover: rgba(255, 255, 255, 0.08);
  --sky-bg-solid: #0f1011;
  --sky-text: #E7E8F5;
  --sky-muted: #a9adcf;
  --sky-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  --sky-glow: 0 0 20px rgba(var(--sky-accent-rgb), 0.25);
}"""

# Find and replace from "/* --- Night mode" to before "/* ==... 1. GLOBAL RESET"
pattern = r'/\* --- Night mode.*?\n\}\n\n/\* =+\n   1\. GLOBAL RESET'
match = re.search(pattern, css, re.DOTALL)
if match:
    css = css[:match.start()] + new_tokens + '\n\n/* ============================================================\n   1. GLOBAL RESET' + css[match.end():]
    print("STEP 1: Replaced design tokens")
else:
    print("STEP 1: Pattern not found, trying alt...")
    # Try removing just the old sky-day vars block
    old_skyday = re.search(r'/\* --- Day mode --- \*/\nbody\.sky-day \{[^}]+\}', css, re.DOTALL)
    if old_skyday:
        css = css[:old_skyday.start()] + '/* Day mode = default in :root above */' + css[old_skyday.end():]
        print("STEP 1b: Removed old sky-day vars")

# ============================================================
# STEP 2: Update heading font
# ============================================================
css = css.replace(
    'h1, h2, h3, h4, h5, h6 {\n  color: var(--sky-text);\n  line-height: 1.2;\n  font-weight: 700;\n}',
    'h1, h2, h3, h4, h5, h6 {\n  color: var(--sky-text);\n  line-height: 1.2;\n  font-weight: 600;\n  font-family: var(--sky-font-heading);\n}'
)
print("STEP 2: Updated heading font")

# ============================================================
# STEP 3: Invert scrollbar (day=default light, night=dark)
# ============================================================
css = css.replace(
    'body.sky-day ::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.15);\n}\n\nbody.sky-day ::-webkit-scrollbar-thumb:hover {\n  background: rgba(0, 0, 0, 0.25);\n}',
    'body.reading-sky-night ::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.15);\n}\n\nbody.reading-sky-night ::-webkit-scrollbar-thumb:hover {\n  background: rgba(255, 255, 255, 0.25);\n}'
)
css = css.replace(
    'body.sky-day * {\n  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;\n}',
    'body.reading-sky-night * {\n  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;\n}'
)
print("STEP 3: Inverted scrollbar colors")

# ============================================================
# STEP 4: Remove old "Day Mode Glassmorphism Overrides" section (section 30)
# ============================================================
day_section = re.search(r'\n/\* =+\n   30\. DAY MODE.*$', css, re.DOTALL)
if day_section:
    css = css[:day_section.start()] + '\n'
    print("STEP 4: Removed old Day Mode section")
else:
    print("STEP 4: No Day Mode section found")

# ============================================================
# STEP 5: Convert remaining body.sky-day → body.reading-sky-night
# But we need to INVERT: sky-day overrides were for light mode
# Now light is default, so night overrides are needed
# For diagram SVGs and other component overrides
# ============================================================

# Diagram overrides: sky-day was adding light styles, now those are default
# We need night overrides instead
diagram_night = """/* Night mode diagram overrides */
body.reading-sky-night .diagram-svg {
  background: var(--sky-panel);
  border-color: var(--sky-panel-border);
}
body.reading-sky-night .diagram-svg:hover {
  border-color: var(--sky-accent);
}
body.reading-sky-night .diagram-svg .diagram-label {
  color: var(--sky-accent);
}
body.reading-sky-night .diagram-svg .diagram-content svg text {
  fill: var(--sky-text) !important;
}
body.reading-sky-night .diagram-svg .diagram-content svg path,
body.reading-sky-night .diagram-svg .diagram-content svg line {
  stroke: var(--sky-accent) !important;
}
body.reading-sky-night .diagram-svg .diagram-content svg rect,
body.reading-sky-night .diagram-svg .diagram-content svg polygon {
  fill: rgba(var(--sky-accent-rgb), 0.08) !important;
  stroke: var(--sky-accent) !important;
}"""

# Remove old diagram sky-day overrides
old_diagram = re.search(r'/\* Day mode diagram overrides \*/.*?(?=\n/\* GSAP|$)', css, re.DOTALL)
if old_diagram:
    css = css[:old_diagram.start()] + diagram_night + css[old_diagram.end():]
    print("STEP 5: Converted diagram overrides to night mode")

# ============================================================
# STEP 6: Replace all remaining body.sky-day with body.reading-sky-night
# ============================================================
count = css.count('body.sky-day')
css = css.replace('body.sky-day', 'body.reading-sky-night')
print(f"STEP 6: Converted {count} remaining sky-day → reading-sky-night")

# Also fix any remaining 'sky-day' class references
css = css.replace('.sky-day', '.reading-sky-night')
count2 = css.count('.sky-day')
print(f"STEP 6b: {count2} remaining .sky-day references")

# ============================================================
# STEP 7: Fix night scrollbar default (day scrollbar is light now)
# ============================================================
# The default scrollbar should be light (day), night should be dark
css = css.replace(
    'scrollbar-color: rgba(255, 255, 255, 0.15) transparent;',
    'scrollbar-color: rgba(0, 0, 0, 0.15) transparent;'
)
# Then night override makes it white
css = css.replace(
    'body.reading-sky-night * {\n  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;\n}',
    'body.reading-sky-night * {\n  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;\n}'
)
print("STEP 7: Fixed scrollbar defaults")

# ============================================================
# STEP 8: Add night mode component overrides at the end
# ============================================================
night_overrides = """
/* ============================================================
   30. NIGHT MODE — COMPONENT OVERRIDES
   Dark glass panels for Three.js night sky
   ============================================================ */

/* --- Navbar: darker glass for night --- */
body.reading-sky-night .navbar {
  background: var(--sky-panel);
  border-bottom-color: var(--sky-panel-border);
}

body.reading-sky-night .navbar.scrolled {
  box-shadow: var(--sky-shadow);
}

/* --- Category cards: dark glass --- */
body.reading-sky-night .category-card {
  background: var(--sky-panel);
  border-color: var(--sky-panel-border);
}

body.reading-sky-night .category-card:hover {
  border-color: var(--sky-accent);
  box-shadow: var(--sky-glow);
}

/* --- Article cards: dark glass --- */
body.reading-sky-night .article-card {
  background: var(--sky-panel);
  border-color: var(--sky-panel-border);
}

body.reading-sky-night .article-card:hover {
  border-color: var(--sky-accent);
  box-shadow: var(--sky-glow);
}

/* --- Selection: keep readable --- */
body.reading-sky-night ::selection {
  background: var(--sky-accent);
  color: #0b1026;
}

/* --- Code blocks --- */
body.reading-sky-night pre {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.06);
}

/* --- Ad slots --- */
body.reading-sky-night .ad-slot,
body.reading-sky-night .ad-slot-wide {
  border-color: rgba(255, 255, 255, 0.08);
}

/* --- Section dividers --- */
body.reading-sky-night .section-divider {
  background: rgba(255, 255, 255, 0.06);
}
"""

css = css.rstrip() + '\n' + night_overrides
print("STEP 8: Added night mode component overrides")

# ============================================================
# STEP 9: Remove duplicate/empty sections
# ============================================================
# Remove any "Day mode = default" placeholder comments
css = css.replace('/* Day mode = default in :root above */\n\n', '')
css = css.replace('/* Day mode variables now in :root (day is default) */\n\n', '')

# Write result
with open(css_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(css)

final_lines = css.count('\n')
print(f"\nDONE: {len(css)} chars, {final_lines} lines written")
