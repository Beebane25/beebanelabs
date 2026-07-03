#!/usr/bin/env python3
"""BeebaneLabs Content Quality Audit — scans all 451 articles."""
import os, re, sys

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
articles_dir = os.path.join(base, 'articles')

results = {
    'total': 0,
    'missing_meta': [],
    'missing_og': [],
    'missing_canonical': [],
    'missing_robots': [],
    'missing_twitter': [],
    'missing_jsonld': [],
    'missing_breadcrumb': [],
    'missing_toc': [],
    'missing_quiz': [],
    'missing_code_block': [],
    'missing_adsense': [],
    'empty_content': [],
    'short_content': [],
    'wrong_css_version': [],
    'wrong_js_version': [],
    'duplicate_head': [],
    'no_h2': [],
    'category_distribution': {},
    'difficulty_distribution': {},
    'access_distribution': {},
}

total_content_len = 0

for f in sorted(os.listdir(articles_dir)):
    if not f.endswith('.html') or f == '__pycache__':
        continue
    results['total'] += 1
    filepath = os.path.join(articles_dir, f)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    
    slug = f.replace('.html', '')
    content_len = len(html)
    total_content_len += content_len
    
    # Check meta tags
    if 'article:section' not in html:
        results['missing_meta'].append(slug)
    
    # Check OG tags
    if 'og:title' not in html or 'og:description' not in html:
        results['missing_og'].append(slug)
    
    # Check canonical
    if 'rel="canonical"' not in html:
        results['missing_canonical'].append(slug)
    
    # Check robots
    if 'name="robots"' not in html:
        results['missing_robots'].append(slug)
    
    # Check Twitter Card
    if 'twitter:card' not in html:
        results['missing_twitter'].append(slug)
    
    # Check JSON-LD
    if 'application/ld+json' not in html:
        results['missing_jsonld'].append(slug)
    
    # Check BreadcrumbList
    if 'BreadcrumbList' not in html:
        results['missing_breadcrumb'].append(slug)
    
    # Check TOC (Daftar Isi)
    if 'Daftar Isi' not in html and 'daftar isi' not in html.lower():
        results['missing_toc'].append(slug)
    
    # Check Quiz
    if 'initQuiz' not in html:
        results['missing_quiz'].append(slug)
    
    # Check code blocks
    if '<pre>' not in html and 'copyCode' not in html and 'Salin kode' not in html:
        results['missing_code_block'].append(slug)
    
    # Check AdSense
    if 'adsbygoogle' not in html:
        results['missing_adsense'].append(slug)
    
    # Check head/body duplication
    head_count = html.count('</head>')
    if head_count > 1:
        results['duplicate_head'].append(slug)
    
    # Check h2 headings (content structure)
    h2_count = len(re.findall(r'<h2', html))
    if h2_count < 2:
        results['no_h2'].append((slug, h2_count))
    
    # Check CSS/JS versions
    if 'style.css?v=13.6' not in html:
        results['wrong_css_version'].append(slug)
    if 'app.js?v=18.1' not in html:
        results['wrong_js_version'].append(slug)
    
    # Extract category
    cat_match = re.search(r'article:section.*?content="([^"]+)"', html)
    cat = cat_match.group(1) if cat_match else 'MISSING'
    results['category_distribution'][cat] = results['category_distribution'].get(cat, 0) + 1
    
    # Extract difficulty
    diff_match = re.search(r'difficulty.*?content="([^"]+)"', html)
    diff = diff_match.group(1) if diff_match else 'MISSING'
    results['difficulty_distribution'][diff] = results['difficulty_distribution'].get(diff, 0) + 1
    
    # Track short content
    if content_len < 5000:
        results['short_content'].append((slug, content_len))
    
    # Access type
    if 'TOKEN' in html and 'Artikel Terkunci' in html:
        results['access_distribution']['Token'] = results['access_distribution'].get('Token', 0) + 1
    else:
        results['access_distribution']['Gratis'] = results['access_distribution'].get('Gratis', 0) + 1

avg_len = total_content_len // max(results['total'], 1)

print(f"Total articles: {results['total']}")
print(f"Avg content length: {avg_len} chars")
print()
print("--- MISSING ELEMENTS ---")
for key in ['missing_meta', 'missing_og', 'missing_canonical', 'missing_robots',
            'missing_twitter', 'missing_jsonld', 'missing_breadcrumb', 'missing_toc',
            'missing_quiz', 'missing_code_block', 'missing_adsense',
            'duplicate_head', 'wrong_css_version', 'wrong_js_version', 'short_content',
            'no_h2']:
    count = len(results[key])
    if count > 0:
        print(f"{key}: {count} files")
        if count <= 8:
            for item in results[key]:
                if isinstance(item, tuple):
                    print(f"  - {item[0]} (h2 count: {item[1]})")
                else:
                    print(f"  - {item}")

print()
print("--- CATEGORY DISTRIBUTION ---")
for cat, count in sorted(results['category_distribution'].items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count}")

print()
print("--- DIFFICULTY DISTRIBUTION ---")
for diff, count in sorted(results['difficulty_distribution'].items(), key=lambda x: -x[1]):
    print(f"  {diff}: {count}")

print()
print("--- ACCESS DISTRIBUTION ---")
for acc, count in sorted(results['access_distribution'].items(), key=lambda x: -x[1]):
    print(f"  {acc}: {count}")
