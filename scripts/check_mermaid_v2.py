#!/usr/bin/env python3
"""
Deep Mermaid diagram verification for articles 0-91.
Properly handles all Mermaid diagram types: flowchart, sequenceDiagram, erDiagram, 
stateDiagram, classDiagram, pie, gantt, mindmap, etc.
"""
import json
import os
import re
import html as html_mod
import sys

ARTICLES_DIR = r"C:\Users\user\Documents\pribadi\web adsence\articles"

with open(r"C:\Users\user\Documents\pribadi\web adsence\scripts\mermaid_audit.json", 'r', encoding='utf-8') as f:
    all_articles = json.load(f)

batch = all_articles[:92]

def read_html(slug):
    filepath = os.path.join(ARTICLES_DIR, f"{slug}.html")
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def extract_mermaid_blocks(content):
    pattern = r'<pre\s+class="mermaid">\s*(.*?)\s*</pre>'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
    return [html_mod.unescape(m).strip() for m in matches]

def extract_headings(content):
    pattern = r'<h[23][^>]*>(.*?)</h[23]>'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
    cleaned = []
    for m in matches:
        text = re.sub(r'<[^>]+>', '', m).strip()
        text = html_mod.unescape(text)
        cleaned.append(text)
    return cleaned

def extract_title(content):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL | re.IGNORECASE)
    if m:
        return html_mod.unescape(re.sub(r'<[^>]+>', '', m.group(1)).strip())
    m = re.search(r'<title>(.*?)</title>', content, re.DOTALL | re.IGNORECASE)
    if m:
        return html_mod.unescape(re.sub(r'<[^>]+>', '', m.group(1)).strip())
    return ""

def get_diagram_type(diagram):
    first = diagram.split('\n')[0].strip()
    for dt in ['flowchart TD', 'flowchart TB', 'flowchart LR', 'flowchart RL',
                'graph TD', 'graph TB', 'graph LR', 'graph RL',
                'sequenceDiagram', 'erDiagram', 'classDiagram', 'stateDiagram-v2',
                'stateDiagram', 'pie', 'gantt', 'mindmap', 'gitgraph', 'block-beta',
                'journey', 'quadrantChart', 'xychart-beta', 'sankey-beta', 'radar']:
        if first.startswith(dt):
            return dt.split()[0]
    return first.split()[0] if first else "unknown"

def extract_all_labels(diagram, dtype):
    """Extract all meaningful text/labels from any diagram type."""
    labels = []
    
    if dtype in ('flowchart', 'graph'):
        # Node labels: A["text"], A["text"]
        labels += re.findall(r'(?:\w+)\["([^"]+)"\]', diagram)
        # Short labels: A[text] (but not A["..."])
        for m in re.finditer(r'(?:\w+)\[([^\]\"]+)\]', diagram):
            t = m.group(1).strip()
            if t and len(t) > 1 and not t.startswith('"'):
                labels.append(t)
        # Subgraph labels
        labels += re.findall(r'subgraph\s+\w+\["([^"]+)"\]', diagram)
        # Parenthetical labels: A("text")
        labels += re.findall(r'(?:\w+)\("([^"]+)"\)', diagram)
        # Edge labels: -->|"text"| or -->|"text"-->
        labels += re.findall(r'\|"([^"]+)"\|', diagram)
        # Hexagon: A{{"text"}}
        labels += re.findall(r'\{\{"([^"]+)"\}\}', diagram)
        # Diamond: A{"text"}
        labels += re.findall(r'\{"([^"]+)"\}', diagram)
        
    elif dtype == 'sequenceDiagram':
        # participants
        for m in re.finditer(r'participant\s+(\w+)(?:\s+as\s+(.+?))?$', diagram, re.MULTILINE):
            label = m.group(2) if m.group(2) else m.group(1)
            labels.append(label.strip())
        # Messages: A->>B: text or A-->>B: text etc.
        labels += re.findall(r'(?:->>|-->>|->|-x)\s*\S+\s*:\s*(.+?)$', diagram, re.MULTILINE)
        # Notes
        labels += re.findall(r'Note\s+(?:over\s+\w+(?:,\s*\w+)?|right of\s+\w+|left of\s+\w+)\s*:\s*(.+?)$', diagram, re.MULTILINE)
        
    elif dtype == 'erDiagram':
        # Entity names
        labels += re.findall(r'^\s*(\w+)\s*\{', diagram, re.MULTILINE)
        # Attributes
        labels += re.findall(r'^\s+\w+\s+(\w+)\s+', diagram, re.MULTILINE)
        
    elif dtype in ('stateDiagram', 'stateDiagram-v2'):
        # State definitions: s1 : "text"
        labels += re.findall(r'state\s+"([^"]+)"', diagram)
        # state labels after :
        labels += re.findall(r'^\s*\w+\s*:\s*(.+?)$', diagram, re.MULTILINE)
        
    elif dtype == 'classDiagram':
        labels += re.findall(r'class\s+(\w+)', diagram)
        labels += re.findall(r'(?:\w+)\s*:\s*(.+?)$', diagram, re.MULTILINE)
        
    elif dtype == 'pie':
        labels += re.findall(r'"([^"]+)"\s*:\s*\d+', diagram)
        
    elif dtype == 'mindmap':
        # root, branch labels
        labels += re.findall(r'root\(\((.+?)\)\)', diagram)
        labels += re.findall(r'(?:\w+)\((.+?)\)', diagram)
        
    elif dtype == 'journey':
        labels += re.findall(r'section\s+(.+?)$', diagram, re.MULTILINE)
        labels += re.findall(r'"([^"]+)"\s*:\s*\d+', diagram)
        
    elif dtype == 'block-beta':
        labels += re.findall(r'(?:columns\s+\d+)?', diagram)
        labels += re.findall(r'(\w+)\["([^"]+)"\]', diagram)
        labels += re.findall(r'(\w+)\s*\n', diagram)
    
    # Universal: grab any quoted strings that look like meaningful labels
    all_quoted = re.findall(r'"([^"]{3,})"', diagram)
    for q in all_quoted:
        if q not in labels:
            labels.append(q)
    
    # Clean and deduplicate
    cleaned = []
    seen = set()
    for l in labels:
        l = l.strip().strip('"').strip("'")
        if l and len(l) > 1 and l not in seen:
            seen.add(l)
            cleaned.append(l)
    
    return cleaned

def check_topic_relevance(diagram_text, labels, dtype, title, headings, slug, cat):
    """Deep check if diagram matches article content."""
    issues = []
    dt_lower = diagram_text.lower()
    title_lower = title.lower()
    label_text = ' '.join(labels).lower()
    
    # === TOPIC-SPECIFIC CHECKS ===
    
    # 1. Angular articles should have Angular content
    if 'angular' in slug:
        angular_kw = ['component', 'module', 'service', 'inject', 'template', 'route',
                       'angular', 'ng ', 'typescript', 'appmodule', 'dependency', 'decorator',
                       'directive', 'pipe', 'observable', 'cli', 'ngmodule', '@angular']
        found = any(k in dt_lower for k in angular_kw)
        if not found:
            issues.append(f"Angular article but no Angular keywords in diagram. Labels: {labels[:5]}")
    
    # 2. Ansible should have automation/ansible content
    if 'ansible' in slug:
        ansible_kw = ['ansible', 'playbook', 'inventory', 'ssh', 'module', 'host', 'task',
                       'server', 'config', 'yaml', 'role', 'galaxy', 'automation']
        found = any(k in dt_lower for k in ansible_kw)
        if not found:
            issues.append(f"Ansible article but no Ansible keywords in diagram")
    
    # 3. AI Agent articles
    if 'ai-agent' in slug:
        ai_kw = ['agent', 'llm', 'tool', 'memory', 'plan', 'think', 'act', 'observe',
                  'chatbot', 'gpt', 'claude', 'react', 'prompt', 'model']
        found = any(k in dt_lower for k in ai_kw)
        if not found:
            issues.append(f"AI Agent article but no AI/Agent keywords in diagram")
    
    # 4. App Store publishing
    if 'app-store' in slug:
        store_kw = ['store', 'play store', 'app store', 'review', 'submit', 'publish',
                     'certificate', 'provisioning', 'ios', 'android', 'google', 'apple',
                     'testflight', 'build', 'release', 'developer']
        found = any(k in dt_lower for k in store_kw)
        if not found:
            issues.append(f"App Store article but no store-related keywords")
    
    # 5. Arduino
    if 'arduino' in slug:
        ard_kw = ['arduino', 'ide', 'sketch', 'board', 'serial', 'compile', 'upload',
                   'sensor', 'gpio', 'pin', 'monitor', 'library', 'uno', 'mega']
        found = any(k in dt_lower for k in ard_kw)
        if not found:
            issues.append(f"Arduino article but no Arduino keywords")
    
    # 6. AWS
    if 'aws' in slug:
        aws_kw = ['aws', 'ec2', 's3', 'lambda', 'rds', 'vpc', 'iam', 'cloud', 'region',
                   'instance', 'bucket', 'serverless', 'console', 'elastic', 'route53']
        found = any(k in dt_lower for k in aws_kw)
        if not found:
            issues.append(f"AWS article but no AWS keywords")
    
    # 7. Check for diagrams that are too short/empty
    if len(diagram_text.strip()) < 30:
        issues.append(f"Diagram is suspiciously short ({len(diagram_text.strip())} chars)")
    
    # 8. Check for diagrams that seem like code snippets, not diagrams
    if dtype in ('flowchart', 'graph') and len(labels) < 2:
        if 'subgraph' not in dt_lower:
            issues.append(f"Flowchart with fewer than 2 meaningful labels (found {len(labels)})")
    
    # 9. Check if diagram uses wrong type for content
    # Database content should use erDiagram, not flowchart
    db_keywords = ['table', 'schema', 'primary key', 'foreign key', 'column', 'entity', 'relasi']
    if any(k in dt_lower for k in db_keywords) and dtype in ('flowchart', 'graph'):
        if cat in ('Database',) or 'database' in slug:
            issues.append(f"Database topic using flowchart instead of erDiagram")
    
    # 10. Check for generic numbered node patterns (N0->N1->N2 without meaningful labels)
    n_nodes = re.findall(r'N\d+\["([^"]+)"\]', diagram_text)
    if len(n_nodes) > 3:
        # Check if labels contain actual content vs generic
        short_labels = sum(1 for n in n_nodes if len(n) < 5)
        if short_labels > len(n_nodes) * 0.5:
            issues.append(f"Diagram has many very short node labels: {n_nodes[:5]}")
    
    # 11. Check for diagrams that seem to be about a completely different topic
    # Cross-reference key title terms with diagram content
    title_words = set(re.findall(r'[a-zA-Z]{5,}', title_lower))
    stop_words = {'panduan', 'lengkap', 'dengan', 'untuk', 'dari', 'dalam', 'cara',
                  'yang', 'adalah', 'bisa', 'menggunakan', 'tutorial', 'framework',
                  'pemula', 'membangun', 'dasar', 'teknologi', 'programming', 'komputer',
                  'mengapa', 'berbagai', 'beberapa'}
    title_words -= stop_words
    
    if title_words:
        match_count = sum(1 for w in title_words if w in dt_lower or w in label_text)
        if len(title_words) > 2 and match_count == 0:
            # Check more carefully - some terms might have synonyms
            synonym_map = {
                'dns': ['domain', 'nameserver', 'resolver', 'lookup'],
                'cnn': ['convolution', 'neural', 'layer', 'pool', 'filter'],
                'rnn': ['recurrent', 'sequence', 'lstm', 'gru', 'hidden'],
                'graphql': ['query', 'mutation', 'schema', 'type', 'resolver'],
                'gcp': ['google cloud', 'cloud run', 'cloud function'],
            }
            synonyms_found = False
            for key, syns in synonym_map.items():
                if key in title_lower:
                    if any(s in dt_lower for s in syns):
                        synonyms_found = True
                        break
            
            if not synonyms_found:
                potential_issue = f"Title keywords {title_words} not found in diagram"
                # Only flag if really no overlap
                any_overlap = any(w in dt_lower for w in title_words)
                if not any_overlap:
                    issues.append(potential_issue)
    
    return issues

def check_linear_chain_quality(diagram, dtype):
    """Check if a flowchart is just a generic linear chain."""
    if dtype not in ('flowchart', 'graph'):
        return []
    
    issues = []
    edges = re.findall(r'(\w+)\s*-->\s*(\w+)', diagram)
    if len(edges) < 4:
        return issues
    
    # Build adjacency
    from collections import defaultdict, Counter
    in_degree = Counter()
    out_degree = Counter()
    for src, dst in edges:
        out_degree[src] += 1
        in_degree[dst] += 1
    
    # Count nodes with exactly 1 in and 1 out (chain nodes)
    chain_nodes = sum(1 for n in set(list(in_degree.keys()) + list(out_degree.keys()))
                      if in_degree[n] == 1 and out_degree[n] == 1)
    total_nodes = len(set(list(in_degree.keys()) + list(out_degree.keys())))
    
    if total_nodes > 4 and chain_nodes / total_nodes > 0.7:
        # This is a long linear chain - check if it's meaningful
        labels = re.findall(r'\["([^"]+)"\]', diagram)
        if labels:
            avg_label_len = sum(len(l) for l in labels) / len(labels)
            if avg_label_len < 10:
                issues.append(f"Diagram is mostly a linear chain with short labels (avg {avg_label_len:.0f} chars)")
    
    return issues

def check_edge_logic(diagram, dtype):
    """Check for obviously wrong relationships."""
    issues = []
    
    if dtype in ('flowchart', 'graph'):
        # Check for circular single-node loops
        self_edges = re.findall(r'(\w+)\s*-->\s*\1\b', diagram)
        if self_edges:
            issues.append(f"Self-referencing edges found: {self_edges}")
        
        # Check for suspicious patterns: everything connected linearly when it shouldn't be
        edges = re.findall(r'(\w+)\s*-->\s*(\w+)', diagram)
        if len(edges) > 6:
            # Check if it's a hub-and-spoke (one node connects to many) vs chain
            from collections import Counter
            sources = Counter(e[0] for e in edges)
            # If one source has > 50% of edges, it's a hub
            
    return issues

# ==================== MAIN ANALYSIS ====================

print("=" * 90)
print("COMPREHENSIVE MERMAID DIAGRAM VERIFICATION — BATCH 1 (Articles 0–91)")
print("=" * 90)

all_mismatches = []
summary = {
    'checked': 0,
    'total_diagrams': 0,
    'issues_found': 0,
    'by_type': {},
    'missing_html': [],
}

for idx, article in enumerate(batch):
    slug = article['slug']
    title = html_mod.unescape(article['title'])
    cat = article.get('cat', '')
    expected_count = article['diagram_count']
    
    content = read_html(slug)
    if content is None:
        summary['missing_html'].append(slug)
        continue
    
    summary['checked'] += 1
    actual_diagrams = extract_mermaid_blocks(content)
    headings = extract_headings(content)
    html_title = extract_title(content)
    
    article_issues = []
    
    for d_idx, diagram in enumerate(actual_diagrams):
        summary['total_diagrams'] += 1
        dtype = get_diagram_type(diagram)
        labels = extract_all_labels(diagram, dtype)
        
        # Track diagram types
        summary['by_type'][dtype] = summary['by_type'].get(dtype, 0) + 1
        
        issues = []
        
        # 1. Topic relevance
        topic_issues = check_topic_relevance(diagram, labels, dtype, title, headings, slug, cat)
        issues.extend(topic_issues)
        
        # 2. Linear chain quality
        chain_issues = check_linear_chain_quality(diagram, dtype)
        issues.extend(chain_issues)
        
        # 3. Edge logic
        edge_issues = check_edge_logic(diagram, dtype)
        issues.extend(edge_issues)
        
        # 4. Empty/no-content diagrams
        if len(labels) == 0 and dtype not in ('pie', 'gantt', 'gitgraph'):
            # Might be using different label format - check raw content
            has_meaningful_text = len(re.findall(r'[a-zA-Z]{3,}', diagram)) > 3
            if not has_meaningful_text:
                issues.append(f"Diagram appears to have no meaningful content")
        
        if issues:
            article_issues.append({
                'slug': slug,
                'title': title,
                'cat': cat,
                'diagram_index': d_idx + 1,
                'diagram_type': dtype,
                'first_line': diagram.split('\n')[0].strip()[:100],
                'labels_sample': labels[:8],
                'label_count': len(labels),
                'issues': issues,
            })
    
    if article_issues:
        all_mismatches.extend(article_issues)
        summary['issues_found'] += len(article_issues)

# ==================== REPORT ====================

print(f"\n📊 SUMMARY")
print(f"   Articles checked: {summary['checked']}")
print(f"   Total diagrams:   {summary['total_diagrams']}")
print(f"   Issues found:     {summary['issues_found']}")
print(f"   Missing HTML:     {summary['missing_html']}")
print(f"\n📈 DIAGRAM TYPES:")
for dt, count in sorted(summary['by_type'].items(), key=lambda x: -x[1]):
    print(f"   {dt}: {count}")

print(f"\n{'='*90}")
print(f"🔴 MISMATCHES ({len(all_mismatches)} total)")
print(f"{'='*90}")

for m in all_mismatches:
    print(f"\n{'─'*70}")
    print(f"  📄 {m['slug']}")
    print(f"  📌 Title: {m['title']}")
    print(f"  📂 Category: {m['cat']}")
    print(f"  🔢 Diagram #{m['diagram_index']} ({m['diagram_type']})")
    print(f"  📝 First line: {m['first_line']}")
    print(f"  🏷️  Labels ({m['label_count']}): {m['labels_sample']}")
    for issue in m['issues']:
        print(f"  ⚠️  {issue}")

print(f"\n{'='*90}")
print("DONE")
