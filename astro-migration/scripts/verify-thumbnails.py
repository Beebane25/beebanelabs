from pathlib import Path
from PIL import Image
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,hashlib,re
ROOT=Path(__file__).resolve().parents[1]
rows=json.loads((ROOT/'reports/thumbnail-manifest.json').read_text(encoding='utf-8'))
assert len(rows)==len(list((ROOT/'src/pages/articles').glob('*.astro')))==463
hashes=set();total=0
for r in rows:
 for suffix,size in [('',(1200,630)),('-day',(1200,630)),('-thumb',(600,315)),('-day-thumb',(600,315))]:
  p=ROOT/'public/images/articles'/f"{r['slug']}{suffix}.webp"
  with Image.open(p) as im:assert im.size==size,p;im.verify()
  total+=p.stat().st_size
  if suffix=='':hashes.add(hashlib.sha256(p.read_bytes()).hexdigest())
assert len(hashes)==463
class Check(HTMLParser):
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='img' and '/images/articles/' in a.get('src',''):
   src=urlsplit(a['src']).path
   assert (ROOT/'public'/src.lstrip('/')).exists(),src
  if tag=='div':assert 'thumbnail-bg' not in a.get('class','').split(),str(page)
count=0
for page in (ROOT/'dist').rglob('*.html'):
 Check().feed(page.read_text(encoding='utf-8'));count+=1
print(f'PASS: {len(rows)} articles / {len(rows)*4} decoded WebP images / {len(hashes)} unique covers / {count} HTML pages')
print(f'Total image size: {total/1024/1024:.1f} MB; average per image: {total/(len(rows)*4)/1024:.1f} KB')
