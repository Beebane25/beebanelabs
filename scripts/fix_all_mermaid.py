#!/usr/bin/env python3
"""
fix_all_mermaid.py — Fix ALL mermaid issues across ALL articles.
1. Move mermaid blocks OUT of code-block divs
2. Remove duplicate diagram-box wrappers
3. Clean stadium labels [/"..."/] → ["..."]
"""

import re
import os
import glob
import html as html_mod

def fix_mermaid_in_codeblock(content):
    """Move mermaid <pre class="mermaid"> out of <div class="code-block">."""
    changes = 0
    
    # Pattern: <div class="code-block">...<div class="diagram-box">...<pre class="mermaid">
    # Need to close the code-block div before the diagram-box
    
    # Find code-block divs that contain mermaid
    pattern = re.compile(
        r'(<div class="code-block">)'           # code-block open
        r'(.*?)'                                 # code-header content
        r'(<div class="diagram-box">)'           # diagram-box inside code-block
        r'(.*?)'                                 # diagram content
        r'(<pre class="mermaid">)'               # mermaid block
        r'(.*?)'                                 # mermaid content
        r'(</pre>)',                             # close pre
        re.DOTALL
    )
    
    def fix_block(m):
        nonlocal changes
        code_block_open = m.group(1)
        code_header = m.group(2)
        diagram_box_open = m.group(3)
        diagram_label = m.group(4)
        mermaid_open = m.group(5)
        mermaid_content = m.group(6)
        mermaid_close = m.group(7)
        
        # Close the code-block div, then open diagram-box outside
        replacement = (
            '</div>\n'  # close code-block
            + diagram_box_open + '\n'
            + diagram_label
            + mermaid_open
            + mermaid_content
            + mermaid_close
        )
        changes += 1
        return replacement
    
    new_content = pattern.sub(fix_block, content)
    return new_content, changes


def fix_duplicate_wrappers(content):
    """Remove duplicate <div class="diagram-box"> wrappers."""
    changes = 0
    
    # Pattern: <div class="diagram-box">...<div class="diagram-box">...<pre class="mermaid">
    # Replace with single wrapper
    pattern = re.compile(
        r'<div class="diagram-box">\s*\n?'
        r'\s*<div class="diagram-label">(.*?)</div>\s*\n?'
        r'<div class="diagram-box">\s*\n?'
        r'\s*<div class="diagram-label">(.*?)</div>\s*\n?'
        r'(<pre class="mermaid">)',
        re.DOTALL
    )
    
    def fix_dup(m):
        nonlocal changes
        label1 = m.group(1)
        label2 = m.group(2)
        pre_open = m.group(3)
        
        # Use the more descriptive label
        label = label1 if len(label1) > len(label2) else label2
        
        changes += 1
        return (
            f'<div class="diagram-box">\n'
            f'        <div class="diagram-label">{label}</div>\n'
            f'{pre_open}'
        )
    
    new_content = pattern.sub(fix_dup, content)
    return new_content, changes


def fix_stadium_labels(content):
    """Convert stadium labels [/"..."/] to ["..."] in mermaid blocks."""
    changes = 0
    
    def fix_stadium(m):
        nonlocal changes
        label = m.group(1)
        # Remove quotes if present
        if label.startswith('"') and label.endswith('"'):
            label = label[1:-1]
        # Clean up
        label = label.replace('"', '#quot;')
        changes += 1
        return '["' + label + '"]'
    
    # Only fix inside mermaid blocks
    def fix_mermaid_block(m):
        block = m.group(1)
        block = re.sub(r'\[/"(.*?)"\/\]', fix_stadium, block)
        block = re.sub(r'\[\/(.*?)\/\]', fix_stadium, block)
        return '<pre class="mermaid">\n' + block + '\n</pre>'
    
    new_content = re.sub(
        r'<pre class="mermaid">\s*\n?(.*?)\s*</pre>',
        fix_mermaid_block,
        content,
        flags=re.DOTALL
    )
    return new_content, changes


def process_file(filepath, dry_run=False):
    """Process a single file with all fixes."""
    content = open(filepath, encoding='utf-8').read()
    original = content
    total = 0
    
    # Fix 1: Mermaid in code-block
    content, c1 = fix_mermaid_in_codeblock(content)
    total += c1
    
    # Fix 2: Duplicate wrappers
    content, c2 = fix_duplicate_wrappers(content)
    total += c2
    
    # Fix 3: Stadium labels
    content, c3 = fix_stadium_labels(content)
    total += c3
    
    if total > 0 and not dry_run:
        open(filepath, 'w', encoding='utf-8').write(content)
    
    return total, c1, c2, c3


def main():
    dry_run = '--dry-run' in sys.argv
    
    files = sorted(glob.glob('articles/*.html'))
    files = [f for f in files if 'class="mermaid"' in open(f, encoding='utf-8').read()]
    
    print(f"{'[DRY RUN] ' if dry_run else ''}Fixing {len(files)} files...")
    
    total_fixes = 0
    total_codeblock = 0
    total_dup = 0
    total_stadium = 0
    files_fixed = 0
    
    for i, fpath in enumerate(files):
        fixes, c1, c2, c3 = process_file(fpath, dry_run=dry_run)
        if fixes > 0:
            total_fixes += fixes
            total_codeblock += c1
            total_dup += c2
            total_stadium += c3
            files_fixed += 1
            fname = os.path.basename(fpath)
            parts = []
            if c1: parts.append(f'{c1} codeblock')
            if c2: parts.append(f'{c2} dup')
            if c3: parts.append(f'{c3} stadium')
            print(f'  [{i+1}/{len(files)}] {fname}: {", ".join(parts)}')
    
    print(f'\n{"="*60}')
    print(f'Files processed:         {len(files)}')
    print(f'Files modified:          {files_fixed}')
    print(f'Total fixes:             {total_fixes}')
    print(f'  Codeblock moved out:   {total_codeblock}')
    print(f'  Duplicate removed:     {total_dup}')
    print(f'  Stadium labels clean:  {total_stadium}')


if __name__ == '__main__':
    import sys
    main()
