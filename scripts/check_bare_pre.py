import re, glob

issues = []
for fpath in sorted(glob.glob('articles/*.html')):
    content = open(fpath, encoding='utf-8').read()
    
    # Find bare <pre> tags (not followed by <code or with class=)
    bare_pres = re.findall(r'<pre>(?!<code)', content)
    
    if bare_pres:
        fname = fpath.replace('\\', '/').split('/')[-1]
        issues.append((fname, len(bare_pres)))

print(f'Files with bare <pre> tags: {len(issues)}')
total = 0
for fname, count in sorted(issues, key=lambda x: -x[1]):
    total += count
    if count >= 2:
        print(f'  {fname}: {count} bare <pre>')
print(f'Total bare <pre> blocks: {total}')
