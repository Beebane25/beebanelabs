import re, html, glob

issues = []
for fpath in sorted(glob.glob('articles/*.html')):
    content = open(fpath, encoding='utf-8').read()
    blocks = re.findall(r'<pre class="mermaid">(.*?)</pre>', content, re.DOTALL)
    if not blocks:
        continue
    
    fname = fpath.replace('\\', '/').split('/')[-1]
    for i, block in enumerate(blocks):
        code = html.unescape(block.strip())
        
        # Check for block characters
        if any(c in code for c in ['\u2588\u2588\u2588\u2588', '\u2591\u2591\u2591\u2591', '\u2593\u2593\u2593\u2593']):
            issues.append((fname, i+1, 'block chars'))
        
        # Check for truncated labels (ending with ...)
        truncated = len(re.findall(r'\.\.\."', code))
        if truncated >= 3:
            issues.append((fname, i+1, f'{truncated} truncated labels'))
        
        # Check for very short split labels
        lines = [l.strip() for l in code.split('\n') if l.strip() and not l.strip().startswith(('%','flowchart','graph','style','subgraph','end','direction'))]
        if len(lines) >= 8:
            short = sum(1 for l in lines if len(l) < 20 and '->' not in l and '-->' not in l)
            if short >= 6:
                issues.append((fname, i+1, f'{short}/{len(lines)} short nodes'))

print(f'Issues found: {len(issues)}')
for fname, block, issue in issues[:40]:
    print(f'  {fname} Block {block}: {issue}')
