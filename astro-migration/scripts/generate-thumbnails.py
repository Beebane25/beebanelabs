"""Deterministic editorial thumbnails derived from each article's own metadata/content.
Run: python scripts/generate-thumbnails.py [--limit N]
Outputs day/night WebP hero images and compact card variants, plus a manifest.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import re, html, hashlib, json, math, argparse
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/articles'
FONTS = Path('C:/Windows/Fonts')
def font(size, bold=False, mono=False):
    return ImageFont.truetype(str(FONTS / ('consola.ttf' if mono else 'segoeuib.ttf' if bold else 'segoeui.ttf')), size)
def plain(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', s))).strip()
def clean(s):
    return ''.join(c for c in plain(s) if ord(c)<0x2000 or c in '—–→').strip(' ·&')
def metadata():
    rows=[]
    for p in sorted((ROOT/'src/pages/articles').glob('*.astro')):
        s=p.read_text(encoding='utf-8')
        def prop(k):
            m=re.search(k+r'="([^"]*)"',s)
            return html.unescape(m.group(1)) if m else ''
        body=(ROOT/'src/fragments/articles'/f'{p.stem}.html').read_text(encoding='utf-8')
        title=prop('title').replace(' | BeebaneLabs','').replace(' - BeebaneLabs','')
        category=clean(prop('category')) or 'Teknologi'
        headings=[clean(x) for x in re.findall(r'<h2\b[^>]*>(.*?)</h2>',body,re.S)]
        headings=[re.sub(r'^\d+[.\s)]+','',x) for x in headings]
        headings=[x for x in headings if not re.search(r'quiz|kuis|kesimpulan|ringkasan|referensi|pendahuluan|daftar isi',x,re.I)]
        rows.append(dict(slug=p.stem,title=clean(title),category=category,headings=headings))
    return rows

def kind(r):
    s=r['slug']; c=r['category'].lower()
    rules=[
      ('neural',r'^ai-|scikit-learn|recommendation|reinforcement|fine-tun'),
      ('network',r'bgp|mpls|ospf|sdwan|sd-wan'),
      ('shield',r'security|sqlmap|web-security|metasploit|firewall|siem|soc-|social-engineer|ssl-|tls-|oauth|clerk-auth'),
      ('protocol',r'graphql|message-queue|rest-api'),
      ('chip',r'edge-computing'),
      ('browser',r'bun-elysia|deno-fresh|view-transitions|web-performance|turbopack'),
      ('vision',r'computer-vision|cv-|opencv|cnn|object-detection'),
      ('neural',r'(^ml-|^dl-|nlp|llm|langchain|huggingface|openai|chatgpt|deep-learning|machine-learning|pytorch|tensorflow|transformer|rag-)'),
      ('database',r'sql|database|mongo|redis|prisma|drizzle|dynamo|cassandra|neo4j|cockroach|influx|supabase|firestore|elastic|pinecone'),
      ('shield',r'security|hacking|pentest|penetration|owasp|burp|nmap|sqlmap|malware|forensic|cryptograph|zero-trust|threat|incident|bug-bounty|red-team|iso-27001|auth-|web-auth|web-csrf|web-ssrf'),
      ('protocol',r'mqtt|coap|http2|websocket|grpc|zigbee|protocol|lora'),
      ('network',r'mikrotik|network|routing|subnet|tcp-ip|dns-|vpn|wireshark|wifi-'),
      ('chip',r'esp32|esp8266|arduino|sensor|raspberry|stm32|pcb-|iot|home-assistant|blynk'),
      ('phone',r'android|kotlin|flutter|swift|ios-|mobile|react-native|jetpack|capacitor|maui|app-store|deep-link'),
      ('cloud',r'docker|kubernetes|k8s|cloud|aws|azure|gcp|terraform|ansible|nginx|vps|linux-server|deploy|serverless'),
      ('pipeline',r'cicd|ci-cd|jenkins|gitlab|github-actions|gitops|testing|pytest|jest|cypress|playwright|eslint'),
      ('chart',r'data-science|pandas|numpy|matplotlib|visualization|grafana|dashboard|prometheus|monitoring|observability|opentelemetry'),
      ('career',r'career|interview|job-|gaji|negosiasi|sertifikasi|cert-|portfolio|freelance|soft-skill|roadmap|prodev|open-source'),
      ('browser',r'html|css|react|vue|angular|svelte|nextjs|nuxt|astro|remix|solid-js|htmx|tailwind|sass|web-component|responsive|pwa|vite|postcss'),
    ]
    for k,pattern in rules:
        if re.search(pattern,s):return k
    if 'data' in c:return 'database'
    if 'career' in c or 'certification' in c:return 'career'
    if 'cloud' in c:return 'cloud'
    if 'ai' in c:return 'neural'
    return 'code'
COLORS={'vision':'E39354','neural':'A896E8','database':'64B8DC','shield':'E5908A','protocol':'5FC9BD','network':'74B8EF','chip':'6BC399','phone':'B0A0EC','cloud':'80BCEC','pipeline':'D0B25F','chart':'58C7AB','career':'E3B368','browser':'70C9C4','code':'94B975'}
LABELS={'vision':'COMPUTER VISION','neural':'MODEL / INTELLIGENCE','database':'DATA / STORAGE','shield':'SECURITY / DEFENSE','protocol':'MESSAGE / TRANSPORT','network':'NETWORK / TOPOLOGY','chip':'HARDWARE / EMBEDDED','phone':'MOBILE / APPLICATION','cloud':'CLOUD / INFRASTRUCTURE','pipeline':'BUILD / TEST / SHIP','chart':'DATA / INSIGHT','career':'LEARN / GROW / BUILD','browser':'WEB / INTERFACE','code':'CODE / ENGINEERING'}
def wrap(text, f, width):
    lines=[];line=''
    for word in text.split():
        test=(line+' '+word).strip()
        if f.getlength(test)>width and line:lines.append(line);line=word
        else:line=test
    if line:lines.append(line)
    return lines

def render(r,day=False):
    W,H=1200,630;k=kind(r);seed=int(hashlib.sha256(r['slug'].encode()).hexdigest()[:8],16)
    accent=tuple(bytes.fromhex(COLORS[k])); bg=(242,246,242) if day else (13,24,30)
    fg=(23,47,48) if day else (237,244,239); muted=(76,102,103) if day else (151,173,178)
    line=(202,219,214) if day else (43,64,73);panel=(231,239,232) if day else (20,37,45)
    yy,xx=np.mgrid[0:H,0:W];glow=np.exp(-((xx-1010)**2+(yy-250)**2)/260000)*(.16 if day else .17)
    a=np.array(bg)[None,None,:]*(1-glow[:,:,None])+np.array(accent)[None,None,:]*glow[:,:,None]
    a+=np.random.default_rng(seed).normal(0,.6,(H,W,1))
    img=Image.fromarray(np.uint8(np.clip(a,0,255)));d=ImageDraw.Draw(img)
    for x in range(754,1160,26):
        for y in range(98,520,26):d.ellipse((x,y,x+1,y+1),fill=line)
    d.rounded_rectangle((52,48,81,77),radius=9,fill=accent)
    d.text((60,50),'B',font=font(18,True),fill=(13,24,30))
    d.text((94,48),'BEEBANELABS',font=font(21,True),fill=fg)
    d.text((52,126),LABELS[k],font=font(16,mono=True),fill=muted)
    # Keep full title, auto-size rather than truncate.
    title=r['title']; size=56
    while True:
        f=font(size,True);lines=wrap(title,f,645)
        if len(lines)<=4 and all(f.getlength(x)<=645 for x in lines):break
        size-=1
        assert size>=22,r['slug']
    y=174
    for text in lines:d.text((49,y),text,font=f,fill=fg);y+=size+8
    d.rounded_rectangle((52,y+14,122,y+19),radius=2,fill=accent)
    # Specific topics from the article's own H2 headings, never unrelated stock text.
    tags=[]
    for heading in r['headings']:
        heading=re.sub(r'^(Apa (itu|Itu)|Pengertian|Mengenal|Pendahuluan)\s+','',heading)
        if 3<len(heading)<65 and heading.lower() not in title.lower():tags.append(heading)
        if len(tags)==2:break
    ty=max(y+42,400)
    for text in tags:
        ff=font(19);tlines=wrap(text,ff,635)
        for textline in tlines[:2]:
            if ty>515:break
            d.text((52,ty),textline,font=ff,fill=muted);ty+=26
    # Technical illustration, separate from editorial typography.
    x0,y0=767,167
    def rr(box,rad=14,fill=panel,outline=line,width=2):d.rounded_rectangle(box,rad,fill=fill,outline=outline,width=width)
    def seg(points,color=accent,width=3):d.line(points,fill=color,width=width,joint='curve')
    def text(pos,t,size=16,color=fg):d.text(pos,t,font=font(size,mono=True),fill=color)
    def node(cx,cy,label='',rad=24):
        d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),fill=panel,outline=accent,width=3)
        if label:text((cx-font(14,mono=True).getlength(label)/2,cy-9),label,14)
    rr((742,133,1150,518),24,fill=None)
    if k=='chip':
        rr((838,223,1054,426),14);rr((871,257,1022,388),10,outline=accent)
        short=r['slug'].split('-')[0].upper();text((889,305),short[:10],22)
        for i in range(7):
            yy=239+i*27;seg([(811,yy),(838,yy)]);seg([(1054,yy),(1081,yy)])
            xx=851+i*31;seg([(xx,195),(xx,223)]);seg([(xx,426),(xx,454)])
        node(795,185,'I/O',18)
    elif k in ('network','protocol'):
        center=(949,318);ends=[(809,219),(1087,219),(809,432),(1087,432)]
        for i,(x,y) in enumerate(ends):
            seg([center,(x,318),(x,y)],line,3);node(x,y,str(i+1),27)
            t=.35+(seed%20)/100;px=int(center[0]+(x-center[0])*t);d.rounded_rectangle((px-7,311,px+7,325),3,fill=accent)
        node(*center,'MQTT' if 'mqtt' in r['slug'] else 'BUS' if k=='protocol' else 'NET',43)
        text((800,474),'PUBLISH > ROUTE > RECEIVE' if k=='protocol' else 'LINK / ROUTE / CONNECT',14,muted)
    elif k=='database':
        for yy in [215,273,331]:
            d.rectangle((837,yy,1055,yy+58),fill=panel)
            d.arc((837,yy+34,1055,yy+80),0,180,fill=accent,width=3)
            seg([(837,yy+20),(837,yy+55)]);seg([(1055,yy+20),(1055,yy+55)])
            d.ellipse((837,yy,1055,yy+45),fill=panel,outline=accent,width=3)
        rr((802,429,1092,474),9);text((822,440),'QUERY  >  INDEX  >  DATA',16)
    elif k=='shield':
        pts=[(950,196),(1068,241),(1048,368),(950,443),(852,368),(832,241)]
        d.polygon(pts,fill=panel);seg(pts+[pts[0]],accent,4)
        d.arc((920,259,980,330),180,360,fill=accent,width=5)
        rr((904,294,997,365),12,outline=accent,width=3);node(950,329,'',7)
        text((849,468),'VERIFY / PROTECT',18,muted)
    elif k=='neural':
        layers=[[(805,245),(805,330),(805,415)],[(946,211),(946,284),(946,357),(946,430)],[(1087,271),(1087,375)]]
        for l,other in zip(layers,layers[1:]):
            for pt in l:
                for end in other:seg([pt,end],line,2)
        for layer in layers:
            for pt in layer:node(*pt,rad=17)
        text((805,474),'INPUT   MODEL   OUTPUT',15,muted)
    elif k=='vision':
        rr((798,202,1097,444),12);d.polygon([(815,420),(910,290),(970,350),(1045,266),(1080,420)],fill=line)
        d.ellipse((839,228,884,273),fill=accent)
        for box in [(889,278,992,395),(1008,248,1085,413)]:
            d.rectangle(box,outline=accent,width=3)
        rr((881,256,977,278),3,fill=accent);text((889,258),'0.98',14,(15,30,33))
        text((817,471),'DETECT / CLASSIFY',17,muted)
    elif k=='phone':
        rr((858,176,1035,478),26,outline=accent,width=3);rr((914,189,980,200),5,fill=accent)
        rr((874,229,1019,310),10,fill=line)
        for xx in [879,952]:
            for yy in [332,391]:rr((xx,yy,xx+60,yy+45),8,outline=accent)
        seg([(917,462),(976,462)],accent,4)
    elif k=='cloud':
        for xx,yy,rad in [(903,254,43),(952,222,61),(1006,253,44)]:d.ellipse((xx-rad,yy-rad,xx+rad,yy+rad),fill=accent)
        rr((856,247,1045,287),18,fill=accent,outline=accent)
        seg([(950,287),(950,333),(810,333),(810,358)],accent)
        seg([(950,333),(1090,333),(1090,358)],accent)
        for xx in [783,921,1058]:
            rr((xx,359,xx+60,447),8)
            for yy in [376,397,418]:seg([(xx+12,yy),(xx+46,yy)],accent,3)
    elif k=='pipeline':
        for i in range(3):
            xx=780+i*128;rr((xx,258,xx+93,349),12,outline=accent)
            text((xx+18,282),['GIT','TEST','SHIP'][i],19)
            if i<2:seg([(xx+94,303),(xx+126,303)]);seg([(xx+115,293),(xx+126,303),(xx+115,313)])
        seg([(819,353),(819,420),(1087,420),(1087,355)],line,3)
        text((830,454),'CONTINUOUS DELIVERY',16,muted)
    elif k=='chart':
        seg([(797,202),(797,436),(1102,436)],line,3)
        for i,height in enumerate([70,120,94,167,206]):
            xx=824+i*51;rr((xx,435-height,xx+28,435),5,fill=accent,outline=accent)
        seg([(818,327),(878,285),(936,299),(997,236),(1090,195)],fg,3)
        text((819,469),'MEASURE / ANALYZE',17,muted)
    elif k=='career':
        for i in range(4):
            xx=801+i*72;yy=397-i*51;rr((xx,yy,xx+61,454),8,fill=panel,outline=accent)
        seg([(811,346),(892,289),(966,230),(1084,186)],accent,4)
        seg([(1059,185),(1084,186),(1077,214)],accent,4)
        text((807,474),'YOUR NEXT CHAPTER',17,muted)
    elif k=='browser':
        rr((787,206,1110,443),15,outline=accent)
        seg([(788,244),(1110,244)],line,2)
        for xx in [807,824,841]:d.ellipse((xx,222,xx+6,228),fill=accent)
        rr((802,261,890,426),8,fill=line);rr((908,261,1094,327),8,outline=accent)
        rr((908,342,993,426),8);rr((1006,342,1094,426),8)
        text((820,470),'DESIGN / BUILD / SHIP',16,muted)
    else:
        rr((781,211,1112,444),16,outline=accent)
        for xx in [802,820,838]:d.ellipse((xx,229,xx+7,236),fill=accent)
        text((810,261),'> '+r['slug'].split('-')[0].upper()[:15],22,accent)
        for i,w in enumerate([167,210,128,191]):
            xx=815+(i%2)*18;rr((xx,311+i*25,xx+w,318+i*25),3,fill=line,outline=line)
        text((811,470),'WRITE / RUN / ITERATE',16,muted)
    d.line((52,557,1148,557),fill=line,width=1)
    category=r['category']; cf=font(17)
    while cf.getlength(category)>820:cf=font(cf.size-1)
    d.text((52,578),category,font=cf,fill=muted)
    d.text((986,578),'TUTORIAL / IT',font=font(15,mono=True),fill=muted)
    return img, k

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--limit',type=int);args=parser.parse_args()
    rows=metadata();OUT.mkdir(parents=True,exist_ok=True);manifest=[]
    for idx,r in enumerate(rows[:args.limit]):
        sizes={}
        for day in [False,True]:
            image,k=render(r,day)
            suffix='-day' if day else ''
            path=OUT/f"{r['slug']}{suffix}.webp"
            image.save(path,'WEBP',quality=85,method=4)
            thumb=OUT/f"{r['slug']}{suffix}-thumb.webp"
            image.resize((600,315),Image.Resampling.LANCZOS).save(thumb,'WEBP',quality=82,method=4)
            sizes[suffix or 'night']=path.stat().st_size
        manifest.append({**r,'design':k,'bytes':sizes})
        if (idx+1)%50==0:print(f'Generated {idx+1}/{len(rows)}',flush=True)
    report=ROOT/'reports/thumbnail-manifest.json';report.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    # Contact sheet from diverse subjects for visual QA.
    selected=[];seen=set()
    for r in manifest:
        if r['design'] not in seen:seen.add(r['design']);selected.append(r)
    sheet=Image.new('RGB',(1200,math.ceil(len(selected)/3)*235),'#dde6e1');d=ImageDraw.Draw(sheet)
    for i,r in enumerate(selected):
        thumb=Image.open(OUT/f"{r['slug']}{'-day' if i%2 else ''}.webp").resize((390,205))
        x=(i%3)*400;y=(i//3)*235;sheet.paste(thumb,(x,y));d.text((x+5,y+207),r['slug'][:45],font=font(13),fill='#1b3632')
    sheet.save(ROOT/'reports/thumbnail-contact-sheet.jpg',quality=90)
    print(f'COMPLETE: {len(manifest)} articles, {len(manifest)*4} images',flush=True)
if __name__=='__main__':main()
