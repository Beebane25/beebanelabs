#!/usr/bin/env python3
"""
svg_to_mermaid.py — Convert inline SVG diagrams/code-blocks back to proper HTML.

Reads HTML files from articles/, finds <svg class="ascii-diagram"> blocks,
and converts them back to:
  - <pre><code> blocks (for code/command content)
  - Mermaid.js diagrams (for actual architectural/flow diagrams)

Usage:
    python svg_to_mermaid.py                    # Process all articles
    python svg_to_mermaid.py --dry-run          # Preview without modifying
    python svg_to_mermaid.py --file FILE        # Process single file
    python svg_to_mermaid.py --limit 10         # Process first 10 files
    python svg_to_mermaid.py --skip-existing    # Skip files already having mermaid
"""

import re
import os
import sys
import argparse
import html as html_mod
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass, field
import xml.etree.ElementTree as ET

# ── Constants ──────────────────────────────────────────────────────────────────

ARTICLES_DIR = Path(__file__).parent.parent / "articles"

MERMAID_SCRIPT_TAG = '<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>'

MERMAID_INIT_BLOCK = """<script>
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#0f2a1f', primaryTextColor: '#e4e4e7',
    primaryBorderColor: '#3ecf8e', lineColor: '#8b8b8b',
    secondaryColor: '#0f1d3a', tertiaryColor: '#2a1f0a',
    background: '#0a0a12', mainBkg: '#0a0a12',
    nodeBorder: '#3ecf8e', clusterBkg: '#0a0a12',
    titleColor: '#e4e4e7', edgeLabelBackground: '#0a0a12'
  },
  flowchart: { curve: 'basis', padding: 15, htmlLabels: true },
  sequence: { mirrorActors: false, messageAlign: 'center' }
});
</script>"""


# ── SVG Classification ─────────────────────────────────────────────────────────

def classify_svg(svg_block: str) -> str:
    """Classify an SVG block as 'code' or 'diagram'.
    
    Code blocks have:
    - Thin indicator rects (width < 5)
    - Many sequential text lines
    - No connection paths (arrows)
    
    Diagrams have:
    - Large boxes (width > 20)
    - Connection paths with arrows
    - Structured layout
    """
    # Count rect widths (use \bwidth to avoid matching stroke-width)
    rect_widths = re.findall(r'<rect[^>]*\s+width="([\d.]+)"', svg_block)
    thin_rects = sum(1 for w in rect_widths if float(w) < 5)
    total_rects = len(rect_widths)
    
    # Count text elements
    text_count = len(re.findall(r'<text[^>]*>', svg_block))
    
    # Count connection paths with arrows
    arrow_count = len(re.findall(r'marker-end', svg_block))
    
    # Count connection paths (non-decorative)
    path_count = 0
    for m in re.finditer(r'<path[^>]*stroke-opacity="([\d.]+)"[^>]*>', svg_block):
        opacity = float(m.group(1))
        if opacity >= 0.3:
            path_count += 1
    
    # Decision logic
    if total_rects == 0:
        return 'code'  # No rects = plain text content
    
    # If most rects are thin indicators (width < 5), it's a code block
    if total_rects > 0 and thin_rects / total_rects > 0.5:
        return 'code'
    
    # If it has arrows and large boxes, it's a diagram
    if arrow_count > 0 and text_count < 50:
        return 'diagram'
    
    # If it has many text elements and thin rects, it's code
    if text_count > 20 and thin_rects > 0:
        return 'code'
    
    # Check for large rects (actual diagram boxes)
    large_rects = sum(1 for w in rect_widths if float(w) > 30)
    if large_rects >= 3:
        return 'diagram'
    
    # Default to code for safety
    return 'code'


# ── Code Block Extraction ──────────────────────────────────────────────────────

def extract_code_from_svg(svg_block: str) -> str:
    """Extract text content from an SVG code block and return as plain text.
    
    Preserves line order and removes HTML entities.
    """
    # Extract all text elements in order
    texts = re.findall(r'<text[^>]*>(.*?)</text>', svg_block, re.DOTALL)
    
    lines = []
    for t in texts:
        # Clean up HTML entities
        t = t.strip()
        t = html_mod.unescape(t)
        if t:
            lines.append(t)
    
    return '\n'.join(lines)


def detect_code_language(svg_block: str, html_context: str) -> str:
    """Try to detect the programming language from context clues."""
    # Check for code-lang label in the surrounding HTML
    lang_match = re.search(r'class="code-lang">([^<]+)', html_context)
    if lang_match:
        lang_text = lang_match.group(1).strip()
        # Extract language name before em dash
        if ' — ' in lang_text:
            return lang_text.split(' — ')[0].strip()
        return lang_text
    
    # Try to detect from content
    texts = re.findall(r'<text[^>]*>(.*?)</text>', svg_block, re.DOTALL)
    content = ' '.join(texts).lower()
    
    if 'def ' in content or 'import ' in content or 'print(' in content:
        return 'python'
    elif 'function ' in content or 'const ' in content or '=>' in content:
        return 'javascript'
    elif 'sudo ' in content or '#!/' in content or 'apt ' in content:
        return 'bash'
    elif 'select ' in content or 'from ' in content or 'where ' in content:
        return 'sql'
    elif 'docker ' in content or 'FROM ' in content:
        return 'dockerfile'
    elif '<' in content and '>' in content and '/' in content:
        return 'html'
    elif '{' in content and ':' in content and ';' in content:
        return 'css'
    
    return ''


# ── Diagram Conversion ─────────────────────────────────────────────────────────

@dataclass
class Box:
    """A box extracted from SVG diagram."""
    x: float
    y: float
    width: float
    height: float
    texts: List[str] = field(default_factory=list)
    stroke_color: str = ""

    @property
    def cx(self):
        return self.x + self.width / 2

    @property
    def cy(self):
        return self.y + self.height / 2

    @property
    def label(self):
        return " ".join(t.strip() for t in self.texts if t.strip())


@dataclass
class Connection:
    """A connection between boxes."""
    from_idx: int = -1
    to_idx: int = -1
    has_arrow: bool = True


def parse_diagram_svg(svg_block: str) -> Tuple[List[Box], List[Connection], str]:
    """Parse an SVG diagram and extract boxes, connections, and title."""
    # Get viewBox dimensions
    vb_match = re.search(r'viewBox="([^"]*)"', svg_block)
    vb = vb_match.group(1).split() if vb_match else ['0', '0', '600', '400']
    svg_w = float(vb[2])
    svg_h = float(vb[3])
    
    # Get aria-label
    aria_match = re.search(r'aria-label="([^"]*)"', svg_block)
    aria_label = html_mod.unescape(aria_match.group(1)) if aria_match else "Diagram"
    
    # Add namespace if needed
    svg_clean = svg_block
    if 'xmlns=' not in svg_clean:
        svg_clean = svg_clean.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    
    try:
        root = ET.fromstring(svg_clean)
    except ET.ParseError:
        return [], [], aria_label
    
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    
    # Extract boxes (non-background rects)
    boxes = []
    for rect in (root.findall('.//svg:rect', ns) + root.findall('.//rect')):
        x = float(rect.get('x', 0))
        y = float(rect.get('y', 0))
        w = float(rect.get('width', 0))
        h = float(rect.get('height', 0))
        stroke = rect.get('stroke', '')
        
        # Skip background/frame rects
        is_bg = (w > svg_w * 0.8 and h > svg_h * 0.8 and stroke in ('#1e1e2e', ''))
        # Skip thin indicator rects
        is_thin = w < 5
        
        if not is_bg and not is_thin and w > 20 and h > 15:
            boxes.append(Box(x=x, y=y, width=w, height=h, stroke_color=stroke))
    
    # Extract texts and assign to boxes
    for text_elem in (root.findall('.//svg:text', ns) + root.findall('.//text')):
        tx = float(text_elem.get('x', 0))
        ty = float(text_elem.get('y', 0))
        content = (text_elem.text or '').strip()
        
        if not content:
            for tspan in (text_elem.findall('.//svg:tspan', ns) + text_elem.findall('.//tspan')):
                content += (tspan.text or '').strip() + ' '
            content = content.strip()
        
        if not content:
            continue
        
        # Find nearest box
        best_idx = -1
        best_dist = float('inf')
        for i, box in enumerate(boxes):
            if (box.x - 5 <= tx <= box.x + box.width + 5 and
                box.y - 5 <= ty <= box.y + box.height + 5):
                dist = abs(tx - box.cx) + abs(ty - box.cy)
                if dist < best_dist:
                    best_dist = dist
                    best_idx = i
        
        if best_idx >= 0:
            boxes[best_idx].texts.append(content)
    
    # Extract connections (paths — handle both line and bezier curves)
    connections = []
    for path in (root.findall('.//svg:path', ns) + root.findall('.//path')):
        d = path.get('d', '')
        marker = path.get('marker-end', '')
        opacity = float(path.get('stroke-opacity', '1'))

        if not d:
            continue
        # Allow paths with opacity >= 0.25 (tree diagrams use 0.45)
        if opacity < 0.25:
            continue

        # Extract ALL coordinate pairs from path (M, C, L commands)
        # For C (bezier): C cx1,cy1 cx2,cy2 x,y → endpoint is last pair
        all_coords = re.findall(r'([\d.]+)[,\s]+([\d.]+)', d)
        if len(all_coords) >= 2:
            # Start = first pair, End = last pair
            x1, y1 = float(all_coords[0][0]), float(all_coords[0][1])
            x2, y2 = float(all_coords[-1][0]), float(all_coords[-1][1])

            conn = Connection(has_arrow=bool(marker))

            for i, box in enumerate(boxes):
                if box.x - 15 <= x1 <= box.x + box.width + 15 and \
                   box.y - 15 <= y1 <= box.y + box.height + 15:
                    conn.from_idx = i
                if box.x - 15 <= x2 <= box.x + box.width + 15 and \
                   box.y - 15 <= y2 <= box.y + box.height + 15:
                    conn.to_idx = i

            if conn.from_idx >= 0 and conn.to_idx >= 0 and conn.from_idx != conn.to_idx:
                connections.append(conn)
    
    return boxes, connections, aria_label


def sanitize_label(text: str) -> str:
    """Clean text for Mermaid node labels."""
    text = text.strip()
    text = text.replace('"', "'").replace('[', '(').replace(']', ')')
    text = text.replace('{', '(').replace('}', ')')
    text = text.replace('#', 'No.').replace('&', 'dan')
    text = text.replace('<', '').replace('>', '')
    text = text.replace('\n', ' ')
    if len(text) > 50:
        text = text[:47] + "..."
    return text


def boxes_to_mermaid(boxes: List[Box], connections: List[Connection],
                     aria_label: str) -> str:
    """Convert parsed diagram to Mermaid flowchart syntax."""
    if not boxes:
        return ""
    
    valid = [b for b in boxes if b.label]
    if not valid:
        return ""
    
    lines = ["flowchart TD"]
    node_ids = []
    
    for i, box in enumerate(valid):
        nid = f"N{i}"
        node_ids.append(nid)
        label = sanitize_label(box.label)
        
        aspect = box.width / max(box.height, 1)
        if aspect > 3:
            lines.append(f"    {nid}[/{label}/]")
        elif label.isupper() and len(label) < 20:
            lines.append(f"    {nid}{{{label}}}")
        else:
            lines.append(f"    {nid}[{label}]")
    
    # Add connections
    added = set()
    for conn in connections:
        if conn.from_idx < len(node_ids) and conn.to_idx < len(node_ids):
            edge = (node_ids[conn.from_idx], node_ids[conn.to_idx])
            if edge not in added:
                added.add(edge)
                lines.append(f"    {edge[0]} --> {edge[1]}")
    
    # If no connections, infer from position
    if not connections and len(valid) > 1:
        sorted_idx = sorted(range(len(valid)), key=lambda i: (valid[i].y, valid[i].x))
        for j in range(len(sorted_idx) - 1):
            edge = (node_ids[sorted_idx[j]], node_ids[sorted_idx[j+1]])
            if edge not in added:
                added.add(edge)
                lines.append(f"    {edge[0]} --> {edge[1]}")
    
    return "\n".join(lines)


# ── HTML Processing ────────────────────────────────────────────────────────────

def find_svg_blocks(html_content: str) -> List[Tuple[int, int, str]]:
    """Find all SVG blocks with class='ascii-diagram'."""
    blocks = []
    pattern = re.compile(r'<svg[^>]*class="ascii-diagram"[^>]*>.*?</svg>', re.DOTALL)
    for match in pattern.finditer(html_content):
        blocks.append((match.start(), match.end(), match.group()))
    return blocks


def get_surrounding_context(html_content: str, start: int, end: int) -> str:
    """Get HTML context around an SVG block for language detection."""
    # Look backwards for code-header
    context_start = max(0, start - 500)
    before = html_content[context_start:start]
    return before


def process_article(filepath: Path, dry_run: bool = False) -> Dict:
    """Process a single HTML article file."""
    result = {
        'file': str(filepath.name),
        'svgs_found': 0,
        'code_converted': 0,
        'diagram_converted': 0,
        'failed': 0,
        'mermaid_added': False,
        'errors': []
    }
    
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        result['errors'].append(f"Read error: {e}")
        return result
    
    svg_blocks = find_svg_blocks(content)
    result['svgs_found'] = len(svg_blocks)
    
    if not svg_blocks:
        return result
    
    new_content = content
    
    # Process in reverse order to preserve positions
    for start, end, svg_block in reversed(svg_blocks):
        block_type = classify_svg(svg_block)
        
        if block_type == 'code':
            # Extract code text
            code_text = extract_code_from_svg(svg_block)
            if not code_text.strip():
                result['failed'] += 1
                continue
            
            # Detect language
            context = get_surrounding_context(content, start, end)
            lang = detect_code_language(svg_block, context)
            
            # Build <pre><code> replacement
            escaped_code = html_mod.escape(code_text)
            if lang:
                replacement = f'<pre><code class="language-{lang}">{escaped_code}</code></pre>'
            else:
                replacement = f'<pre><code>{escaped_code}</code></pre>'
            
            new_content = new_content[:start] + replacement + new_content[end:]
            result['code_converted'] += 1
        
        elif block_type == 'diagram':
            # Convert to Mermaid
            boxes, connections, aria_label = parse_diagram_svg(svg_block)
            mermaid_code = boxes_to_mermaid(boxes, connections, aria_label)
            
            if not mermaid_code:
                # Fallback: extract as code if diagram conversion fails
                code_text = extract_code_from_svg(svg_block)
                if code_text.strip():
                    escaped = html_mod.escape(code_text)
                    replacement = f'<pre><code>{escaped}</code></pre>'
                    new_content = new_content[:start] + replacement + new_content[end:]
                    result['code_converted'] += 1
                else:
                    # Empty diagram (no text content) — just remove it
                    new_content = new_content[:start] + new_content[end:]
                    result['code_converted'] += 1  # count as handled
                continue
            
            # Get diagram label
            label = aria_label.strip()
            if label in ('Diagram', 'Flow diagram'):
                label = ""
            elif label.startswith('Directory structure:'):
                label = label.replace('Directory structure: ', '')
            elif label.startswith('Flow diagram:'):
                label = label.replace('Flow diagram: ', '')
            
            label_html = ""
            if label:
                label_html = f'<div class="diagram-label">Diagram: {html_mod.escape(label)}</div>'
            
            replacement = (
                f'<div class="diagram-box">\n'
                f'        {label_html}\n'
                f'<pre class="mermaid">\n{mermaid_code}\n</pre>\n'
                f'    </div>'
            )
            
            new_content = new_content[:start] + replacement + new_content[end:]
            result['diagram_converted'] += 1
    
    # Add mermaid script if any diagrams were converted and not already present
    if result['diagram_converted'] > 0 and 'cdn.jsdelivr.net/npm/mermaid' not in new_content:
        body_close = new_content.rfind('</body>')
        if body_close >= 0:
            new_content = (
                new_content[:body_close] +
                '\n' + MERMAID_SCRIPT_TAG + '\n' +
                MERMAID_INIT_BLOCK + '\n' +
                new_content[body_close:]
            )
            result['mermaid_added'] = True
    
    if not dry_run:
        filepath.write_text(new_content, encoding='utf-8')
    
    return result


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Convert SVG to code blocks and Mermaid diagrams')
    parser.add_argument('--dry-run', action='store_true', help='Preview without modifying')
    parser.add_argument('--file', type=str, help='Process single file')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of files')
    parser.add_argument('--skip-existing', action='store_true',
                       help='Skip files already having mermaid')
    args = parser.parse_args()
    
    if args.file:
        files = [Path(args.file)]
    else:
        files = sorted(ARTICLES_DIR.glob('*.html'))
        if args.skip_existing:
            files = [f for f in files
                     if 'cdn.jsdelivr.net/npm/mermaid' not in
                     f.read_text(encoding='utf-8', errors='ignore')]
        if args.limit > 0:
            files = files[:args.limit]
    
    print(f"{'[DRY RUN] ' if args.dry_run else ''}Processing {len(files)} files...")
    
    total_svgs = 0
    total_code = 0
    total_diagram = 0
    total_failed = 0
    all_errors = []
    
    for i, filepath in enumerate(files):
        result = process_article(filepath, dry_run=args.dry_run)
        total_svgs += result['svgs_found']
        total_code += result['code_converted']
        total_diagram += result['diagram_converted']
        total_failed += result['failed']
        
        if result['errors']:
            all_errors.extend([(result['file'], e) for e in result['errors']])
        
        converted = result['code_converted'] + result['diagram_converted']
        if converted > 0 or result['failed'] > 0:
            parts = []
            if result['code_converted']:
                parts.append(f"{result['code_converted']} code")
            if result['diagram_converted']:
                parts.append(f"{result['diagram_converted']} diagram")
            if result['failed']:
                parts.append(f"{result['failed']} failed")
            print(f"  [{i+1}/{len(files)}] {result['file']}: {', '.join(parts)}")
    
    print(f"\n{'='*60}")
    print(f"Total SVGs found:        {total_svgs}")
    print(f"Code blocks restored:    {total_code}")
    print(f"Diagrams to Mermaid:     {total_diagram}")
    print(f"Failed:                  {total_failed}")
    
    if all_errors:
        print(f"\nErrors ({len(all_errors)}):")
        for fname, err in all_errors[:20]:
            print(f"  - {fname}: {err}")


if __name__ == '__main__':
    main()
