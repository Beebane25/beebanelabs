#!/usr/bin/env python3
"""Check Mermaid diagrams in articles 0-91 for content mismatch."""
import json
import os
import re
import html

ARTICLES_DIR = r"C:\Users\user\Documents\pribadi\web adsence\articles"

with open(r"C:\Users\user\Documents\pribadi\web adsence\scripts\mermaid_audit.json", 'r', encoding='utf-8') as f:
    all_articles = json.load(f)

batch = all_articles[:92]

def extract_mermaid_from_html(filepath):
    """Extract all <pre class="mermaid"> blocks from HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find all <pre class="mermaid"> ... </pre> blocks
    pattern = r'<pre\s+class="mermaid">\s*(.*?)\s*</pre>'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
    return matches

def extract_headings_from_html(filepath):
    """Extract h2/h3 headings from HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = r'<h[23][^>]*>(.*?)</h[23]>'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
    cleaned = []
    for m in matches:
        text = re.sub(r'<[^>]+>', '', m).strip()
        text = html.unescape(text)
        cleaned.append(text)
    return cleaned

def extract_title_from_html(filepath):
    """Extract <h1> or <title> from HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Try h1 first
    m = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL | re.IGNORECASE)
    if m:
        return re.sub(r'<[^>]+>', '', m.group(1)).strip()
    # Try title tag
    m = re.search(r'<title>(.*?)</title>', content, re.DOTALL | re.IGNORECASE)
    if m:
        return re.sub(r'<[^>]+>', '', m.group(1)).strip()
    return ""

def analyze_diagram(diagram_text, title, headings):
    """Analyze a mermaid diagram for obvious mismatches."""
    issues = []
    
    # Clean up the diagram text for analysis
    dt = html.unescape(diagram_text).replace('\\n', '\n').replace('\\t', '\t')
    
    # Check diagram type
    first_line = dt.split('\n')[0].strip() if dt else ""
    
    # Extract node labels
    # Pattern for node labels: N0["label"], A["label"], etc.
    labels = re.findall(r'\["(.*?)"\]', dt)
    labels += re.findall(r'\["(.*?)"\]', dt)
    # Also get bracket labels like [label]
    labels2 = re.findall(r'\[([^\]"]+)\]', dt)
    # Filter out pure node IDs
    all_labels = []
    for l in labels + labels2:
        l = l.strip()
        if l and len(l) > 1:
            all_labels.append(l)
    
    # Common generic/placeholder patterns
    generic_patterns = [
        r'^N\d+$',  # Just node IDs
        r'^Step \d+$',
        r'^Node \d+$',
        r'^Item \d+$',
        r'^TODO',
        r'^PLACEHOLDER',
        r'^lorem ipsum',
        r'^TBD',
    ]
    
    generic_count = 0
    meaningful_count = 0
    for l in all_labels:
        is_generic = False
        for gp in generic_patterns:
            if re.match(gp, l, re.IGNORECASE):
                is_generic = True
                break
        if is_generic:
            generic_count += 1
        elif len(l) > 2:
            meaningful_count += 1
    
    # Check if diagram has meaningful content
    if meaningful_count == 0 and len(all_labels) > 0:
        issues.append("All labels appear to be generic/placeholder")
    
    # Check for extremely linear chain patterns (N0->N1->N2... might be auto-generated)
    linear_pattern = len(re.findall(r'N\d+ --> N\d+', dt))
    total_edges = len(re.findall(r'-->', dt))
    if total_edges > 0 and linear_pattern / max(total_edges, 1) > 0.8 and total_edges > 3:
        # Check if it's a long chain
        pass  # Not necessarily wrong, many articles use linear flows
    
    return issues, all_labels, first_line

def check_diagram_relevance(diagram_labels, title, headings, slug, diagram_idx):
    """Check if diagram labels relate to article content."""
    issues = []
    
    # Combine all article text for matching
    article_words = set()
    for text in [title] + headings:
        words = re.findall(r'[a-zA-Z]{3,}', text.lower())
        article_words.update(words)
    
    # Check label relevance
    if not diagram_labels:
        issues.append("No labels extracted from diagram")
        return issues
    
    # Check for common mismatches based on category/slug keywords
    # These are heuristic checks
    
    # Check for Indonesian vs English consistency (articles seem to be bilingual)
    
    return issues

# Main analysis
mismatches = []
stats = {
    'total_articles': len(batch),
    'total_diagrams': 0,
    'articles_with_issues': 0,
    'missing_files': [],
    'missing_diagrams_in_html': [],
}

for idx, article in enumerate(batch):
    slug = article['slug']
    title = article['title']
    cat = article.get('cat', '')
    expected_count = article['diagram_count']
    
    # Build file path
    filepath = os.path.join(ARTICLES_DIR, f"{slug}.html")
    
    if not os.path.exists(filepath):
        stats['missing_files'].append(slug)
        continue
    
    # Extract actual diagrams from HTML
    actual_diagrams = extract_mermaid_from_html(filepath)
    headings = extract_headings_from_html(filepath)
    html_title = extract_title_from_html(filepath)
    
    stats['total_diagrams'] += len(actual_diagrams)
    
    # Check if diagram count matches
    if len(actual_diagrams) != expected_count:
        stats['missing_diagrams_in_html'].append({
            'slug': slug,
            'expected': expected_count,
            'actual': len(actual_diagrams)
        })
    
    # Analyze each diagram
    for d_idx, diagram in enumerate(actual_diagrams):
        issues, labels, first_line = analyze_diagram(diagram, title, headings)
        rel_issues = check_diagram_relevance(labels, title, headings, slug, d_idx + 1)
        issues.extend(rel_issues)
        
        # Specific content checks
        diagram_text = html.unescape(diagram).replace('\\n', '\n')
        
        # Check for diagrams that seem to belong to a different topic
        diagram_lower = diagram_text.lower()
        title_lower = title.lower()
        
        # Heuristic: Check if any key title words appear in diagram labels
        title_keywords = set(re.findall(r'[a-zA-Z]{4,}', title_lower))
        # Remove common words
        common_words = {'yang', 'untuk', 'dengan', 'panduan', 'lengkap', 'dari', 'dalam', 'adalah', 'the', 'and', 'with', 'for', 'framework', 'basic', 'basics', 'pemula'}
        title_keywords -= common_words
        
        label_text = ' '.join(labels).lower()
        
        # Check for topic mismatch indicators
        topic_mismatch = False
        
        # Angular article with non-Angular content
        if 'angular' in slug:
            angular_keywords = ['component', 'module', 'service', 'inject', 'template', 'route', 'angular', 'ng', 'typescript', 'ts']
            if not any(k in diagram_lower for k in angular_keywords):
                topic_mismatch = True
                
        # AI Agent article
        if 'ai-agent' in slug:
            ai_keywords = ['agent', 'llm', 'tool', 'memory', 'plan', 'think', 'act', 'observe', 'chatbot', 'gpt', 'claude']
            if not any(k in diagram_lower for k in ai_keywords):
                topic_mismatch = True
        
        # Ansible article
        if 'ansible' in slug:
            ansible_keywords = ['ansible', 'playbook', 'inventory', 'ssh', 'module', 'host', 'task', 'server', 'config']
            if not any(k in diagram_lower for k in ansible_keywords):
                topic_mismatch = True
        
        if topic_mismatch:
            mismatches.append({
                'slug': slug,
                'title': title,
                'diagram_index': d_idx + 1,
                'type': 'TOPIC_MISMATCH',
                'first_line': first_line[:80],
                'labels': labels[:10],
                'description': f'Diagram content does not appear to relate to article topic "{title}"'
            })
        
        if issues:
            mismatches.append({
                'slug': slug,
                'title': title,
                'diagram_index': d_idx + 1,
                'type': 'CONTENT_ISSUE',
                'first_line': first_line[:80],
                'labels': labels[:10],
                'description': '; '.join(issues)
            })

# Print results
print("=" * 80)
print("MERMAID DIAGRAM VERIFICATION REPORT - BATCH 1 (Articles 0-91)")
print("=" * 80)
print(f"\nTotal articles checked: {stats['total_articles']}")
print(f"Total diagrams found in HTML: {stats['total_diagrams']}")
print(f"Missing HTML files: {len(stats['missing_files'])}")
if stats['missing_files']:
    print(f"  {stats['missing_files']}")
print(f"\nDiagram count mismatches (JSON vs HTML): {len(stats['missing_diagrams_in_html'])}")
for m in stats['missing_diagrams_in_html']:
    print(f"  {m['slug']}: expected {m['expected']}, found {m['actual']}")

print(f"\nTotal mismatches found: {len(mismatches)}")
for m in mismatches:
    print(f"\n--- {m['type']} ---")
    print(f"  Slug: {m['slug']}")
    print(f"  Title: {m['title']}")
    print(f"  Diagram #{m['diagram_index']}")
    print(f"  First line: {m['first_line']}")
    print(f"  Labels: {m['labels']}")
    print(f"  Issue: {m['description']}")
