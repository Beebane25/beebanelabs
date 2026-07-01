import os, re, glob

kategori_dir = 'C:/Users/user/Documents/pribadi/web adsence/kategori'
articles_dir = 'C:/Users/user/Documents/pribadi/web adsence/articles'

# Parse all article files for difficulty (source of truth)
art_diffs = {}
for af in glob.glob(os.path.join(articles_dir, '*.html')):
    slug = os.path.basename(af).replace('.html', '')
    with open(af, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    m = re.search(r'class="difficulty\s+(pemula|menengah|lanjut)"', content)
    if m:
        art_diffs[slug] = m.group(1)

print(f"Loaded {len(art_diffs)} article difficulties")

# Fix kategori pages
total_fixes = 0
cap_map = {'pemula': 'Pemula', 'menengah': 'Menengah', 'lanjut': 'Lanjut'}

for kf in sorted(glob.glob(os.path.join(kategori_dir, '*.html'))):
    with open(kf, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    fixes = 0
    
    # Strategy: find each article card block and fix its difficulty
    # Pattern: <a href="../articles/SLUG.html" ... difficulty X ... </a>
    # We'll iterate through each occurrence of ../articles/SLUG
    
    for match in re.finditer(r'href="\.\./(articles/([^"]+))"', content):
        slug = match.group(2).replace('.html', '')
        if slug not in art_diffs:
            continue
        
        correct_diff = art_diffs[slug]
        correct_cap = cap_map[correct_diff]
        
        # Find difficulty badge within next 800 chars of this match
        search_start = match.end()
        search_end = min(search_start + 800, len(content))
        chunk = content[search_start:search_end]
        
        # Find current difficulty class + text
        dm = re.search(r'(class="difficulty\s+)(pemula|menengah|lanjut)(">)([^<]*)(</span>)', chunk)
        if dm:
            current_diff = dm.group(2)
            current_text = dm.group(4)
            
            if current_diff != correct_diff:
                # Build replacement
                old_str = dm.group(0)
                new_str = f'class="difficulty {correct_diff}">{correct_cap}</span>'
                
                abs_start = search_start + dm.start()
                abs_end = search_start + dm.end()
                content = content[:abs_start] + new_str + content[abs_end:]
                fixes += 1
    
    if fixes > 0:
        with open(kf, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f'{os.path.basename(kf)}: {fixes} fixes')
        total_fixes += fixes

print(f'\nTotal: {total_fixes} difficulty fixes across kategori pages')
