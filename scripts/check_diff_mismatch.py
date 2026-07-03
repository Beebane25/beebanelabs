#!/usr/bin/env python3
"""Find ALL difficulty label mismatches between ALL_ARTICLES (app.js) and article HTML files."""
import os, re, json

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
articles_dir = os.path.join(base, 'articles')

# Step 1: Extract diff from ALL_ARTICLES in app.js
with open(os.path.join(base, 'js', 'app.js'), 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

aa_start = content.find('const ALL_ARTICLES')
aa_block_start = content.find('[', aa_start)
depth, i = 0, aa_block_start
while i < len(content):
    if content[i] == '[': depth += 1
    elif content[i] == ']':
        depth -= 1
        if depth == 0: break
    i += 1
aa_block = content[aa_start:i+1]

# Extract slug -> diff mapping from JS
js_entries = re.findall(r"slug:\s*'([^']+)'.*?diff:\s*'([^']*)'", aa_block, re.DOTALL)
js_diff = {slug: diff for slug, diff in js_entries}

print(f"ALL_ARTICLES entries: {len(js_diff)}")

# Step 2: Extract diff from HTML files
mismatches = []
html_diff = {}

for f in sorted(os.listdir(articles_dir)):
    if not f.endswith('.html') or f == '__pycache__':
        continue
    filepath = os.path.join(articles_dir, f)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    
    slug = f.replace('.html', '')
    
    # Get difficulty from HTML span
    diff_match = re.search(r'class="difficulty\s+(\w+)"', html)
    html_d = diff_match.group(1) if diff_match else 'MISSING'
    html_diff[slug] = html_d
    
    # Compare with JS
    js_d = js_diff.get(slug, 'MISSING')
    
    if js_d != html_d:
        mismatches.append({
            'slug': slug,
            'js_diff': js_d,
            'html_diff': html_d
        })

print(f"\nTotal mismatches: {len(mismatches)}")
print()

if mismatches:
    print("=" * 70)
    print("DIFFICULTY LABEL MISMATCHES (JS card vs HTML content)")
    print("=" * 70)
    
    # Group by mismatch type
    by_type = {}
    for m in mismatches:
        key = f"{m['js_diff']} → {m['html_diff']}"
        if key not in by_type:
            by_type[key] = []
        by_type[key].append(m['slug'])
    
    for key, slugs in sorted(by_type.items(), key=lambda x: -len(x[1])):
        print(f"\n{key} ({len(slugs)} articles):")
        for s in slugs[:10]:
            print(f"  - {s}")
        if len(slugs) > 10:
            print(f"  ... and {len(slugs)-10} more")
else:
    print("No mismatches found!")

# Step 3: Distribution comparison
print("\n\n" + "=" * 70)
print("DISTRIBUTION COMPARISON")
print("=" * 70)

js_dist = {}
html_dist = {}
for slug, d in js_diff.items():
    js_dist[d] = js_dist.get(d, 0) + 1
for slug, d in html_diff.items():
    html_dist[d] = html_dist.get(d, 0) + 1

print(f"\n{'Label':<12} {'JS (card)':<12} {'HTML (content)':<15} {'Match'}")
print("-" * 55)
all_labels = sorted(set(list(js_dist.keys()) + list(html_dist.keys())))
for label in all_labels:
    js_c = js_dist.get(label, 0)
    html_c = html_dist.get(label, 0)
    match = "✓" if js_c == html_c else f"✗ diff={js_c - html_c}"
    print(f"{label:<12} {js_c:<12} {html_c:<15} {match}")
