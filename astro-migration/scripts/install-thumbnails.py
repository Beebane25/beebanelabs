from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
VERSION='20261007b'
def image(slug):
 return f'<img class="article-card-image" src="/images/articles/{slug}-day-thumb.webp?v={VERSION}" alt="" loading="lazy" decoding="async" width="600" height="315">'
count=0
for p in (ROOT/'src').rglob('*'):
 if p.suffix not in ('.astro','.html'):continue
 s=p.read_text(encoding='utf-8');n=s
 # Each static card retains its title and article destination.
 pattern=r'(<a\b[^>]*href="[^\"]*/articles/([a-z0-9-]+)(?:\.html)?"[^>]*class="article-card[^\"]*"[^>]*>\s*<div class="thumbnail">)\s*<div class="thumbnail-bg[^\"]*">.*?</div>'
 n,hits=re.subn(pattern,lambda m:m[1]+image(m[2]),n,flags=re.S)
 count+=hits
 # Cache-bust all existing hero and social images (not icons or tutorial illustrations).
 n=re.sub(r'(/images/articles/[a-z0-9-]+\.webp)(?!\?)(?=["\s])',rf'\1?v={VERSION}',n)
 if n!=s:p.write_text(n,encoding='utf-8',newline='\n')
p=ROOT/'public/js/app.js';s=p.read_text(encoding='utf-8')
old="<div class=\"thumbnail\"><div class=\"thumbnail-bg cyan\">' + a.icon + '</div>' + '</div>"
new="<div class=\"thumbnail\"><img class=\"article-card-image\" src=\"/images/articles/' + a.slug + '-day-thumb.webp?v="+VERSION+"\" alt=\"\" loading=\"lazy\" decoding=\"async\" width=\"600\" height=\"315\"></div>"
assert old in s
s=s.replace(old,new).replace('/* v20.0.0','/* v20.1.0')
p.write_text(s,encoding='utf-8',newline='\n')
p=ROOT/'public/css/style.css';s=p.read_text(encoding='utf-8')+'''
/* Topic-specific editorial covers, full composition at every card size. */
.article-card .thumbnail { aspect-ratio:1200/630; height:auto; min-height:0; padding:0; }
.article-card .thumbnail .article-card-image { display:block; width:100%; height:100%; object-fit:contain; border-radius:0; transition:transform .25s ease; }
.article-card:hover .thumbnail .article-card-image { transform:scale(1.025); }
@media(prefers-reduced-motion:reduce) { .article-card:hover .thumbnail .article-card-image { transform:none; } }
''';p.write_text(s,encoding='utf-8',newline='\n')
for name in ['src/layouts/Layout.astro','public/sw.js']:
 p=ROOT/name;s=p.read_text(encoding='utf-8').replace('style.css?v=28.2','style.css?v=29.0').replace('app.js?v=20.0','app.js?v=20.1').replace('v21.5','v22.0').replace('static-v11','static-v12').replace('pages-v14','pages-v15');p.write_text(s,encoding='utf-8',newline='\n')
print('Static cards updated:',count)
