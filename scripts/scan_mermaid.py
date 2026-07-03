#!/usr/bin/env python3
"""Scan all articles for Mermaid diagrams (<pre class="mermaid">) and extract for verification."""
import os, re, json

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
articles_dir = os.path.join(base, 'articles')

results = []

for f in sorted(os.listdir(articles_dir)):
    if not f.endswith('.html') or f == '__pycache__':
        continue
    filepath = os.path.join(articles_dir, f)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    
    slug = f.replace('.html', '')
    title_match = re.search(r'<title>([^|<]+)', html)
    title = title_match.group(1).strip().replace(' | BeebaneLabs', '') if title_match else slug
    cat_match = re.search(r'article:section.*?content="([^"]+)"', html)
    cat = cat_match.group(1) if cat_match else 'Unknown'
    
    # Find <pre class="mermaid"> blocks
    mermaid_blocks = re.findall(r'<pre\s+class="mermaid">\s*(.*?)\s*</pre>', html, re.DOTALL)
    
    if not mermaid_blocks:
        continue
    
    diagrams = []
    for i, block in enumerate(mermaid_blocks):
        code = block.strip()
        first_line = code.split('\n')[0].strip() if code else ''
        diagram_type = first_line.split()[0] if first_line else 'unknown'
        diagrams.append({
            'index': i + 1,
            'type': diagram_type,
            'first_line': first_line[:120],
            'full_code': code[:800]
        })
    
    results.append({
        'slug': slug,
        'title': title,
        'cat': cat,
        'diagram_count': len(diagrams),
        'diagrams': diagrams
    })

# Summary
total_diagrams = sum(r['diagram_count'] for r in results)
print(f"Articles with Mermaid: {len(results)}")
print(f"Total diagrams: {total_diagrams}")
print()

# By category
cat_counts = {}
for r in results:
    cat_counts[r['cat']] = cat_counts.get(r['cat'], 0) + r['diagram_count']
print("Diagrams per category:")
for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count} diagrams in {len([r for r in results if r['cat']==cat])} articles")

print()
print("=" * 80)
print("ALL ARTICLES WITH MERMAID DIAGRAMS")
print("=" * 80)

# Print in batches of 20 for readability
for idx, r in enumerate(sorted(results, key=lambda x: x['cat'])):
    print(f"\n[{idx+1:3d}] {r['slug']}")
    print(f"      Cat: {r['cat']} | Diagrams: {r['diagram_count']}")
    print(f"      Title: {r['title'][:80]}")
    for d in r['diagrams']:
        print(f"      [{d['index']}] {d['type']}: {d['first_line'][:80]}")

# Save to JSON
output_path = os.path.join(base, 'scripts', 'mermaid_audit.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print(f"\n\nSaved to {output_path}")
