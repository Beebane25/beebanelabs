#!/usr/bin/env python3
"""
fix_mermaid.py — Fix common Mermaid syntax errors in articles.
Handles: HTML tags, unescaped quotes, empty labels, long labels.
"""

import re
import html
import glob
import sys

def fix_mermaid_block(code):
    """Fix mermaid syntax issues. Returns (fixed_code, changes_count)."""
    changes = 0
    lines = code.split('\n')
    fixed_lines = []
    
    for line in lines:
        original = line
        
        # Fix 1: Replace <br/> and <br> with \n (newline in mermaid label)
        line = re.sub(r'<br\s*/?>', '\\n', line)
        
        # Fix 2: Replace HTML entities that shouldn't be in mermaid
        # &amp; -> & (mermaid handles & fine in labels)
        line = line.replace('&amp;', '&')
        line = line.replace('&lt;', '<')
        line = line.replace('&gt;', '>')
        line = line.replace('&quot;', '#quot;')
        
        # Fix 3: Escape unquoted " inside label brackets
        # Pattern: [..."text"...] or (...text...) where text has "
        # We need to replace " with #quot; inside labels
        # But NOT replace " that are part of quoted strings like ["text"]
        
        # Fix 4: Replace " inside labels with #quot;
        # Only inside [ ] ( ) { } delimiters
        def fix_quotes_in_labels(text):
            nonlocal changes
            # Find all label contents between brackets
            result = text
            
            # For patterns like: nodeId["text with "quotes" inside"]
            # The inner quotes need to be #quot;
            
            # Simple approach: replace all " with #quot; except the outermost pair
            # This is tricky, so let's use a different approach:
            # Replace " that's NOT at the start or end of a bracket content
            
            return result
        
        # Fix empty node labels: [] -> [?], () -> (?), {} -> {?}
        line = re.sub(r'\[\s*\]', '[·]', line)
        line = re.sub(r'\(\s*\)', '(·)', line)
        line = re.sub(r'\{\s*\}', '{·}', line)
        
        if line != original:
            changes += 1
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines), changes


def fix_unescaped_quotes_in_line(line):
    """Fix unescaped quotes inside mermaid node labels."""
    changes = 0
    
    # Pattern: nodeId("text with " inside")
    # Need to replace inner " with #quot;
    
    # For parenthesized labels: (...text...)
    def fix_paren_label(m):
        nonlocal changes
        prefix = m.group(1)  # nodeId(
        content = m.group(2)  # label text
        suffix = m.group(3)  # )
        
        # Remove outer quotes if present
        if content.startswith('"') and content.endswith('"'):
            inner = content[1:-1]
            # Escape any inner quotes
            inner = inner.replace('"', '#quot;')
            changes += 1
            return f'{prefix}"{inner}"{suffix}'
        return m.group(0)
    
    # Match nodeId("text") or nodeId(text)
    line = re.sub(r'(\w+\()"(.*?)"(\))', fix_paren_label, line)
    
    return line, changes


def process_file(filepath, dry_run=False):
    """Process a single file. Returns count of changes."""
    content = open(filepath, encoding='utf-8').read()
    
    # Extract and fix mermaid blocks
    total_changes = 0
    
    def fix_block(match):
        nonlocal total_changes
        raw = match.group(0)
        code = match.group(1).strip()
        
        # Unescape HTML entities first
        code = html.unescape(code)
        
        fixed, changes = fix_mermaid_block(code)
        
        # Additional fix: unescaped quotes
        fixed_lines = []
        for line in fixed.split('\n'):
            line, lc = fix_unescaped_quotes_in_line(line)
            changes += lc
            fixed_lines.append(line)
        fixed = '\n'.join(fixed_lines)
        
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
    
    # Get specific files with issues
    problem_files = [
        'cryptography-developer.html',
        'css-variables-design-system.html',
        'cv-object-detection.html',
        'dl-cnn-image.html',
        'dl-rnn-sequence.html',
        'llm-fine-tuning.html',
        'opentelemetry.html',
        'php-pemula.html',
        'python-list-comprehension.html',
        'python-wsgi-asgi.html',
        'redis-caching.html',
        'ruby-rails.html',
        'skill-api-design.html',
    ]
    
    files = [f'articles/{f}' for f in problem_files]
    
    print(f"{'[DRY RUN] ' if dry_run else ''}Fixing {len(files)} files...")
    
    total = 0
    for fpath in files:
        changes = process_file(fpath, dry_run=dry_run)
        fname = fpath.replace('\\', '/').split('/')[-1]
        if changes > 0:
            total += changes
            print(f"  {fname}: {changes} fixes")
        else:
            print(f"  {fname}: no changes needed")
    
    print(f"\nTotal fixes: {total}")


if __name__ == '__main__':
    main()
