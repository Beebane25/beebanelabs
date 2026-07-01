#!/usr/bin/env python3
"""
fix_mermaid_labels_v2.py — Aggressively quote ALL mermaid labels with special chars.
In mermaid 11.16.0, unquoted labels with ( ) ' | # ; : break parsing.
"""

import re
import html
import glob
import sys

def fix_mermaid_block(code):
    """Fix all labels in a mermaid block by quoting everything with special chars."""
    changes = 0
    lines = code.split('\n')
    fixed_lines = []
    
    for line in lines:
        original = line
        stripped = line.strip()
        
        # Skip non-node lines
        if (not stripped or stripped.startswith('%') or 
            stripped.startswith(('flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
                               'stateDiagram', 'erDiagram', 'gantt', 'pie', 'mindmap',
                               'style', 'subgraph', 'end', 'direction'))):
            fixed_lines.append(line)
            continue
        
        # Skip lines that are just edges: N0 --> N1
        if re.match(r'^\s*\w+\s*(-->|---|-\.->|==>|--o|--x)\s*\w+\s*$', stripped):
            fixed_lines.append(line)
            continue
        
        # Fix: ID[/label/] (stadium) — quote the label
        def fix_stadium(m):
            nonlocal changes
            full = m.group(0)
            label = m.group(1)
            if label.startswith('"'):
                return full  # Already quoted
            changes += 1
            escaped = label.replace('"', '#quot;')
            return f'[/"{escaped}"/]'
        
        line = re.sub(r'\[/(.+?)/\]', fix_stadium, line)
        
        # Fix: ID[label] (rectangle) — quote if has special chars
        def fix_rect(m):
            nonlocal changes
            full = m.group(0)
            label = m.group(1)
            if label.startswith('"') or label.startswith('/'):
                return full  # Already quoted or stadium
            # Check if needs quoting
            if any(c in label for c in "(){}`'<>|;:#&"):
                changes += 1
                escaped = label.replace('"', '#quot;')
                return f'["{escaped}"]'
            return full
        
        line = re.sub(r'\[(.+?)\]', fix_rect, line)
        
        # Fix: ID{label} (diamond) — quote if has special chars
        def fix_diamond(m):
            nonlocal changes
            full = m.group(0)
            label = m.group(1)
            if label.startswith('"'):
                return full
            if any(c in label for c in "(){}`'<>|;:#&"):
                changes += 1
                escaped = label.replace('"', '#quot;')
                return f'{{"{escaped}"}}'
            return full
        
        line = re.sub(r'\{(.+?)\}', fix_diamond, line)
        
        # Fix: ID(label) (rounded) — quote if has special chars
        def fix_rounded(m):
            nonlocal changes
            full = m.group(0)
            label = m.group(1)
            if label.startswith('"'):
                return full
            if any(c in label for c in "(){}`'<>|;:#&"):
                changes += 1
                escaped = label.replace('"', '#quot;')
                return f'("{escaped}")'
            return full
        
        line = re.sub(r'\((.+?)\)', fix_rounded, line)
        
        # Fix edge labels: -->|"text"| — quote if has special chars
        def fix_edge(m):
            nonlocal changes
            full = m.group(0)
            label = m.group(1)
            if label.startswith('"'):
                return full
            if any(c in label for c in "(){}`'<>|;:#&"):
                changes += 1
                escaped = label.replace('"', '#quot;')
                return f'|"{escaped}"|'
            return full
        
        line = re.sub(r'\|(.+?)\|', fix_edge, line)
        
        if line != original:
            changes += 0  # Already counted in sub-functions
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines), changes


def process_file(filepath, dry_run=False):
    content = open(filepath, encoding='utf-8').read()
    total_changes = 0
    
    def fix_block(match):
        nonlocal total_changes
        raw = match.group(0)
        code = html.unescape(match.group(1).strip())
        
        fixed, changes = fix_mermaid_block(code)
        total_changes += changes
        
        if changes > 0:
            return f'<pre class="mermaid">\n{fixed}\n</pre>'
        return raw
    
    new_content = re.sub(
        r'<pre\s+class="mermaid">\s*\n?(.*?)\s*</pre>',
        fix_block,
        content,
        flags=re.DOTALL
    )
    
    if total_changes > 0 and not dry_run:
        open(filepath, 'w', encoding='utf-8').write(new_content)
    
    return total_changes


def main():
    dry_run = '--dry-run' in sys.argv
    
    files = sorted(glob.glob('articles/*.html'))
    files = [f for f in files if 'class="mermaid"' in open(f, encoding='utf-8').read()]
    
    print(f"{'[DRY RUN] ' if dry_run else ''}Fixing mermaid labels in {len(files)} files...")
    
    total = 0
    files_fixed = 0
    for i, fpath in enumerate(files):
        changes = process_file(fpath, dry_run=dry_run)
        fname = fpath.replace('\\', '/').split('/')[-1]
        if changes > 0:
            total += changes
            files_fixed += 1
            print(f"  [{i+1}/{len(files)}] {fname}: {changes} labels")
    
    print(f"\n{'='*60}")
    print(f"Files processed:    {len(files)}")
    print(f"Files modified:     {files_fixed}")
    print(f"Total labels fixed: {total}")


if __name__ == '__main__':
    main()
