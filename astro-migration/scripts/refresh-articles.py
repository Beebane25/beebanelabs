"""Repair article HTML without rewriting tutorial content; idempotent."""
from pathlib import Path
import re
import html
import json
import unicodedata
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
stats = Counter()
rows = []
for path in sorted((ROOT / 'src/fragments/articles').glob('*.html')):
    original = path.read_text(encoding='utf-8')
    text = original
    fixes = Counter()
    # A previous regex replacement wrote byte 0x02 instead of group 2.
    fixes['ad_open_repaired'] = text.count('\x02 ad-slot')
    text = text.replace('\x02 ad-slot', '<div class="ad-slot ad-slot')
    fixes['ad_close_repaired'] = text.count('\x02')
    text = text.replace('\x02', '</div>')
    text = text.replace('class="container>', 'class="container">')
    # Tutorial examples must be text, never live DOM (headings/inputs/scripts).
    def repair_pre(m):
        attrs, inner = m.group(1), m.group(2)
        if 'mermaid' in attrs:
            return m.group(0)
        opening = re.match(r'\s*<code\b([^>]*)>', inner)
        code_attrs = opening.group(1) if opening else ''
        if opening:
            inner = inner[opening.end():]
            inner = re.sub(r'</code>\s*$', '', inner)
        escaped = html.escape(html.unescape(inner), quote=False)
        new = '<pre' + attrs + '><code' + code_attrs + '>' + escaped + '</code></pre>'
        if new != m.group(0):
            fixes['code_blocks_normalized'] += 1
        return new
    text = re.sub(r'<pre([^>]*)>(.*?)</pre>', repair_pre, text, flags=re.S|re.I)
    # Layout owns the sole main landmark and main-content ID.
    text = text.replace('id="main-content"', 'id="article-body"')
    text = text.replace('<main class="article-container">', '<div class="article-container">')
    if '<div class="article-container">' in text:
        text = text.replace('</main>', '</div>')
    text = re.sub(r'^\s*</header>\s*', '', text) if text.lstrip().startswith('</header>') else text
    text = text.replace('<article>', '<article class="article-content">')
    # Each SVG needs its own namespace for markers, edges and aria references.
    index = [0]
    def namespace_svg(m):
        index[0] += 1
        svg = m.group(0)
        prefix = f'{path.stem}-d{index[0]}-'
        ids = re.findall(r'\bid="([^"]+)"', svg)
        mapping = {old: old if old.startswith(path.stem + '-d') else prefix + old for old in ids}
        for old, new in sorted(mapping.items(), key=lambda x: -len(x[0])):
            if old == new:
                continue
            svg = svg.replace('id="' + old + '"', 'id="' + new + '"')
            svg = re.sub(r'#' + re.escape(old) + r'(?![\w-])', lambda _: '#' + new, svg)
            svg = re.sub(r'(aria-(?:labelledby|describedby)="[^"]*)\b' + re.escape(old) + r'\b', lambda x: x.group(1) + new, svg)
        # Headings embedded in diagram labels must not compete with the article H1.
        svg = re.sub(r'<h1\b([^>]*)>', r'<div class="svg-heading"\1>', svg, flags=re.I)
        svg = re.sub(r'</h1>', '</div>', svg, flags=re.I)
        if svg != m.group(0): fixes['svg_namespaced'] += 1
        return svg
    text = re.sub(r'<svg\b.*?</svg>', namespace_svg, text, flags=re.S|re.I)
    # Meaningful banner alt text, not a slug converted to title case.
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', text, re.S)
    if h1:
        title = html.unescape(re.sub(r'<[^>]+>', '', h1.group(1))).strip()
        text = re.sub(r'(alt=")Artikel: [^"]*(")', lambda m: m.group(1) + html.escape('Ilustrasi tutorial: ' + title, quote=True) + m.group(2), text)
    def improve_button(m):
        tag = m.group(0)
        if 'type=' not in tag: tag = tag[:-1] + ' type="button">'
        return tag
    text = re.sub(r'<button\b[^>]*>', improve_button, text, flags=re.I)
    text = re.sub(r'(<a\b[^>]*target="_blank")(?![^>]*\brel=)', r'\1 rel="noopener noreferrer"', text)
    # A fragment is inserted inside Layout's <main>; nested main landmarks are invalid.
    text = re.sub(r'<main\b([^>]*)>', r'<div\1>', text, flags=re.I)
    text = re.sub(r'</main>', '</div>', text, flags=re.I)
    text = re.sub(r'<article(?![^>]*\bclass=)([^>]*)>', r'<article class="article-content"\1>', text, flags=re.I)
    # Give every content heading a stable deep-link target and de-duplicate IDs.
    used_ids = set(re.findall(r'\bid=["\']([^"\']+)', text, re.I))
    def slugify(value):
        value = html.unescape(re.sub(r'<[^>]+>', ' ', value))
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower()
        value = re.sub(r'[^a-z0-9]+', '-', value).strip('-')
        return value[:72] or 'bagian'
    seen_heading_ids = set()
    def heading_id(m):
        tag, attrs, body = m.group(1), m.group(2), m.group(3)
        existing = re.search(r'\bid=["\']([^"\']+)["\']', attrs, re.I)
        candidate = existing.group(1) if existing else slugify(body)
        base = candidate; suffix = 2
        while candidate in seen_heading_ids:
            candidate = f'{base}-{suffix}'; suffix += 1
        seen_heading_ids.add(candidate)
        if existing:
            attrs = re.sub(r'\bid=["\'][^"\']+["\']', f'id="{candidate}"', attrs, count=1, flags=re.I)
        else:
            attrs += f' id="{candidate}"'
        return f'<{tag}{attrs}>{body}</{tag}>'
    # Do not parse headings inside SVG markup; SVG labels can contain HTML in foreignObject.
    def heading_outside_svg(m):
        if '<svg' in m.group(0).lower():
            return m.group(0)
        return heading_id(m)
    text = re.sub(r'<(h[2-4])\b([^>]*)>(.*?)</\1>', heading_outside_svg, text, flags=re.S|re.I)
    # Repair stale in-page TOC targets by matching their link labels to headings.
    heading_rows = []
    for hm in re.finditer(r'<h[2-4]\b[^>]*\bid="([^"]+)"[^>]*>(.*?)</h[2-4]>', text, re.S|re.I):
        heading_rows.append((hm.group(1), slugify(hm.group(2))))
    all_ids = set(re.findall(r'\bid=["\']([^"\']+)', text, re.I))
    def repair_anchor(m):
        target, label = m.group(1), m.group(2)
        if target in all_ids or not heading_rows:
            return m.group(0)
        label_slug = slugify(label)
        label_words = set(label_slug.split('-'))
        def similarity(row):
            hid, heading_slug = row
            heading_words = set(heading_slug.split('-'))
            overlap = len(label_words & heading_words) / max(1, len(label_words | heading_words))
            contains = 0.8 if target in heading_slug or heading_slug in target else 0
            return max(overlap, contains)
        replacement, score = max(((row[0], similarity(row)) for row in heading_rows), key=lambda item: item[1])
        if score < 0.3:
            return m.group(0)
        fixes['toc_links_repaired'] += 1
        return m.group(0).replace('#' + target, '#' + replacement, 1)
    text = re.sub(r'<a\b[^>]*href=["\']#([^"\']+)["\'][^>]*>(.*?)</a>', repair_anchor, text, flags=re.S|re.I)
    # Remove closing div tags that try to close wrappers from the old full-page template.
    depth = 0
    chunks = []
    pos = 0
    for m in re.finditer(r'</?div\b[^>]*>', text, re.I):
        chunks.append(text[pos:m.start()])
        if m.group(0).lower().startswith('</div'):
            if depth:
                depth -= 1; chunks.append(m.group(0))
            else:
                fixes['unmatched_div_removed'] += 1
        else:
            depth += 1; chunks.append(m.group(0))
        pos = m.end()
    chunks.append(text[pos:])
    text = ''.join(chunks)
    if depth:
        # The fragment may contain a newsletter/footer wrapper copied from the
        # old standalone page. Do not invent closing tags inside article content;
        # Astro's Layout supplies the outer page wrappers.
        fixes['unclosed_div_removed'] += depth
        depth = 0
    if text != original:
        path.write_text(text, encoding='utf-8', newline='\n')
        fixes['file_updated'] = 1
    stats.update(fixes)
    rows.append({'article': path.stem, 'fixes': dict(fixes)})
report = ROOT / 'reports/article-refresh.json'
report.parent.mkdir(exist_ok=True)
report.write_text(json.dumps({'totals': dict(stats), 'articles': rows}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(dict(stats), indent=2))
print('Per-article report:', report)
