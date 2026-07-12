#!/usr/bin/env python3
"""
convert-mermaid-to-svg.py
Batch convert all Mermaid diagrams in article fragments to styled SVG.
Uses mermaid.ink API for rendering.
"""

import os
import re
import base64
import urllib.request
import time
import json
import hashlib
import sys

FRAGMENTS_DIR = r"C:\Users\user\Documents\pribadi\web adsence\astro-migration\src\fragments\articles"
CACHE_DIR = r"C:\Users\user\Documents\pribadi\web adsence\astro-migration\.mermaid-cache"
THEME = "dark"

# Custom mermaid config for better look
MERMAID_CONFIG = {
    "theme": "dark",
    "themeVariables": {
        "primaryColor": "#1a2332",
        "primaryTextColor": "#E7E8F5",
        "primaryBorderColor": "#3ecf8e",
        "lineColor": "#3ecf8e",
        "secondaryColor": "#0f1620",
        "tertiaryColor": "#1a1f2e",
        "edgeLabelBackground": "#0f1011",
        "nodeTextColor": "#E7E8F5",
        "clusterBkg": "rgba(62, 207, 142, 0.08)",
        "clusterBorder": "#3ecf8e",
        "titleColor": "#3ecf8e",
        "edgeColor": "#3ecf8e"
    },
    "flowchart": {
        "curve": "basis",
        "padding": 15,
        "htmlLabels": True,
        "useMaxWidth": True
    },
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": 14
}

# SVG wrapper template with glassmorphism styling
SVG_WRAPPER = '''<div class="diagram-box diagram-svg">
  <div class="diagram-label">{label}</div>
  <div class="diagram-content">{svg}</div>
</div>'''

def get_cache_key(mermaid_code: str) -> str:
    return hashlib.md5(mermaid_code.strip().encode()).hexdigest()

def render_mermaid(mermaid_code: str, cache: dict) -> str:
    """Render Mermaid code to SVG via mermaid.ink API with caching."""
    key = get_cache_key(mermaid_code)
    
    if key in cache:
        return cache[key]
    
    # Encode with custom config
    config_json = json.dumps(MERMAID_CONFIG)
    payload = json.dumps({
        "code": mermaid_code.strip(),
        "mermaid": MERMAID_CONFIG
    })
    encoded = base64.urlsafe_b64encode(payload.encode()).decode()
    url = f"https://mermaid.ink/svg/{encoded}"
    
    try:
        # Use JSON POST payload for better handling of large diagrams
        post_data = payload.encode('utf-8')
        
        for attempt in range(3):  # Retry up to 3 times
            try:
                req = urllib.request.Request(
                    'https://mermaid.ink/svg',
                    data=post_data,
                    headers={
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0'
                    },
                    method='POST'
                )
                resp = urllib.request.urlopen(req, timeout=20)
                svg = resp.read().decode()
                break
            except urllib.error.HTTPError as e:
                if e.code == 503 and attempt < 2:
                    time.sleep(3 + attempt * 2)  # Backoff: 3s, 5s
                    continue
                raise
        else:
            return None
    except Exception as e:
        # Fallback to GET with URL-safe encoding for smaller diagrams
        try:
            encoded = base64.urlsafe_b64encode(mermaid_code.strip().encode()).decode()
            url = f"https://mermaid.ink/svg/{encoded}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=20)
            svg = resp.read().decode()
        except Exception as e2:
            print(f"    ERROR rendering: {e2}")
            return None
        
        # Clean up SVG - remove mermaid default styles, add our class
        svg = re.sub(r'<svg id="mermaid-svg"', '<svg class="mermaid-rendered"', svg, count=1)
        
        cache[key] = svg
        return svg
    except Exception as e:
        print(f"    ERROR rendering: {e}")
        return None

def process_file(filepath: str, cache: dict) -> int:
    """Process a single HTML fragment file, replacing Mermaid blocks with SVG."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all mermaid blocks with optional diagram label
    # Pattern: <div class="diagram-box">...<div class="diagram-label">...</div>...<pre class="mermaid">...</pre>...</div>
    # Or just: <pre class="mermaid">...</pre>
    
    # First, try to match diagram-box pattern with label
    pattern_labeled = re.compile(
        r'<div class="diagram-box">\s*'
        r'<div class="diagram-label">(.*?)</div>\s*'
        r'<pre class="mermaid">\s*(.*?)\s*</pre>\s*'
        r'</div>',
        re.DOTALL
    )
    
    # Then match standalone mermaid blocks
    pattern_standalone = re.compile(
        r'<pre class="mermaid">\s*(.*?)\s*</pre>',
        re.DOTALL
    )
    
    count = 0
    replacements = []
    
    # Process labeled diagrams first
    for match in pattern_labeled.finditer(content):
        label = match.group(1).strip()
        mermaid_code = match.group(2).strip()
        
        svg = render_mermaid(mermaid_code, cache)
        if svg:
            replacement = SVG_WRAPPER.format(label=label, svg=svg)
            replacements.append((match.start(), match.end(), replacement))
            count += 1
        
        time.sleep(1.5)  # Rate limit - avoid 503
    
    # Apply labeled replacements in reverse order
    for start, end, replacement in reversed(replacements):
        content = content[:start] + replacement + content[end:]
    
    # Process standalone mermaid blocks
    standalone_replacements = []
    for match in pattern_standalone.finditer(content):
        mermaid_code = match.group(1).strip()
        
        # Skip if already replaced (inside diagram-svg div)
        before = content[:match.start()]
        if 'class="diagram-svg"' in before[-200:]:
            continue
        
        # Try to find a label from preceding text
        label_match = re.search(r'Diagram:\s*([^\n<]+)', content[max(0,match.start()-500):match.start()])
        label = label_match.group(1).strip() if label_match else 'Diagram'
        
        svg = render_mermaid(mermaid_code, cache)
        if svg:
            replacement = SVG_WRAPPER.format(label=label, svg=svg)
            standalone_replacements.append((match.start(), match.end(), replacement))
            count += 1
        
        time.sleep(1.5)  # Rate limit - avoid 503
    
    # Apply standalone replacements in reverse order
    for start, end, replacement in reversed(standalone_replacements):
        content = content[:start] + replacement + content[end:]
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return count

def load_cache() -> dict:
    """Load SVG cache from disk."""
    cache_file = os.path.join(CACHE_DIR, 'svg_cache.json')
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_cache(cache: dict):
    """Save SVG cache to disk."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file = os.path.join(CACHE_DIR, 'svg_cache.json')
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(cache, f)

def main():
    print(f"=== Mermaid → SVG Conversion ===")
    print(f"Fragments dir: {FRAGMENTS_DIR}")
    print(f"Cache dir: {CACHE_DIR}")
    print()
    
    # Load cache
    cache = load_cache()
    print(f"Loaded {len(cache)} cached SVGs")
    
    # Find files with mermaid blocks
    files = []
    for f in sorted(os.listdir(FRAGMENTS_DIR)):
        if f.endswith('.html'):
            filepath = os.path.join(FRAGMENTS_DIR, f)
            with open(filepath, 'r', encoding='utf-8') as fh:
                content = fh.read()
            if '<pre class="mermaid">' in content:
                mermaid_count = content.count('<pre class="mermaid">')
                files.append((f, filepath, mermaid_count))
    
    print(f"Found {len(files)} files with Mermaid diagrams")
    print(f"Total diagrams: {sum(c for _, _, c in files)}")
    print()
    
    # Process files
    total_converted = 0
    total_errors = 0
    start_time = time.time()
    
    for i, (filename, filepath, diagram_count) in enumerate(files):
        print(f"[{i+1}/{len(files)}] {filename} ({diagram_count} diagrams)...", end=' ', flush=True)
        try:
            converted = process_file(filepath, cache)
            print(f"OK ({converted} converted)")
            total_converted += converted
        except Exception as e:
            print(f"ERROR: {e}")
            total_errors += 1
        
        # Save cache periodically
        if (i + 1) % 10 == 0:
            save_cache(cache)
    
    # Final save
    save_cache(cache)
    
    elapsed = time.time() - start_time
    print()
    print(f"=== DONE ===")
    print(f"Converted: {total_converted} diagrams")
    print(f"Errors: {total_errors} files")
    print(f"Cached SVGs: {len(cache)}")
    print(f"Time: {elapsed:.1f}s")

if __name__ == '__main__':
    main()
