#!/usr/bin/env python3
"""Import the university collection without rewriting its prose or embedding pages.

Native headings, paragraphs and notation tables; isolated vector math and plots.
The established glyph/sprite exporter is reused without changing other courses.
"""
from pathlib import Path
import collections, hashlib, importlib.util, json, re
import fitz
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'content/universidade/semestre-1';ASSETS=ROOT/'public/universidade-s1'
DIRECTORY=ROOT/'materiais/referencias/universitario/semestre-1'
spec=importlib.util.spec_from_file_location('vector_export',Path(__file__).with_name('import-wave-materials.py'))
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
for d in reader.DOCS.values():d.close()
FILES=sorted(DIRECTORY.glob('Phisify_Aula*.pdf'))
SOURCES={re.search(r'Aula(\d+)',p.name)[1]:p.name for p in FILES}
reader.DOCS={key:fitz.open(DIRECTORY/name) for key,name in SOURCES.items()}
reader.ASSETS=ASSETS;reader.PUBLIC_PREFIX='universidade-s1'
vector=reader.vector
def text(block):return reader.text(block).replace('\x19','→')
MATH_WORDS=reader.MATH_WORDS|{'sen','CM','ext','res','tot','int','in','out','max','min','rel','orb','CM','dt','SI','cot','sec','csc','arcsin','arccos','arctan'}
MERGE_INLINE_BLOCKS=True

def accessible(spans):
 parts=[]
 for s in spans:
  t=s['text'].replace('\x19','→')
  if 'Extension' in s['font'] or 'CMEX' in s['font']:t=''.join(reader.SPECIAL.get(c,c) for c in t)
  parts.append(t)
 return re.sub(r'[\x00-\x1f\uf8f0-\uf8ff]','', ''.join(parts)).strip()
def mathlike(s):
 t=s['text'].strip()
 if not t or 'Math' in s['font'] or re.match(r'CM(MI|SY|EX)|Cmsy',s['font']) or s['size']<8.6:return True
 words=re.findall(r'[A-Za-zÀ-ÿ]{2,}',t)
 if 'Ital' in s['font'] and len(t.strip())<=3:return True
 return not words or all(w in MATH_WORDS for w in words)
def prose(b):
 return any(not mathlike(s) and any(len(w)>=3 and w not in MATH_WORDS for w in re.findall(r'[A-Za-zÀ-ÿ]+',s['text'])) for l in b['lines'] for s in l['spans'])
def bounds(lines):
 r=fitz.Rect(lines[0]['bbox'])
 for l in lines[1:]:r|=fitz.Rect(l['bbox'])
 return tuple(r)

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
  if MERGE_INLINE_BLOCKS and (s['text'].strip()=='√' or 'Extension' in s['font'] or 'CMEX' in s['font']):
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
    if cluster[-1]['text'].endswith(' '):tokens.append({'text':' '})
   else:tokens.append({'text':' '})
   cluster.clear()
  for s in row:
   if s['font'].startswith('F') and '\x19' in s['text']:
    flush();tokens.append({'text':s['text'].replace('\x19','→')})
   elif mathlike(s):
    if not cluster and s['text'].startswith(' '):tokens.append({'text':' '})
    cluster.append(s)
   else:
    flush()
    if lastx is not None and s['bbox'][0]-lastx>1 and not s['text'].startswith(' '):tokens.append({'text':' '})
    t={'text':s['text']}
    if 'Bold' in s['font']:t['bold']=True
    if 'Ital' in s['font']:t['italic']=True
    tokens.append(t)
   lastx=s['bbox'][2]
  flush()
 # Collapse runs of native text while leaving math and semantic emphasis intact.
 merged=[]
 for t in tokens:
  if merged and not t.get('math') and not merged[-1].get('math') and {k:v for k,v in t.items() if k!='text'}=={k:v for k,v in merged[-1].items() if k!='text'}:merged[-1]['text']+=t['text']
  else:merged.append(t)
 return merged


def extract(key,n):
 page=reader.DOCS[key][n-1]
 original=[b for b in page.get_text('dict')['blocks'] if b['type']==0 and b['bbox'][1]>55 and b['bbox'][3]<790 and not text(b).startswith('PHISIFY / MECÂNICA I')]
 provenance=lambda bs:{'document':'universidade-'+key,'page':n,'blocks':list(dict.fromkeys(num for b in bs for num in b.get('numbers',[b['number']])))}
 captions=[b for b in original if re.match(r'^Figura \d+\.\d+:',text(b))]
 figures=[]
 for b in captions:
  rs=[x['rect'] for x in page.get_drawings() if x['type']=='f' and x['fill'] and min(x['fill'])>.99 and x['rect'].width>200 and x['rect'].height>60 and 0<=b['bbox'][1]-x['rect'].y1<20]
  assert rs,(key,n,text(b))
  r=max(rs,key=lambda r:r.width*r.height)
  labels=[x for x in original if r.intersects(fitz.Rect(x['bbox'])) and all('DejaVu' in s['font'] or 'CM' in s['font'] or s['font'].startswith('F') for l in x['lines'] for s in l['spans'])]
  for label in labels:r|=fitz.Rect(label['bbox'])
  absorbed=[x for x in original if r.contains(fitz.Rect(x['bbox']))]
  figures.append((r,b,absorbed))
 skip={b['number'] for r,c,bs in figures for b in bs+[c]}
 result=[]
 for r,caption,bs in figures:
  result.append({'type':'figure','text':text(caption),'runs':inline(key,n,caption),'image':vector(key,n,r,figure=True),'source':provenance(bs+[caption]),'_y':r.y0})
 # The notation sheet is a real two-column table, not a flattened screenshot.
 if n==3:
  header=next(b for b in original if text(b).startswith('Símbolo'))
  table=[]
  for b in original:
   if b['bbox'][1]<=header['bbox'][1]:continue
   if b['bbox'][0]<80:break
   table.append(b)
  rows=[]
  for b in table:
   cells=[]
   for left in [True,False]:
    lines=[]
    for l in b['lines']:
     spans=[s for s in l['spans'] if (s['bbox'][0]<200)==left]
     if spans:
      line={**l,'spans':spans};rect=fitz.Rect(spans[0]['bbox'])
      for s in spans[1:]:rect|=fitz.Rect(s['bbox'])
      line['bbox']=tuple(rect);lines.append(line)
    cells.append(inline(key,n,{'lines':lines}) if lines else [])
   rows.append({'symbol':cells[0],'meaning':cells[1]})
  skip|={b['number'] for b in [header]+table}
  result.append({'type':'table','text':'Símbolo · Significado','rows':rows,'source':provenance([header]+table),'_y':header['bbox'][1]})
 # Rejoin overlapping radicals/fractions before splitting prose and display math.
 joined=[]
 for b in original:
  if b['number'] in skip:continue
  b={**b,'lines':list(b['lines']),'numbers':[b['number']]};prev=joined[-1] if joined else None
  sans=any('NimbusSanL' in s['font'] for x in [b]+([prev] if prev else []) for l in x['lines'] for s in l['spans'])
  overlap=prev and min(prev['bbox'][3],b['bbox'][3])-max(prev['bbox'][1],b['bbox'][1])>2
  if overlap and not sans and (prose(prev) or prose(b)):
   prev['lines']+=b['lines'];prev['numbers']+=b['numbers'];prev['bbox']=tuple(fitz.Rect(prev['bbox'])|fitz.Rect(b['bbox']))
  else:joined.append(b)
 prepared=[]
 for b in joined:
  if not prose(b):prepared.append(b);continue
  anchors=[s['origin'][1] for l in b['lines'] for s in l['spans'] if s['size']>=9 and not mathlike(s) and re.search(r'[A-Za-zÀ-ÿ]{3,}',s['text'])]
  groups=[]
  for l in b['lines']:
   # A radical's PDF origin sits above its visual baseline. Use the main
   # baseline (not the nearest numerator/superscript) to distinguish an inline
   # expression from a new display equation after prose.
   ys=sorted(s['origin'][1]+(s['size']*.8 if s['text'].strip()=='√' or (('CMEX' in s['font'] or 'Extension' in s['font']) and s['text'].strip() in {'p','q','r','s'}) else 0) for s in l['spans'] if s['size']>=9 and s['text'].strip())
   if not ys:ys=sorted(s['origin'][1] for s in l['spans'] if s['text'].strip())
   baseline=ys[len(ys)//2] if ys else 0
   separated=not prose({'lines':[l]}) and l['bbox'][0]>95 and min((abs(baseline-a) for a in anchors),default=0)>8
   if groups and groups[-1][0]==separated:groups[-1][1].append(l)
   else:groups.append((separated,[l]))
  for _,lines in groups:prepared.append({**b,'lines':lines,'bbox':bounds(lines)})
 equations=[]
 def flush():
  if not equations:return
  r=fitz.Rect(equations[0]['bbox'])
  for b in equations[1:]:r|=fitz.Rect(b['bbox'])
  result.append({'type':'equation','text':accessible([s for b in equations for l in b['lines'] for s in l['spans']]),'image':vector(key,n,r),'source':provenance(equations),'_y':equations[0]['bbox'][1]});equations.clear()
 for b in prepared:
  t=text(b);ss=[s for l in b['lines'] for s in l['spans']];first=ss[0];r=fitz.Rect(b['bbox'])
  heading=all('NimbusSanL' in s['font'] for s in ss if s['text'].strip()) and ('Bold' in first['font'] or first['size']>13)
  if heading:
   flush();level=2 if first['size']>20 else 3 if first['size']>12 else 4
   result.append({'type':'heading','level':level,'text':t,'source':provenance([b]),'boxed':first['color']==16777215,'_y':r.y0})
  elif prose(b) or r.x0<95:
   flush();result.append({'type':'paragraph','text':t,'runs':inline(key,n,b),'source':provenance([b]),'_y':r.y0})
  else:
   if equations and r.y0-max(x['bbox'][3] for x in equations)>17:flush()
   equations.append(b)
 flush();result.sort(key=lambda b:b['_y'])
 for b in result:b.pop('_y')
 used={i for b in result for i in b['source']['blocks']}
 assert used=={b['number'] for b in original},(key,n,'missing blocks',set(b['number'] for b in original)-used)
 return result,{'document':key,'page':n,'sourceBlocks':len(original),'coveredBlocks':len(used),'characters':sum(len(text(b)) for b in original)}

if __name__=='__main__':
 DEST.mkdir(parents=True,exist_ok=True);ASSETS.mkdir(parents=True,exist_ok=True)
 pages={};coverage=[]
 for key,doc in reader.DOCS.items():
  pages[key]={}
  for n in [2,3]+list(range(6,len(doc)+1)):
   blocks,covered=extract(key,n);pages[key][f'aula{key}-{n}']=blocks;coverage.append(covered)
 # MuPDF writes a few control-code references in data-text glyph metadata.
 # Strip only XML-forbidden references; all visible glyph paths are unchanged.
 def xml_character(match):
  token=match[0][2:-1];code=int(token[1:],16) if token.startswith('x') else int(token)
  return match[0] if code in (9,10,13) or 0x20<=code<=0xD7FF or 0xE000<=code<=0xFFFD or 0x10000<=code<=0x10FFFF else ''
 for asset in ASSETS.glob('*.svg'):
  raw=asset.read_text();clean=re.sub(r'&#(?:x[0-9a-fA-F]+|[0-9]+);',xml_character,raw)
  if clean!=raw:asset.write_text(clean)
 sprites=reader.make_sprites()
 for key,data in pages.items():(DEST/f'aula{key}-pages.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 (DEST/'coverage.json').write_text(json.dumps({'sources':[{'id':key,'file':name,'pages':len(reader.DOCS[key]),'sha256':hashlib.sha256((DIRECTORY/name).read_bytes()).hexdigest()} for key,name in SOURCES.items()],'pages':coverage,'spriteFiles':sprites},ensure_ascii=False,indent=2)+'\n')
 from university_course_map import build_catalog
 build_catalog(DEST)
 print('Imported',len(coverage),'instructional pages and',sum(p['sourceBlocks'] for p in coverage),'source blocks;',sprites,'SVG sprites')
