#!/usr/bin/env python3
"""
fix_mermaid_labels.py — Fix unquoted mermaid labels with special chars.
Wraps labels in quotes when they contain: ( ) # { } [ ] " ' < > & | ; •
"""

import re
import html
import glob
import sys

SPECIAL_CHARS = set('#{}()[]"\'<>|;&')

def needs_quoting(label):
    """Check if a label needs quoting."""
    if label.startswith('"') or label.startswith("'"):
        return False  # Already quoted
    return any(c in SPECIAL_CHARS for c in label) or '•' in label


def quote_label(label):
    """Wrap label in quotes, escaping internal quotes."""
    # Escape internal double quotes
    escaped = label.replace('"', '#quot;')
    return f'"{escaped}"'


def fix_mermaid_line(line):
    """Fix a single mermaid line by quoting problematic labels."""
    original = line
    changes = 0
    
    # Fix pattern: ID[/label/] (stadium shape)
    def fix_stadium(m):
        nonlocal changes
        prefix = m.group(1)  # ID[/
        label = m.group(2)   # label
        suffix = m.group(3)  # /]
        if needs_quoting(label):
            changes += 1
            return f'{prefix}{quote_label(label)}{suffix}'
        return m.group(0)
    
    line = re.sub(r'(\w+\[/)(.+?)(/\])', fix_stadium, line)
    
    # Fix pattern: ID[label] (rectangle shape)
    # But NOT if it starts with " (already quoted) or / (stadium, handled above)
    def fix_rect(m):
        nonlocal changes
        prefix = m.group(1)  # ID[
        label = m.group(2)   # label
        suffix = m.group(3)  # ]
        if label.startswith('"') or label.startswith('/'):
            return m.group(0)
        if needs_quoting(label):
            changes += 1
            return f'{prefix}{quote_label(label)}{suffix}'
        return m.group(0)
    
    line = re.sub(r'(\w+\[)([^\]]+?)(\])', fix_rect, line)
    
    # Fix pattern: ID{label} (diamond shape)
    def fix_diamond(m):
        nonlocal changes
        prefix = m.group(1)  # ID{
        label = m.group(2)   # label
        suffix = m.group(3)  # }
        if label.startswith('"'):
            return m.group(0)
        if needs_quoting(label):
            changes += 1
            return f'{prefix}{quote_label(label)}{suffix}'
        return m.group(0)
    
    line = re.sub(r'(\w+\{)(.+?)(\})', fix_diamond, line)
    
    # Fix pattern: ID(label) (rounded shape)
    def fix_rounded(m):
        nonlocal changes
        prefix = m.group(1)  # ID(
        label = m.group(2)   # label
        suffix = m.group(3)  # )
        if label.startswith('"'):
            return m.group(0)
        if needs_quoting(label):
            changes += 1
            return f'{prefix}{quote_label(label)}{suffix}'
        return m.group(0)
    
    line = re.sub(r'(\w+\()(.+?)(\))', fix_rounded, line)
    
    # Fix edge labels: -->|"text"| and --->|"text"|
    # These are usually OK, skip
    
    return line, changes


def fix_mermaid_block(code):
    """Fix all labels in a mermaid block."""
    total_changes = 0
    lines = code.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Skip non-node lines
        stripped = line.strip()
        if (not stripped or stripped.startswith('%') or 
            stripped.startswith(('flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
                               'stateDiagram', 'erDiagram', 'gantt', 'pie', 'mindmap',
                               'style', 'subgraph', 'end', 'direction'))):
            fixed_lines.append(line)
            continue
        
        fixed, changes = fix_mermaid_line(line)
        total_changes += changes
        fixed_lines.append(fixed)
    
    return '\n'.join(fixed_lines), total_changes


def process_file(filepath, dry_run=False):
    """Process a single file."""
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
    limit = 0
    for arg in sys.argv:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
    
    files = sorted(glob.glob('articles/*.html'))
    
    # Filter to files with mermaid
    files = [f for f in files if 'class="mermaid"' in open(f, encoding='utf-8').read()]
    
    if limit > 0:
        files = files[:limit]
    
    print(f"{'[DRY RUN] ' if dry_run else ''}Fixing mermaid labels in {len(files)} files...")
    
    total = 0
    files_fixed = 0
    for i, fpath in enumerate(files):
        changes = process_file(fpath, dry_run=dry_run)
        fname = fpath.replace('\\', '/').split('/')[-1]
        if changes > 0:
            total += changes
            files_fixed += 1
            print(f"  [{i+1}/{len(files)}] {fname}: {changes} labels quoted")
    
    print(f"\n{'='*60}")
    print(f"Files processed:    {len(files)}")
    print(f"Files modified:     {files_fixed}")
    print(f"Total labels fixed: {total}")


if __name__ == '__main__':
    main()
