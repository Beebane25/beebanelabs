#!/usr/bin/env python3
"""
fix_bare_pre.py — Wrap bare <pre> content with <code> tags for syntax highlighting.

Converts: <pre>code here</pre>
To:       <pre><code>code here</code></pre>

Skips: <pre class="mermaid">, <pre><code>, <pre><code class="...">
"""

import re
import sys
from pathlib import Path
import glob

def fix_bare_pre(content: str) -> tuple:
    """Fix bare <pre> tags. Returns (new_content, count_fixed)."""
    count = 0
    
    def replace_pre(match):
        nonlocal count
        full = match.group(0)
        attrs = match.group(1)  # e.g., '' or ' class="mermaid"'
        inner = match.group(2)
        
        # Skip mermaid blocks
        if 'mermaid' in (attrs or ''):
            return full
        
        # Skip if already has <code>
        if inner.lstrip().startswith('<code'):
            return full
        
        # Skip empty blocks
        if not inner.strip():
            return full
        
        count += 1
        return f'<pre{attrs}><code>{inner}</code></pre>'
    
    # Match <pre>content</pre> where content is NOT <code
    # Use DOTALL to match multiline content
    new_content = re.sub(
        r'<pre([^>]*)>(.*?)</pre>',
        replace_pre,
        content,
        flags=re.DOTALL
    )
    
    return new_content, count


def process_file(filepath: str, dry_run: bool = False) -> int:
    """Process a single file. Returns count of fixes."""
    path = Path(filepath)
    content = path.read_text(encoding='utf-8')
    
    new_content, count = fix_bare_pre(content)
    
    if count > 0 and not dry_run:
        path.write_text(new_content, encoding='utf-8')
    
    return count


def main():
    dry_run = '--dry-run' in sys.argv
    limit = 0
    for arg in sys.argv:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
    
    files = sorted(glob.glob('articles/*.html'))
    if limit > 0:
        files = files[:limit]
    
    print(f"{'[DRY RUN] ' if dry_run else ''}Processing {len(files)} files...")
    
    total_fixed = 0
    files_fixed = 0
    
    for i, fpath in enumerate(files):
        count = process_file(fpath, dry_run=dry_run)
        if count > 0:
            total_fixed += count
            files_fixed += 1
            if count >= 5:
                fname = fpath.replace('\\', '/').split('/')[-1]
                print(f"  [{i+1}/{len(files)}] {fname}: {count} fixed")
    
    print(f"\n{'='*60}")
    print(f"Files processed:   {len(files)}")
    print(f"Files modified:    {files_fixed}")
    print(f"Total <pre> fixed: {total_fixed}")


if __name__ == '__main__':
    main()
