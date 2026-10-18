"""One source lesson per PDF; chapter-sized readings preserve the original logic."""
import json, re
from pathlib import Path
AULAS=[
 (1,'Cinemática vetorial','Deslocamento, derivadas vetoriais, trajetórias, bases móveis e movimento relativo.'),
 (2,'Leis de Newton','Interações, referenciais inerciais, diagramas de corpo livre, forças e vínculos.'),
 (3,'Aplicações da dinâmica, trabalho e energia','Contatos, sistemas vinculados, trabalho, potenciais, energia, estabilidade e potência.'),
 (5,'Quantidade de movimento e centro de massa','Impulso, sistemas de partículas, distribuições de massa, colisões e fluxos de momento.'),
 (6,'Momento angular, torque e estática','Balanços angulares, momento de inércia, equilíbrio, apoios e estabilidade.'),
]
# These two five-page chapters are split at complete section boundaries.
SPLITS={(1,3):(15,'3.3 ','Velocidade: derivada, tangente e rapidez','Aceleração, derivadas vetoriais e gráficos'),(1,10):(43,'10.3 ','Comparar referenciais e transformação de Galileu','Origens aceleradas, encontros e eixos girantes')}
def build_catalog(dest):
 lessons=[];aulas=[]
 for number,title,description in AULAS:
  key=f'{number:02}';pages=json.loads((dest/f'aula{key}-pages.json').read_text());end=max(int(k.split('-')[1]) for k in pages)
  source=[(n,next((b['text'] for b in pages[f'aula{key}-{n}'] if b['type']=='heading' and b['level']==2),None)) for n in range(6,end+1)]
  starts=[(n,t) for n,t in source if t and t!='Referências e leituras']
  def add(slug,heading,refs,chapter=None,chapter_title=None):
   blocks=[b for ref in refs for b in pages[ref['page']][ref.get('start',0):ref.get('end')]]
   refs_pages=len(set(r['page'] for r in refs))
   lesson={'id':f'uni-s1-a{key}-{slug}','sourceLesson':number,'topicId':f'aula-{key}','unit':f'Aula {key} · {title}','title':heading,'description':next((b['text'] for b in blocks if b['type']=='heading' and re.match(r'^\d+\.\d+ ',b['text'])), 'Convenções, leitura e continuidade do estudo.'),'pages':refs_pages,'minutes':max(6,round(sum(len(b['text']) for b in blocks)/1100*4)),'refs':refs}
   if chapter is not None:lesson.update(chapter=chapter,chapterTitle=chapter_title)
   assert 1<=refs_pages<=4,(lesson['id'],refs_pages)
   lessons.append(lesson)
  refs=lambda first,last:[{'page':f'aula{key}-{n}'} for n in range(first,last+1)]
  add('orientacao','Orientações e notação',refs(2,3))
  for chapter,(first,chapter_title) in enumerate(starts,1):
   last=starts[chapter][0]-1 if chapter<len(starts) else end-1
   split=SPLITS.get((number,chapter))
   if split:
    page,marker,left,right=split;boundary=next(i for i,b in enumerate(pages[f'aula{key}-{page}']) if b['type']=='heading' and b['text'].startswith(marker))
    leftrefs=refs(first,page-1);rightrefs=refs(page,last)
    if boundary:leftrefs.append({'page':f'aula{key}-{page}','end':boundary});rightrefs[0]['start']=boundary
    add(f'c{chapter:02}a',left,leftrefs,chapter,chapter_title);add(f'c{chapter:02}b',right,rightrefs,chapter,chapter_title)
   else:add(f'c{chapter:02}',chapter_title,refs(first,last),chapter,chapter_title)
  add('referencias','Referências e leituras',refs(end,end))
  aulas.append({'number':number,'id':f'aula-{key}','title':title,'description':description,'pdfPages':end,'readings':sum(l['sourceLesson']==number for l in lessons)})
 for name,data in [('lessons',lessons),('aulas',aulas)]:
  (dest/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print('Mapped',len(lessons),'readings in',len(aulas),'source lessons')
if __name__=='__main__':build_catalog(Path(__file__).resolve().parents[1]/'content/universidade/semestre-1')
