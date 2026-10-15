"""Group complete chapters into 1–2 source pages, or up to four for advanced work."""
import json, re
from pathlib import Path

# Each lesson contains the complete page range, including examples and caveats.
# slug, module, title, first physical PDF page, last physical PDF page
LESSONS = [
 ('guia','Orientação','Como estudar: sistema, referencial e hipóteses',2,2),
 ('geometria','1 · Fundamentos do centro de massa','Definição, integração e exemplos de distribuições de massa',5,6),
 ('dinamica','1 · Fundamentos do centro de massa','Dinâmica do centro de massa, conservação e fragmentação',7,8),
 ('energia','1 · Fundamentos do centro de massa','Teorema de König, energia interna e colisões',9,10),
 ('momento-angular','2 · Rotação e movimento relativo','Momento angular: decomposição e escolha de uma origem móvel',11,12),
 ('rigidos','2 · Rotação e movimento relativo','Corpos rígidos, Steiner, impacto excêntrico e pêndulo físico',13,15),
 ('dois-corpos','2 · Rotação e movimento relativo','Massa reduzida: da mola livre à binária gravitacional',16,17),
 ('referenciais','3 · Referenciais e vínculos móveis','Centro de massa acelerado e referenciais girantes',18,19),
 ('cunha','3 · Referenciais e vínculos móveis','Cunha livre: recuo, energia e conferência por Newton',20,21),
 ('pendulo','3 · Referenciais e vínculos móveis','Pêndulo em carrinho: equação não linear, oscilações e tensão',22,24),
 ('rolamento','3 · Referenciais e vínculos móveis','Rolamento e trabalho do atrito em uma plataforma móvel',25,26),
 ('sistemas-abertos','4 · Limites e síntese','Sistemas abertos, fluxo de momento e foguetes',27,28),
 ('sintese','4 · Limites e síntese','Estratégia olímpica e três problemas de síntese com conferência',29,31),
 ('referencias','5 · Consulta e formulário','Fontes, alcance e uso do material',32,32),
 ('formulario-fundamentos','5 · Consulta e formulário','Formulário: coordenadas, dinâmica, energia e momento angular',33,34),
 ('formulario-rotacao','5 · Consulta e formulário','Formulário: inércia, dois corpos, colisões e referenciais',35,36),
 ('formulario-vinculos','5 · Consulta e formulário','Formulário: referenciais, vínculos móveis e sistemas abertos',37,38),
]
QUESTION_LESSON = {1:'geometria',2:'geometria',3:'geometria',4:'dinamica',5:'dinamica',6:'dinamica',7:'energia',8:'rigidos',9:'geometria',10:'cunha',11:'dois-corpos',12:'rigidos',13:'pendulo',14:'pendulo'}

def build_catalog(dest):
 pages=json.loads((dest/'source-pages.json').read_text())
 lessons=[{
  'id':'olymp-cm-'+slug,'unit':unit,'title':title,
  'description':title+'. Teoria, deduções, hipóteses e exemplos mantidos em uma leitura contínua.',
  'pages':last-first+1,'refs':[{'page':f'aula-{n}'} for n in range(first,last+1)],
 } for slug,unit,title,first,last in LESSONS]
 # Section 13.8 begins on page 36 and its validity condition continues on 37.
 # Keep this complete section with the following advanced reference lesson.
 boundary=next(i for i,b in enumerate(pages['aula-36']) if b['type']=='heading' and b['text'].startswith('13.8 '))
 rotation=next(l for l in lessons if l['id']=='olymp-cm-formulario-rotacao')
 rotation['refs'][-1]['end']=boundary
 moving=next(l for l in lessons if l['id']=='olymp-cm-formulario-vinculos')
 moving['refs'].insert(0,{'page':'aula-36','start':boundary})
 moving['pages']=3
 assert all(1<=lesson['pages']<=4 for lesson in lessons)
 questions={};question=None;guide=[];structural=[]
 for n in range(1,9):
  category=''
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)\s*[-–]',b['text']) if b['type']=='heading' else None
   if q:
    number=int(q[1])
    question={'id':f'olymp-cm-q{number:02}','kind':'written','sourceNumber':number,'topic':'Centro de Massa','course':'olympiad-center-of-mass','lessonId':'olymp-cm-'+QUESTION_LESSON[number],'difficulty':'easy' if number<=8 else 'medium' if number<=12 else 'hard','objective':category or 'Definição, sistema e conservações','format':'Discursiva','prompt':b['text'],'reasoning':'Escolha o sistema e o referencial, declare a conservação e escreva os vínculos antes de calcular.','statement':[],'solution':[],'hints':[]}
    questions[number]=question
   elif b['type']=='heading' and b.get('level')==2 and not b.get('boxed'):
    category=b['text']
    if n!=1:structural.append(ref);continue
   if question is None:guide.append(ref)
   else:question['statement'].append(ref)
 solution=None
 for n in range(10,18):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)',b['text']) if b['type']=='heading' else None
   if q:solution=questions[int(q[1])]
   elif b['type']=='heading' and b['text'].startswith('Gabarito comentado'):
    structural.append(ref);continue
   assert solution is not None, (n,i,b['text'])
   solution['solution'].append(ref)
 # Hints stay optional and scoped to their own question; the complete source
 # guide is also reachable from the sheet without making tiny standalone lessons.
 hint=None
 for i,b in enumerate(pages['ficha-9']):
  match=re.match(r'(\d+)\.\s',b['text'])
  if match:hint=questions[int(match[1])]
  elif b['type']=='heading':hint=None
  if hint is not None:hint['hints'].append({'page':'ficha-9','start':i,'end':i+1})
 assert len(questions)==14 and all(q['statement'] and q['solution'] and q['hints'] for q in questions.values())
 lessons.append({'id':'olymp-cm-treino','unit':'6 · Ficha e treino','title':'Orientações da ficha e pistas opcionais','description':'Como resolver, consultar uma pista por vez e registrar onde o raciocínio precisa de revisão.','pages':2,'refs':guide+[{'page':'ficha-9'}]})
 for lesson in lessons:
  chars=sum(sum(len(b['text']) for b in pages[r['page']][r.get('start',0):r.get('end')]) for r in lesson['refs'])
  lesson['minutes']=max(8,round(chars/750*4))
 for name,value in [('lessons',lessons),('questions',list(questions.values())),('structural-headings',structural)]:
  (dest/f'{name}.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 print('Mapped',len(lessons),'lessons (1–3 pages),',len(set(l['unit'] for l in lessons)),'modules and',len(questions),'complete problems with solutions and hints')

if __name__=='__main__':build_catalog(Path(__file__).resolve().parents[1]/'content/olimpiadas/centro-de-massa')
