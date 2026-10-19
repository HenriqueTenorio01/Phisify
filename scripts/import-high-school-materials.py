#!/usr/bin/env python3
"""Import the four remaining Ensino Médio collections as reflowable source text.

No page embeds: paragraphs/headings/tables are native; only complete expressions
and the reviewed original diagrams use isolated SVG fragments. Coverage includes
source hashes and every instructional block, including guides and quick answers.
"""
from pathlib import Path
import collections, hashlib, importlib.util, json, re
import fitz
ROOT=Path(__file__).resolve().parents[1]
DIRECTORY=ROOT/'materiais/referencias/ensino-medio'
spec=importlib.util.spec_from_file_location('semantic_reader',Path(__file__).with_name('import-university-materials.py'))
semantic=importlib.util.module_from_spec(spec);spec.loader.exec_module(semantic)
reader=semantic.reader
for doc in reader.DOCS.values():doc.close()
FIGURES=json.loads(Path(__file__).with_name('high_school_figures.json').read_text())
COLLECTIONS={
 'eletricidade':('Aula_Eletricidade_Ensino_Medio.pdf','Ficha_Eletricidade_Ensino_Medio.pdf',[2],range(6,46)),
 'mhs-ondas':('Aula_MHS_Ondas_Ensino_Medio.pdf','Ficha_MHS_Ondas_Ensino_Medio.pdf',[2,3],range(6,48)),
 'optica':('Aula_Optica_Ensino_Medio.pdf','Ficha_Optica_Ensino_Medio (2).pdf',[2],range(6,44)),
 'termologia':('Aula_Termologia_Termodinamica_Ensino_Medio.pdf','Ficha_Termodinamica_Ensino_Medio.pdf',[2,3],range(6,48)),
}
text=semantic.text;prose=semantic.prose;mathlike=semantic.mathlike
bounds=semantic.bounds;inline=semantic.inline;accessible=semantic.accessible;vector=reader.vector

def vector(key,number,rect,figure=False):
 # Curved TikZ paths may have Bezier control points outside their visible bounds.
 # Remove fully covered outside paths for diagrams, so the original curves stay
 # intact; source text outside this isolated fragment is always redacted.
 rect=fitz.Rect(rect)
 rect=fitz.Rect(max(0,rect.x0-1.1),max(0,rect.y0-1.2),min(595.276,rect.x1+1.1),min(841.89,rect.y1+1.2))
 cachekey=(key,number,tuple(round(v,3) for v in rect))
 if cachekey in reader.asset_cache:return reader.asset_cache[cachekey]
 doc=fitz.open();doc.insert_pdf(reader.DOCS[key],from_page=number-1,to_page=number-1)
 page=doc[0];width,height=page.rect.width,page.rect.height
 if figure:
  for b in page.get_text('blocks'):
   r=fitz.Rect(b[:4])
   if rect.intersects(r) and not rect.contains(r):page.add_redact_annot(r,fill=None)
  page.apply_redactions(images=0,graphics=0,text=0)
 for r in [fitz.Rect(0,0,width,rect.y0),fitz.Rect(0,rect.y1,width,height),fitz.Rect(0,rect.y0,rect.x0,rect.y1),fitz.Rect(rect.x1,rect.y0,width,rect.y1)]:
  if not r.is_empty:page.add_redact_annot(r,fill=None)
 page.apply_redactions(images=2,graphics=1 if figure else 2,text=0)
 page.set_cropbox(rect);svg=page.get_svg_image()
 name=hashlib.sha256(svg.encode()).hexdigest()[:18]+'.svg'
 (reader.ASSETS/name).write_text(svg)
 result={'src':f'/{reader.PUBLIC_PREFIX}/'+name,'width':round(rect.width,2),'height':round(rect.height,2)}
 reader.asset_cache[cachekey]=result;doc.close();return result
semantic.vector=vector

def table(key,n,original,collection):
 """Recover the original content maps and difficulty tables, including wrapped cells."""
 if (key,n)==('aula',3) and collection in ('mhs-ondas','termologia'):
  top,bottom=135,400 if collection=='mhs-ondas' else 410
  columns=['Capítulo','Assuntos'];edges=[95]
 elif (key,n)==('ficha',2):
  header=next(b for b in original if text(b).startswith('Bloco'))
  top=header['bbox'][1]-.1
  # Subsequent prose can share a PDF block with the last table row.
  after=[l['bbox'][1] for b in original for l in b['lines'] if l['bbox'][1]>top and re.match(r'^(Notação|Dados e unidades|Convenção em espelhos)',text({'lines':[l]}))]
  bottom=min(after) if after else max(b['bbox'][3] for b in original if 'Fáceis' in text(b))+.1
  columns=['Bloco','Questões','Foco'] if collection=='mhs-ondas' else ['Bloco','Questões','Quantidade','Foco']
  edges=[140,260] if collection=='mhs-ondas' else [140,197,260]
 else:return original,[]
 lines=[];rest=[];numbers=[]
 for b in original:
  selected=[l for l in b['lines'] if top<=l['bbox'][1]<bottom]
  other=[l for l in b['lines'] if l not in selected]
  if selected:lines+=selected;numbers.append(b['number'])
  if other:rest.append({**b,'lines':other,'bbox':bounds(other)})
 lines.sort(key=lambda l:(round(l['bbox'][1],1),l['bbox'][0]))
 # PDF table headers are replaced by the same native column labels.
 rows=[]
 for l in lines:
  spans=l['spans'];first=spans[0]['text'].strip()
  if l['bbox'][1]<top+12:continue
  new=spans[0]['bbox'][0]<90
  if new or not rows:rows.append([[] for _ in columns])
  for c in range(len(columns)):
   cell=[s for s in spans if sum(s['bbox'][0]>=e for e in edges)==c]
   if cell:rows[-1][c].append({**l,'spans':cell,'bbox':tuple(fitz.Rect(cell[0]['bbox'])|fitz.Rect(cell[-1]['bbox']))})
 cells=[[inline(key,n,{'lines':cell}) if cell else [] for cell in row] for row in rows]
 block={'type':'table','text':'Mapa de conteúdos' if key=='aula' else 'Progressão da ficha','columns':columns,'cells':cells,'source':{'document':key,'page':n,'blocks':numbers},'_y':top}
 assert len(rows)==(12 if collection=='mhs-ondas' else 14) if key=='aula' else len(rows)==3,(collection,key,n,len(rows))
 return rest,[block]

def extract(key,n,collection,filename):
 page=reader.DOCS[key][n-1]
 original=[b for b in page.get_text('dict')['blocks'] if b['type']==0 and b['bbox'][1]>55 and b['bbox'][3]<790]
 original_numbers={b['number'] for b in original}
 provenance=lambda bs:{'document':key,'page':n,'blocks':list(dict.fromkeys(num for b in bs for num in b.get('numbers',[b['number']])))}
 original,result=table(key,n,original,collection)
 skip=set()
 for i,coords in enumerate(FIGURES[filename].get(str(n),[])):
  rect=fitz.Rect(coords)
  absorbed=[b for b in original if rect.contains(fitz.Rect(b['bbox']))]
  # Each reviewed crop contains only its diagram and the original labels/caption.
  result.append({'type':'figure','text':f'Diagrama original · {"aula" if key=="aula" else "ficha"} · página PDF {n}'+(f' · figura {i+1}' if len(FIGURES[filename][str(n)])>1 else ''),'image':vector(key,n,rect,figure=True),'source':provenance(absorbed),'_y':rect.y0})
  skip.update(b['number'] for b in absorbed)
 joined=[]
 for b in original:
  if b['number'] in skip:continue
  b={**b,'lines':list(b['lines']),'numbers':[b['number']]};prev=joined[-1] if joined else None
  heading=any('Sans' in s['font'] for x in [b]+([prev] if prev else []) for l in x['lines'] for s in l['spans'])
  overlap=prev and min(prev['bbox'][3],b['bbox'][3])-max(prev['bbox'][1],b['bbox'][1])>2
  if overlap and not heading and (prose(prev) or prose(b)):
   prev['lines']+=b['lines'];prev['numbers']+=b['numbers'];prev['bbox']=tuple(fitz.Rect(prev['bbox'])|fitz.Rect(b['bbox']))
  else:joined.append(b)
 prepared=[]
 for b in joined:
  if not prose(b):prepared.append(b);continue
  anchors=[s['origin'][1] for l in b['lines'] for s in l['spans'] if s['size']>=9 and not mathlike(s) and re.search(r'[A-Za-zÀ-ÿ]{3,}',s['text'])]
  groups=[]
  for l in b['lines']:
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
  rect=fitz.Rect(equations[0]['bbox'])
  for b in equations[1:]:rect|=fitz.Rect(b['bbox'])
  result.append({'type':'equation','text':accessible([s for b in equations for l in b['lines'] for s in l['spans']]),'image':vector(key,n,rect),'source':provenance(equations),'_y':rect.y0});equations.clear()
 for b in prepared:
  t=text(b);spans=[s for l in b['lines'] for s in l['spans']];first=spans[0];rect=fitz.Rect(b['bbox'])
  heading=all(('Sans' in s['font'] or 'Bold' in s['font']) and s['size']>=10.8 for s in spans if s['text'].strip())
  if heading:
   flush();level=2 if first['size']>18 else 3 if first['size']>13 else 4
   result.append({'type':'heading','level':level,'text':t,'source':provenance([b]),'boxed':first['color']==16777215,'_y':rect.y0})
  elif prose(b) or rect.x0<95:
   flush();result.append({'type':'paragraph','text':t,'runs':inline(key,n,b),'source':provenance([b]),'_y':rect.y0})
  else:
   if equations and rect.y0-max(x['bbox'][3] for x in equations)>17:flush()
   equations.append(b)
 flush();result.sort(key=lambda b:b['_y'])
 for b in result:b.pop('_y')
 used={i for b in result for i in b['source']['blocks']}
 assert used==original_numbers,(collection,key,n,'missing blocks',original_numbers-used)
 return result,{'document':key,'page':n,'sourceBlocks':len(original_numbers),'coveredBlocks':len(used),'characters':sum(len(text(b)) for b in original)}

def xml_character(match):
 token=match[0][2:-1];code=int(token[1:],16) if token.startswith('x') else int(token)
 return match[0] if code in (9,10,13) or 0x20<=code<=0xD7FF or 0xE000<=code<=0xFFFD or 0x10000<=code<=0x10FFFF else ''

def run():
 from high_school_course_map import build_catalog
 for collection,(aula,ficha,intro,body) in COLLECTIONS.items():
  dest=ROOT/'content/ensino-medio'/collection;dest.mkdir(parents=True,exist_ok=True)
  assets=ROOT/'public'/('em-'+collection);assets.mkdir(parents=True,exist_ok=True)
  reader.ASSETS=assets;reader.PUBLIC_PREFIX='em-'+collection;reader.asset_cache={}
  sources={'aula':aula,'ficha':ficha};reader.DOCS={key:fitz.open(DIRECTORY/name) for key,name in sources.items()}
  pages={};coverage=[]
  for key,doc in reader.DOCS.items():
   for n in (intro+list(body)) if key=='aula' else range(2,len(doc)+1):
    blocks,covered=extract(key,n,collection,sources[key]);pages[f'{key}-{n}']=blocks;coverage.append(covered)
  for asset in assets.glob('*.svg'):
   raw=asset.read_text();clean=re.sub(r'&#(?:x[0-9a-fA-F]+|[0-9]+);',xml_character,raw)
   if clean!=raw:asset.write_text(clean)
  sprites=reader.make_sprites()
  (dest/'source-pages.json').write_text(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n')
  (dest/'coverage.json').write_text(json.dumps({'sources':[{'id':key,'file':name,'pages':len(reader.DOCS[key]),'sha256':hashlib.sha256((DIRECTORY/name).read_bytes()).hexdigest()} for key,name in sources.items()],'pages':coverage,'spriteFiles':sprites,'figures':sum(b['type']=='figure' for bs in pages.values() for b in bs)},ensure_ascii=False,indent=2)+'\n')
  build_catalog(collection,dest)
  print(collection,len(coverage),'instructional pages;',sprites,'SVG sprites',flush=True)
  for doc in reader.DOCS.values():doc.close()
if __name__=='__main__':run()
