import json, re, os, textwrap

with open('mermaid_audit.json') as f:
    data = json.load(f)

articles_dir = 'C:/Users/user/Documents/pribadi/web adsence/articles'

for i in range(184, min(276, len(data))):
    a = data[i]
    slug = a['slug']
    title = a['title']
    fname = os.path.join(articles_dir, f'{slug}.html')
    
    with open(fname, encoding='utf-8') as f:
        html = f.read()
    
    h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL)
    h2s = [re.sub(r'<[^>]+>', '', h).strip() for h in h2s]
    
    mermaid_blocks = re.findall(r'<pre\s+class=[\"\']mermaid[\"\']\s*>(.*?)</pre>', html, re.DOTALL)
    
    print(f'\n{"="*80}')
    print(f'ARTICLE {i}: {slug}')
    print(f'TITLE: {title}')
    print(f'H2s: {h2s[:10]}')
    print(f'Diagrams: {len(mermaid_blocks)}')
    
    for j, block in enumerate(mermaid_blocks):
        # Clean up the mermaid code for display
        clean = block.strip()
        # Extract node labels
        labels = re.findall(r'\["([^"]+)"\]', clean)
        if not labels:
            labels = re.findall(r'\[([^\[\]]+)\]', clean)
        
        print(f'\n  --- Diagram {j+1} ---')
        # Show diagram type
        first_lines = clean[:200].replace('\n', ' | ')
        print(f'  Type/Start: {first_lines}')
        print(f'  Node labels ({len(labels)}): {labels[:15]}')
        
        # Show full code (truncated)
        if len(clean) > 800:
            print(f'  Code (first 800 chars):')
            print(f'  {clean[:800]}...')
        else:
            print(f'  Code:')
            print(f'  {clean}')
