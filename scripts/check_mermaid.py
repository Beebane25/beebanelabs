#!/usr/bin/env python3
"""
check_mermaid.py — Extract and validate all mermaid blocks from articles.
Reports syntax issues per file for fixing.
"""

import re
import html
import glob
import sys

def extract_mermaid_blocks(content):
    """Extract all <pre class="mermaid"> blocks from HTML content."""
    blocks = []
    pattern = re.compile(r'<pre\s+class="mermaid">\s*\n?(.*?)\s*</pre>', re.DOTALL)
    for match in pattern.finditer(content):
        code = match.group(1).strip()
        # Unescape HTML entities
        code = html.unescape(code)
        blocks.append({
            'raw': match.group(0),
            'code': code,
            'start': match.start(),
            'end': match.end()
        })
    return blocks


def validate_mermaid(code):
    """Check mermaid code for common syntax errors. Returns list of issues."""
    issues = []
    lines = code.split('\n')
    
    if not lines:
        issues.append("Empty mermaid block")
        return issues
    
    # Check first line for diagram type
    first_line = lines[0].strip()
    valid_types = ['flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
                   'stateDiagram', 'erDiagram', 'gantt', 'pie', 'mindmap',
                   'timeline', 'block', 'sankey', 'xychart-beta']
    
    has_valid_type = any(first_line.startswith(t) for t in valid_types)
    if not has_valid_type:
        issues.append(f"Invalid diagram type: '{first_line[:50]}'")
    
    # Check for common syntax issues
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped or stripped.startswith('%') or stripped.startswith('%%'):
            continue
        
        # Check for unescaped special chars in labels
        # Mermaid uses [ ] for rectangle, ( ) for rounded, { } for diamond
        # Inside labels, these need escaping
        
        # Check for empty node definitions
        if re.search(r'\[\s*\]', stripped):
            issues.append(f"Line {i}: Empty node label []")
        
        # Check for unclosed brackets
        for open_c, close_c, name in [('(', ')', 'parens'), ('[', ']', 'brackets'), ('{', '}', 'braces')]:
            # Count excluding escaped chars
            opens = stripped.count(open_c) - stripped.count(f'\\{open_c}')
            closes = stripped.count(close_c) - stripped.count(f'\\{close_c}')
            if opens != closes:
                # This is a heuristic - might be in labels
                pass
        
        # Check for problematic chars that break mermaid 11
        # & in labels (should be &amp; in HTML but unescaped in mermaid)
        if '&' in stripped and '-->' not in stripped and '&' not in stripped.replace('&amp;', ''):
            if '& ' in stripped or ' &' in stripped or stripped.endswith('&'):
                issues.append(f"Line {i}: Bare '&' character may cause parse error")
        
        # Check for HTML tags in mermaid (breaks parser)
        if re.search(r'<[a-zA-Z]', stripped) and not stripped.startswith('%%'):
            issues.append(f"Line {i}: HTML tag detected: '{stripped[:60]}'")
        
        # Check for trailing backslash
        if stripped.endswith('\\'):
            issues.append(f"Line {i}: Trailing backslash")
        
        # Check for broken arrow syntax
        if re.search(r'-->\s*-->', stripped):
            issues.append(f"Line {i}: Double arrow: '{stripped[:60]}'")
    
    # Check for subgraph without end
    subgraph_count = sum(1 for l in lines if l.strip().startswith('subgraph'))
    end_count = sum(1 for l in lines if l.strip() == 'end')
    if subgraph_count > 0 and subgraph_count != end_count:
        issues.append(f"Subgraph/end mismatch: {subgraph_count} subgraph vs {end_count} end")
    
    # Check for style declarations with invalid syntax
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith('style '):
            # style should be: style nodeId fill:color,stroke:color
            if ',' in stripped and 'fill:' not in stripped:
                issues.append(f"Line {i}: Invalid style syntax: '{stripped[:60]}'")
    
    return issues


def check_node_labels(code):
    """Check for node labels that may cause mermaid 11 parse errors."""
    issues = []
    lines = code.split('\n')
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped or stripped.startswith('%') or stripped.startswith('%%'):
            continue
        if stripped.startswith(('flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
                               'stateDiagram', 'erDiagram', 'gantt', 'pie', 'mindmap',
                               'style', 'subgraph', 'end', 'direction')):
            continue
        
        # Find node labels in brackets
        # Pattern: nodeId[label text] or nodeId(label text) or nodeId{label text}
        labels = re.findall(r'[\w]+\s*[\[\(\{](.*?)[\]\)\}]', stripped)
        for label in labels:
            # Check for problematic characters
            if '"' in label and not label.startswith('"'):
                # Unescaped quote
                issues.append(f"Line {i}: Unescaped quote in label: '{label[:40]}'")
            
            # Check for very long labels (may cause rendering issues)
            if len(label) > 80:
                issues.append(f"Line {i}: Very long label ({len(label)} chars): '{label[:40]}...'")
    
    return issues


def main():
    files = sorted(glob.glob('articles/*.html'))
    if '--file' in sys.argv:
        idx = sys.argv.index('--file')
        files = [sys.argv[idx + 1]]
    
    total_blocks = 0
    total_issues = 0
    files_with_issues = []
    
    for fpath in files:
        content = open(fpath, encoding='utf-8').read()
        blocks = extract_mermaid_blocks(content)
        
        if not blocks:
            continue
        
        file_issues = []
        for j, block in enumerate(blocks):
            total_blocks += 1
            issues = validate_mermaid(block['code'])
            label_issues = check_node_labels(block['code'])
            all_issues = issues + label_issues
            
            if all_issues:
                for issue in all_issues:
                    file_issues.append(f"  Block {j+1}: {issue}")
                    total_issues += 1
        
        fname = fpath.replace('\\', '/').split('/')[-1]
        if file_issues:
            files_with_issues.append(fname)
            print(f"\n❌ {fname} ({len(blocks)} blocks, {len(file_issues)} issues)")
            for issue in file_issues[:10]:
                print(f"  {issue}")
            if len(file_issues) > 10:
                print(f"  ... and {len(file_issues) - 10} more")
        else:
            print(f"✅ {fname} ({len(blocks)} blocks)")
    
    print(f"\n{'='*60}")
    print(f"Files checked:      {len(files)}")
    print(f"Total mermaid:      {total_blocks}")
    print(f"Total issues:       {total_issues}")
    print(f"Files with issues:  {len(files_with_issues)}")


if __name__ == '__main__':
    main()
