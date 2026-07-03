#!/usr/bin/env python3
"""Find ALL broken single-node Mermaid diagrams (stub diagrams with no connections)."""
import os, re, json

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
articles_dir = os.path.join(base, 'articles')

broken = []

for f in sorted(os.listdir(articles_dir)):
    if not f.endswith('.html') or f == '__pycache__':
        continue
    filepath = os.path.join(articles_dir, f)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    
    slug = f.replace('.html', '')
    
    # Find all mermaid blocks
    mermaid_blocks = re.findall(r'<pre\s+class="mermaid">\s*(.*?)\s*</pre>', html, re.DOTALL)
    
    for i, block in enumerate(mermaid_blocks):
        code = block.strip()
        lines = [l.strip() for l in code.split('\n') if l.strip()]
        
        # Check for broken patterns:
        # 1. Single node with no connections (no --> or --- or ==> or ~~~)
        has_connection = any('-->' in l or '---' in l or '==>' in l or '~~~' in l or '-.->' in l or '-->' in l for l in lines)
        
        # 2. Only has flowchart header + style + 1 node
        node_count = len(re.findall(r'\[[^\]]+\]|\{[^}]+\}|\([^)]+\)', code))
        
        # 3. Check for the specific broken pattern: single N0 node with style
        is_single_styled = (
            node_count <= 1 and 
            'style N0' in code and 
            not has_connection
        )
        
        # 4. Also check for meaningless content
        has_meaningless = bool(re.search(r'N0\["?(⏳|✅|Column [12])', code))
        
        if is_single_styled or (node_count <= 1 and not has_connection):
            # Get surrounding context (the h2/h3 heading before this diagram)
            # Find the position of this mermaid block in the HTML
            block_start = html.find(block)
            preceding = html[:block_start]
            # Get the last h2/h3 before this block
            headings = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', preceding, re.DOTALL)
            last_heading = re.sub(r'<[^>]+>', '', headings[-1]).strip() if headings else 'Unknown'
            
            # Get the node label
            label_match = re.search(r'N0\["?([^"\]]+)"?\]', code)
            label = label_match.group(1) if label_match else 'Unknown'
            
            broken.append({
                'slug': slug,
                'diagram_index': i + 1,
                'heading': last_heading[:80],
                'node_label': label[:80],
                'code': code[:200]
            })
        
        if has_meaningless and not is_single_styled:
            block_start = html.find(block)
            preceding = html[:block_start]
            headings = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', preceding, re.DOTALL)
            last_heading = re.sub(r'<[^>]+>', '', headings[-1]).strip() if headings else 'Unknown'
            
            broken.append({
                'slug': slug,
                'diagram_index': i + 1,
                'heading': last_heading[:80],
                'node_label': 'MEANINGLESS',
                'code': code[:200]
            })

print(f"Total broken single-node diagrams found: {len(broken)}")
print()
for b in broken:
    print(f"  {b['slug']} [D{b['diagram_index']}]")
    print(f"    Section: {b['heading']}")
    print(f"    Node: {b['node_label']}")
    print()

# Save to JSON for fix script
output = os.path.join(base, 'scripts', 'broken_diagrams.json')
with open(output, 'w', encoding='utf-8') as f:
    json.dump(broken, f, indent=2, ensure_ascii=False)
print(f"Saved to {output}")
