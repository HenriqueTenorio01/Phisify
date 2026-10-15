#!/usr/bin/env python3
"""Import the two supplied wave handbooks as semantic text and isolated vector math.

Requires PyMuPDF. Never rasterizes or embeds complete pages. Text reflows in the
reader; only mathematical expressions and the eight original diagrams are SVG.
The generated coverage manifest accounts for every instructional source block.
"""
from pathlib import Path
import collections, hashlib, json, re, copy
import xml.etree.ElementTree as ET
import fitz

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'content/olimpiadas/ondas'
ASSETS = ROOT / 'public/ondas'
PUBLIC_PREFIX = 'ondas'
MERGE_INLINE_BLOCKS = False
DEST.mkdir(parents=True, exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)
SOURCES = {'aula': 'Aula_Ondulatoria_TBF_IPhO.pdf', 'ficha': 'Ficha_Ondulatoria_TBF_IPhO.pdf'}
DOCS = {k: fitz.open(ROOT / 'materiais/referencias' / v) for k, v in SOURCES.items()}
FIGURES = {
 ('aula',8): [(89,251,516,358,'Batimentos: oscilação rápida entre os envelopes lento positivo e negativo.')],
 ('aula',12): [(188,61,411,140,'Interface entre cordas: incidência e reflexão no meio Z₁, transmissão no meio Z₂.')],
 ('aula',14): [(193,391,409,500,'Três primeiros modos de uma corda fixa: linhas sólidas e tracejadas representam fases opostas.')],
 ('aula',26): [(201,338,397,449,'Experiência de Young: separação d, distância D e posição y de observação no ponto P.')],
 ('aula',30): [(78,383,523,533,'Difração de duas fendas com d = 3a: intensidade normalizada, envelope e ordens ausentes.')],
 ('ficha',4): [(212,278,384,353,'Questão 7: junção em x = 0 entre cordas de densidades µ₁ e 4µ₁.')],
 ('ficha',7): [(191,170,405,221,'Questão 13: duas massas m ligadas por molas K, 2K e 4K, com paredes fixas.')],
 ('ficha',10): [(220,244,379,306,'Questão 19: duas cordas de impedância Z ligadas a uma massa M e uma mola K₀ na junção.')],
}
MATH_WORDS = {'sin','cos','tan','sinc','exp','log','ln','Re','Im','det','sinh','cosh','tanh','atan','atan2','lim','max','min','RMS','Hz','rad','kg','mm','cm','nm','m','s','N','W','J','OPL'}
SPECIAL = {'Z':'∫','R':'∫','X':'∑','P':'∑','p':'√','q':'√','r':'√','s':'√','e':'˜','b':'ˆ'}
asset_cache={}
coverage=[]

def text(block):
 return ' '.join(''.join(s['text'] for s in l['spans']) for l in block.get('lines',[])).strip()

def accessible(spans):
 parts=[]
 for s in spans:
  t=s['text']
  if 'Extension' in s['font']:
   t=''.join(SPECIAL.get(c,c) for c in t)
  parts.append(t)
 return re.sub(r'[\x00-\x1f\uf8f0-\uf8ff]','', ''.join(parts)).strip()

def mathlike(s):
 t=s['text'].strip()
 if not t:return True
 if 'Math' in s['font'] or s['size']<8.6:return True
 words=re.findall(r'[A-Za-zÀ-ÿ]{2,}',t)
 return not words or all(w in MATH_WORDS for w in words)

def prose(block):
 for l in block['lines']:
  for s in l['spans']:
   if 'Math' in s['font'] or s['size']<9:continue
   if any(w not in MATH_WORDS for w in re.findall(r'[A-Za-zÀ-ÿ]{3,}',s['text'])):return True
 return False

def vector(key,number,rect,figure=False):
 # Remove all outside content before serializing, rather than hiding a full page
 # behind an SVG viewport. This also subsets the glyph paths to this expression.
 rect=fitz.Rect(rect)
 rect=fitz.Rect(max(0,rect.x0-1.1),max(0,rect.y0-1.2),min(595.276,rect.x1+1.1),min(841.89,rect.y1+1.2))
 cachekey=(key,number,tuple(round(v,3) for v in rect))
 if cachekey in asset_cache:return asset_cache[cachekey]
 d=fitz.open();d.insert_pdf(DOCS[key],from_page=number-1,to_page=number-1)
 p=d[0];w,h=p.rect.width,p.rect.height
 # A plot may extend behind the bounding box of a preceding prose block.
 # Remove that prose without touching the plotted curve or its clipping paths.
 if figure:
  for b in p.get_text('blocks'):
   bounds=fitz.Rect(b[:4])
   if rect.intersects(bounds) and not rect.contains(bounds):p.add_redact_annot(bounds,fill=None)
  p.apply_redactions(images=0,graphics=0,text=0)
 for r in [fitz.Rect(0,0,w,rect.y0),fitz.Rect(0,rect.y1,w,h),fitz.Rect(0,rect.y0,rect.x0,rect.y1),fitz.Rect(rect.x1,rect.y0,w,rect.y1)]:
  if not r.is_empty:p.add_redact_annot(r,fill=None)
 p.apply_redactions(images=2,graphics=2,text=0)
 p.set_cropbox(rect)
 svg=p.get_svg_image()
 # Text labels remain available in JSON; the asset contains no scripts, links,
 # foreignObject, embedded PDF or full-page content.
 name=hashlib.sha256(svg.encode()).hexdigest()[:18]+'.svg'
 (ASSETS/name).write_text(svg)
 result={'src':f'/{PUBLIC_PREFIX}/'+name,'width':round(rect.width,2),'height':round(rect.height,2)}
 asset_cache[cachekey]=result;d.close();return result

def inline(key,number,block):
 spans=[s for l in block['lines'] for s in l['spans']]
 # Reassemble the actual prose baselines, keeping accents, indices, radicals and
 # fraction fragments with their nearest baseline before allowing browser reflow.
 base=[]
 def add_base(y):
  if not any(abs(y-b)<2 for b in base):base.append(y)
 for s in spans:
  if s['size']>=9 and not mathlike(s):add_base(s['origin'][1])
 for line in block['lines']:
  if line['bbox'][0]<95 and not prose({'lines':[line]}):
   main=[s['origin'][1] for s in line['spans'] if s['size']>=9 and s['text'].strip()]
   if main:add_base(sorted(main)[len(main)//2])
 if not base:
  base=[s['origin'][1] for s in spans if s['size']>=9]
  base=list(dict.fromkeys(round(b,1) for b in base))
 rows=collections.defaultdict(list)
 for s in spans:
  y=s['origin'][1]
  if MERGE_INLINE_BLOCKS and (s['text'].strip()=='√' or ('Extension' in s['font'] and s['text'].strip() in {'p','q','r','s'})):
   y+=s['size']*.8
  b=min(base,key=lambda b:abs(b-y)) if base else y
  rows[b].append(s)
 tokens=[]
 for ri,(_,row) in enumerate(sorted(rows.items())):
  row.sort(key=lambda s:s['bbox'][0])
  if ri and tokens:
   last=tokens[-1].get('text','')
   if not last.endswith('-'):tokens.append({'text':' '})
  cluster=[];lastx=None
  def flush():
   if not cluster:return
   visible=[s for s in cluster if s['text'].strip()]
   if visible:
    r=fitz.Rect(visible[0]['bbox'])
    for s in visible[1:]:r|=fitz.Rect(s['bbox'])
    tokens.append({'math':vector(key,number,r),'text':accessible(visible) or 'expressão matemática'})
   else:tokens.append({'text':' '})
   cluster.clear()
  for s in row:
   if mathlike(s):
    if not cluster and s['text'].startswith(' '):tokens.append({'text':' '})
    cluster.append(s)
   else:
    flush()
    if lastx is not None and s['bbox'][0]-lastx>1 and not s['text'].startswith(' '):tokens.append({'text':' '})
    t={'text':s['text']}
    if 'Bold' in s['font']:t['bold']=True
    if 'Italic' in s['font']:t['italic']=True
    tokens.append(t)
   lastx=s['bbox'][2]
  flush()
 # Collapse runs of native text while leaving math and semantic emphasis intact.
 merged=[]
 for t in tokens:
  if merged and not t.get('math') and not merged[-1].get('math') and {k:v for k,v in t.items() if k!='text'}=={k:v for k,v in merged[-1].items() if k!='text'}:merged[-1]['text']+=t['text']
  else:merged.append(t)
 return merged

def extract(key,number):
 p=DOCS[key][number-1]
 original=[b for b in p.get_text('dict')['blocks'] if b['type']==0 and b['bbox'][1]>55 and b['bbox'][3]<790]
 source_blocks=original
 if MERGE_INLINE_BLOCKS:
  # PDF text extraction sometimes puts each side of an inline radical in a
  # separate block. Rejoin overlapping prose fragments before baseline reflow.
  joined=[]
  for b in original:
   b={**b,'lines':list(b['lines']),'numbers':[b['number']]}
   previous=joined[-1] if joined else None
   overlap=previous and min(previous['bbox'][3],b['bbox'][3])-max(previous['bbox'][1],b['bbox'][1])>2
   sans=any('Sans' in s['font'] for item in [b]+([previous] if previous else []) for l in item['lines'] for s in l['spans'])
   figure=any(fitz.Rect(f[:4]).intersects(fitz.Rect(b['bbox'])) for f in FIGURES.get((key,number),[]))
   if overlap and not sans and not figure and (prose(previous) or prose(b)):
    previous['lines']+=b['lines'];previous['numbers']+=b['numbers']
    previous['bbox']=tuple(fitz.Rect(previous['bbox'])|fitz.Rect(b['bbox']))
   else:joined.append(b)
  original=joined
 # Some PDF text blocks combine a short connector with a whole display equation.
 # Split those by baseline so that the equation remains a display, not a tall inline.
 prepared=original
 original=[]
 for b in prepared:
  if not prose(b):original.append(b);continue
  anchors=[s['origin'][1] for l in b['lines'] for s in l['spans'] if s['size']>=9 and (not mathlike(s) or l['bbox'][0]<95)]
  groups=[]
  for l in b['lines']:
   separated=not prose({'lines':[l]}) and l['bbox'][0]>95 and min((abs(s['origin'][1]-a) for s in l['spans'] for a in anchors),default=0)>9
   if groups and groups[-1][0]==separated:groups[-1][1].append(l)
   else:groups.append((separated,[l]))
  for _,lines in groups:
   r=fitz.Rect(lines[0]['bbox'])
   for l in lines[1:]:r|=fitz.Rect(l['bbox'])
   original.append({**b,'lines':lines,'bbox':tuple(r)})
 figures=FIGURES.get((key,number),[])
 result=[];equations=[];covered=[]
 def provenance(blocks):
  return {'document':key,'page':number,'blocks':list(dict.fromkeys(n for b in blocks for n in b.get('numbers',[b['number']])))}
 def flush():
  if not equations:return
  r=fitz.Rect(equations[0]['bbox'])
  for b in equations[1:]:r|=fitz.Rect(b['bbox'])
  spans=[s for b in equations for l in b['lines'] for s in l['spans']]
  result.append({'type':'equation','image':vector(key,number,r),'text':accessible(spans), 'source':provenance(equations)})
  equations.clear()
 for b in original:
  t=text(b);r=fitz.Rect(b['bbox'])
  fig=next((f for f in figures if fitz.Rect(f[:4]).contains(r)),None)
  covered.extend(b.get('numbers',[b['number']]))
  if fig:continue
  spans=[s for l in b['lines'] for s in l['spans']]
  first=spans[0]
  sans=all('Sans' in s['font'] for s in spans if s['text'].strip())
  heading=sans and ('Bold' in first['font'] or first['size']>13)
  # Single-word prose connectors must remain text, including inside result boxes.
  if heading:
   flush()
   level=3 if first['size']<13 else 2
   if t.startswith('CAPÍTULO '):level=4
   result.append({'type':'heading','level':level,'text':t,'source':provenance([b]),'boxed':first['color']==16777215})
  elif (prose(b) and not re.search(r'\(\d+\.\d+\)',t)) or (r.x0<95 and not re.search(r'\(\d+\.\d+\)',t)):
   flush()
   result.append({'type':'paragraph','runs':inline(key,number,b),'text':t,'source':provenance([b])})
  else:
   if equations and r.y0-max(x['bbox'][3] for x in equations)>17:flush()
   equations.append(b)
 flush()
 for f in figures:
  result.append({'type':'figure','image':vector(key,number,f[:4],figure=True),'text':f[4], 'source':{'document':key,'page':number,'blocks':[b['number'] for b in original if fitz.Rect(f[:4]).contains(fitz.Rect(b['bbox']))]}, '_y':f[1]})
 # Use original block order (some radicals extend above the preceding paragraph),
 # inserting diagram blocks at their actual vertical position.
 for item in result:
  if '_y' not in item:
   ids=item['source']['blocks'];item['_y']=next(b['bbox'][1] for b in original if b['number']==ids[0])
 result.sort(key=lambda b:b['_y'])
 for item in result:item.pop('_y',None)
 coverage.append({'document':key,'page':number,'sourceBlocks':len(source_blocks),'coveredBlocks':len(set(covered)), 'characters':sum(len(text(b)) for b in source_blocks)})
 return result

def make_sprites():
 # Share mathematical glyph outlines per source page, avoiding thousands of files
 # and repeated font downloads. Each symbol is an isolated expression or diagram.
 ns='http://www.w3.org/2000/svg'; xl='http://www.w3.org/1999/xlink'
 ET.register_namespace('',ns);ET.register_namespace('xlink',xl)
 groups=collections.defaultdict(list)
 for (key,number,_),value in asset_cache.items():groups[(key,number)].append(value)
 saved=set()
 for (key,number),values in groups.items():
  root=ET.Element('{'+ns+'}svg',{'version':'1.1'})
  defs=ET.SubElement(root,'{'+ns+'}defs');paths={};seen=set()
  for value in values:
   original=value['src']
   if '#' in original:continue
   filename=original.split('/')[-1];frag='f-'+filename[:-4]
   value['src']=f'/{PUBLIC_PREFIX}/{key}-{number:02}.svg#{frag}'
   if frag in seen:continue
   seen.add(frag);svg=ET.parse(ASSETS/filename).getroot();idmap={}
   for el in svg.iter():
    if 'id' in el.attrib:
     old=el.attrib['id']
     if el.tag=='{'+ns+'}path' and 'font_' in old:
      digest=hashlib.sha256(el.attrib.get('d','').encode()).hexdigest()[:16]
      idmap[old]='glyph-'+digest
     else:idmap[old]=frag+'-'+old
   for el in svg.iter():
    if 'id' in el.attrib:el.attrib['id']=idmap[el.attrib['id']]
    for attr,v in list(el.attrib.items()):
     if v.startswith('#'):el.attrib[attr]='#'+idmap.get(v[1:],v[1:])
     elif v.startswith('url(#'):el.attrib[attr]='url(#'+idmap.get(v[5:-1],v[5:-1])+')'
   symbol=ET.SubElement(root,'{'+ns+'}symbol',{'id':frag,'viewBox':svg.attrib['viewBox']})
   for child in list(svg):
    if child.tag=='{'+ns+'}defs':
     for definition in list(child):
      ident=definition.attrib.get('id')
      if ident and ident in paths:continue
      if ident:paths[ident]=True
      defs.append(definition)
    else:symbol.append(child)
  path=ASSETS/f'{key}-{number:02}.svg';path.write_bytes(ET.tostring(root,encoding='utf-8',xml_declaration=True));saved.add(path.name)
 for path in ASSETS.glob('*.svg'):
  if path.name not in saved:path.unlink()
 return len(saved)

if __name__=='__main__':
 pages={}
 for key,doc in DOCS.items():
  for number in ([2]+list(range(5,42)) if key=='aula' else range(1,31)):
   pages[f'{key}-{number}']=extract(key,number)
 sprites=make_sprites()
 (DEST/'source-pages.json').write_text(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n')
 (DEST/'coverage.json').write_text(json.dumps({'sources':[{'id':k,'file':v,'sha256':hashlib.sha256((ROOT/'materiais/referencias'/v).read_bytes()).hexdigest(),'pages':len(DOCS[k])} for k,v in SOURCES.items()],'pages':coverage,'vectorFragments':len(set(x['src'] for x in asset_cache.values())),'spriteFiles':sprites},ensure_ascii=False,indent=2)+'\n')
 from wave_course_map import build_catalog
 build_catalog(DEST)
 print('Imported',len(pages),'content pages;',sum(p['coveredBlocks'] for p in coverage),'source blocks;',len(set(x['src'] for x in asset_cache.values())),'vector fragments in',sprites,'sprite files')
