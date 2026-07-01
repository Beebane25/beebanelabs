#!/usr/bin/env python3
"""
fix_mermaid_quality.py — Fix poor-quality mermaid diagrams.
Converts back to <pre><code> blocks:
- Diagrams with block characters (████)
- Diagrams with many short split nodes (meaningless linear flow)
- Diagrams with many truncated labels
"""

import re
import html as html_mod
import glob
import sys

def assess_mermaid_quality(code):
    """Check if a mermaid block is good quality. Returns (is_good, reason)."""
    lines = code.strip().split('\n')
    
    # Get node lines (not directives, not edges)
    skip_prefixes = ('%', 'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
                     'erDiagram', 'gantt', 'pie', 'mindmap', 'style', 'subgraph',
                     'end', 'direction', '-->', '---')
    node_lines = [l.strip() for l in lines if l.strip() and not l.strip().startswith(skip_prefixes)]
    
    if not node_lines:
        return False, 'empty'
    
    # Check 1: Block characters
    if any(c in code for c in ['\u2588\u2588', '\u2591\u2591', '\u2593\u2593']):
        return False, 'block chars'
    
    # Check 2: Too many nodes in linear flow (no branching)
    if len(node_lines) > 15:
        # Count edges
        edges = sum(1 for l in lines if '-->' in l or '---' in l)
        if edges >= len(node_lines) - 1:
            return False, f'linear {len(node_lines)} nodes'
    
    # Check 3: Many short split nodes (1-2 words each)
    if len(node_lines) >= 6:
        short = sum(1 for l in node_lines if len(l.strip('[]{}()/"')) < 15)
        if short / len(node_lines) > 0.6:
            return False, f'{short}/{len(node_lines)} short nodes'
    
    # Check 4: Many truncated labels
    truncated = len(re.findall(r'\.\.\."?\]', code))
    if truncated >= 4:
        return False, f'{truncated} truncated labels'
    
    return True, 'ok'


def mermaid_to_code_block(code):
    """Convert mermaid code back to a readable code block."""
    lines = code.strip().split('\n')
    
    # Extract node labels
    labels = []
    for line in lines:
        # Match node definitions: N0["label"], N0[label], N0{label}, etc.
        m = re.match(r'\s*\w+\[(?:"?)(.*?)(?:"?)\]', line.strip())
        if m:
            label = m.group(1).strip()
            if label and not label.startswith(('%', 'flowchart', 'graph')):
                # Clean up quoted labels
                label = label.replace('#quot;', '"')
                labels.append(label)
    
    if not labels:
        return ''
    
    # Join as readable text
    text = '\n'.join(labels)
    return f'<pre><code>{html_mod.escape(text)}</code></pre>'


def process_file(filepath, dry_run=False):
    """Process a single file. Returns count of fixes."""
    content = open(filepath, encoding='utf-8').read()
    total_fixes = 0
    
    def fix_block(match):
        nonlocal total_fixes
        raw = match.group(0)
        code = html_mod.unescape(match.group(1).strip())
        
        is_good, reason = assess_mermaid_quality(code)
        
        if not is_good:
            total_fixes += 1
            code_block = mermaid_to_code_block(code)
            if code_block:
                return code_block
            # Fallback: keep original but remove mermaid
            return f'<pre><code>{html_mod.escape(code)}</code></pre>'
        
        return raw
    
    new_content = re.sub(
        r'<pre\s+class="mermaid">\s*\n?(.*?)\s*</pre>',
        fix_block,
        content,
        flags=re.DOTALL
    )
    
    # If we converted mermaid blocks to code, check if mermaid script is still needed
    remaining_mermaid = re.findall(r'<pre\s+class="mermaid">', new_content)
    if not remaining_mermaid and 'cdn.jsdelivr.net/npm/mermaid' in new_content:
        # Remove mermaid script tag
        new_content = re.sub(r'\n?<script src="https://cdn\.jsdelivr\.net/npm/mermaid@11.*?</script>\s*', '', new_content, flags=re.DOTALL)
        new_content = re.sub(r'\n?<script>\s*mermaid\.initialize\(.*?\);\s*</script>\s*', '', new_content, flags=re.DOTALL)
    
    if total_fixes > 0 and not dry_run:
        open(filepath, 'w', encoding='utf-8').write(new_content)
    
    return total_fixes


def main():
    dry_run = '--dry-run' in sys.argv
    
    files = sorted(glob.glob('articles/*.html'))
    files = [f for f in files if 'class="mermaid"' in open(f, encoding='utf-8').read()]
    
    print(f"{'[DRY RUN] ' if dry_run else ''}Checking {len(files)} files with mermaid...")
    
    total = 0
    files_fixed = 0
    for i, fpath in enumerate(files):
        changes = process_file(fpath, dry_run=dry_run)
        fname = fpath.replace('\\', '/').split('/')[-1]
        if changes > 0:
            total += changes
            files_fixed += 1
            print(f"  [{i+1}/{len(files)}] {fname}: {changes} bad diagrams → code blocks")
    
    print(f"\n{'='*60}")
    print(f"Files checked:       {len(files)}")
    print(f"Files modified:      {files_fixed}")
    print(f"Bad diagrams fixed:  {total}")


if __name__ == '__main__':
    main()
