import re, glob, os

# Read app.js
with open('C:/Users/user/Documents/pribadi/web adsence/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Read article files for ground truth
art_diffs = {}
for af in glob.glob('C:/Users/user/Documents/pribadi/web adsence/articles/*.html'):
    slug = os.path.basename(af).replace('.html', '')
    with open(af, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    m = re.search(r'class="difficulty\s+(pemula|menengah|lanjut)"', c)
    if m:
        art_diffs[slug] = m.group(1)

print(f"Loaded {len(art_diffs)} article difficulties")

# Fix ALL_ARTICLES entries
fixes = 0
for slug, correct_diff in art_diffs.items():
    # Find the entry in ALL_ARTICLES using slug
    # Pattern: slug: 'slug-name', ... diff: 'wrong'
    pat = r"(slug:\s*'" + re.escape(slug) + r"'.*?diff:\s*')([^']+)(')"
    m = re.search(pat, content, re.DOTALL)
    if m:
        current = m.group(2)
        if current != correct_diff:
            old = m.group(0)
            new = m.group(1) + correct_diff + m.group(3)
            content = content.replace(old, new, 1)
            fixes += 1

with open('C:/Users/user/Documents/pribadi/web adsence/js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {fixes} ALL_ARTICLES difficulty entries in app.js")
