#!/usr/bin/env python3
"""
fix_broken_diagrams.py — Fix all broken diagrams (code blocks that should be mermaid).
Generates proper mermaid flowcharts from the broken content.
"""

import re
import html as html_mod
import glob
import os

# Map of article filenames to their broken diagrams and fixes
# Format: { 'filename.html': [ (label_pattern, old_content_lines, new_mermaid), ... ] }

def fix_file(filepath, dry_run=False):
    """Fix broken diagrams in a single file."""
    content = open(filepath, encoding='utf-8').read()
    fname = os.path.basename(filepath)
    fixes = 0
    
    # Find all diagram-box with short code blocks
    pattern = re.compile(
        r'(<div class="diagram-box">\s*\n\s*<div class="diagram-label">)(Diagram: )(.*?)(</div>\s*\n)<pre><code>(.*?)</code></pre>',
        re.DOTALL
    )
    
    def replace_diagram(m):
        nonlocal fixes
        prefix = m.group(1)
        diagram_word = m.group(2)
        label = m.group(3).strip()
        label_close = m.group(4)
        code = html_mod.unescape(m.group(5).strip())
        lines = [l.strip() for l in code.split('\n') if l.strip()]
        
        # Skip if already mermaid or too long
        if len(lines) > 10 or any('-->' in l for l in lines):
            return m.group(0)
        
        # Generate mermaid from the content
        mermaid_lines = ['flowchart TD']
        
        # Create nodes from content lines
        for i, line in enumerate(lines[:15]):
            nid = 'N' + str(i)
            # Clean the label
            clean = line.replace('"', '#quot;').replace('\n', ' ')
            if len(clean) > 50:
                clean = clean[:47] + '...'
            mermaid_lines.append('    ' + nid + '["' + clean + '"]')
        
        # Add connections
        mermaid_lines.append('')
        for i in range(len(lines) - 1):
            if i < 14:  # Max 15 nodes
                mermaid_lines.append('    N' + str(i) + ' --> N' + str(i+1))
        
        # Add style
        mermaid_lines.append('')
        mermaid_lines.append('    style N0 fill:#0f2a1f,stroke:#3ecf8e,stroke-width:2px')
        
        fixes += 1
        return prefix + diagram_word + label + label_close + '<pre class="mermaid">\n' + '\n'.join(mermaid_lines) + '\n</pre>'
    
    new_content = pattern.sub(replace_diagram, content)
    
    if fixes > 0 and not dry_run:
        open(filepath, 'w', encoding='utf-8').write(new_content)
    
    return fixes

def main():
    dry_run = '--dry-run' in __import__('sys').argv
    
    files = sorted(glob.glob('articles/*.html'))
    total_fixes = 0
    files_fixed = 0
    
    for fpath in files:
        content = open(fpath, encoding='utf-8').read()
        fname = os.path.basename(fpath)
        
        # Check if file has broken diagrams
        has_broken = bool(re.search(r'<div class="diagram-box">.*?<pre><code>.{5,200}</code></pre>', content, re.DOTALL))
        if not has_broken:
            continue
        
        fixes = fix_file(fpath, dry_run=dry_run)
        if fixes > 0:
            total_fixes += fixes
            files_fixed += 1
            print('  ' + fname + ': ' + str(fixes) + ' diagrams fixed')
    
    print('\n' + '=' * 60)
    print('Files processed: ' + str(len(files)))
    print('Files modified: ' + str(files_fixed))
    print('Diagrams fixed: ' + str(total_fixes))

if __name__ == '__main__':
    main()
