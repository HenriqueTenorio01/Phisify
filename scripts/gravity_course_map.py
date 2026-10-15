"""Keep each derivation and worked example continuous across source page breaks."""
import json, re
from pathlib import Path

# slug, module, title, physical PDF page, optional section heading prefix
LESSONS = [
 ('guia','Orientação','Como estudar: sistema, convenções e hipóteses',2,None),
 ('potencial','1 · Força, campo e potencial','Campo, potencial e energia de sistemas de partículas',5,None),
 ('casca','1 · Força, campo e potencial','Teorema da casca: demonstração pelo potencial',6,'1.3 '),
 ('interior','1 · Força, campo e potencial','Esfera homogênea e túnel gravitacional',6,'1.4 '),
 ('autoenergia','1 · Força, campo e potencial','Campo quase uniforme e autoenergia gravitacional',7,'1.6 '),
 ('dois-corpos','2 · Redução a dois corpos','Centro de massa, massa reduzida e movimento relativo',8,None),
 ('polares','2 · Redução a dois corpos','Órbita plana e derivação da cinemática polar',9,None),
 ('efetivo','3 · Potencial efetivo e estabilidade','Redução radial, barreira e pontos de retorno',10,None),
 ('estabilidade','3 · Potencial efetivo e estabilidade','Estabilidade de círculos e pequenas oscilações radiais',11,'3.3 '),
 ('lancamento','3 · Potencial efetivo e estabilidade','Lançamento tangencial: círculo, elipse ou escape?',11,'3.4 '),
 ('binet','4 · Binet e equação da órbita','Da equação radial à equação polar das cônicas',13,None),
 ('forca-inversa','4 · Binet e equação da órbita','Reconstruir a força a partir de uma trajetória',14,'4.3 '),
 ('geometria','5 · Geometria, energia e excentricidade','Da equação polar aos semieixos e aos focos',15,None),
 ('energia','5 · Geometria, energia e excentricidade','Energia, excentricidade, vis-viva e apses',15,'5.2 '),
 ('vetor-excentricidade','5 · Geometria, energia e excentricidade','Vetor de excentricidade e orientação da órbita',16,'5.4 '),
 ('kepler','6 · Leis de Kepler e evolução temporal','Lei das áreas, período e equação de Kepler',18,None),
 ('barker-virial','6 · Leis de Kepler e evolução temporal','Tempo na parábola e teorema do virial',19,'6.4 '),
 ('escape','7 · Escape, queda radial e colisão','Energia de escape e referencial inercial',20,None),
 ('queda','7 · Escape, queda radial e colisão','Queda radial e tempo até o contato de dois corpos',20,'7.2 '),
 ('colisao','7 · Escape, queda radial e colisão','Periastro, superfície e condição de colisão futura',21,'7.4 '),
 ('hohmann','8 · Impulsos e transferências orbitais','Novos invariantes e transferência de Hohmann',22,None),
 ('oberth','8 · Impulsos e transferências orbitais','Impulso no periastro e efeito Oberth',23,'8.4 '),
 ('hiperboles','9 · Órbitas hiperbólicas e espalhamento','Parâmetro de impacto, desvio e focalização gravitacional',24,None),
 ('assistencia','9 · Órbitas hiperbólicas e espalhamento','Assistência gravitacional e mudança de referencial',25,'9.4 '),
 ('precessao','10 · Além da órbita kepleriana','Binet modificado e precessão dos apses',26,None),
 ('mares','10 · Além da órbita kepleriana','Gradiente do campo e aceleração de maré',26,'10.2 '),
 ('hill','10 · Além da órbita kepleriana','Escala de Hill e o referencial girante',27,'10.3 '),
 ('estrategia','11 · Estratégia e problemas de síntese','Escolher a ferramenta e reconstruir uma binária',28,None),
 ('sintese','11 · Estratégia e problemas de síntese','Colisão com energia positiva e mudança súbita da fonte',29,'11.3 '),
 ('referencias','11 · Estratégia e problemas de síntese','Referências e alcance do material',30,None),
 ('formulario-campos','12 · Formulário fundamental','Convenções, campos e potenciais',31,None),
 ('formulario-invariantes','12 · Formulário fundamental','Dois corpos, invariantes e potencial efetivo',32,None),
 ('formulario-binet','12 · Formulário fundamental','Binet, cônicas e orientação',33,None),
 ('formulario-tempo','12 · Formulário fundamental','Energia, velocidades e evolução temporal',34,None),
 ('formulario-manobras','12 · Formulário fundamental','Escape, queda e manobras',35,None),
 ('formulario-extensoes','12 · Formulário fundamental','Espalhamento, precessão, marés e Hill',36,None),
]
QUESTION_LESSON = {1:'potencial',2:'potencial',3:'casca',4:'interior',5:'energia',6:'queda',7:'geometria',8:'dois-corpos',9:'efetivo',10:'binet',11:'vetor-excentricidade',12:'mares',13:'vetor-excentricidade',14:'kepler',15:'hohmann',16:'hiperboles',17:'queda',18:'precessao',19:'interior',20:'colisao'}

GROUPS = [
 (['guia','treino'],'Como estudar: sistema, convenções e orientações de treino',2),
 (['potencial','casca'],'Campo, potencial, energia e teorema da casca',2),
 (['interior','autoenergia'],'Campo interior, túnel gravitacional e autoenergia',2),
 (['dois-corpos','polares'],'Redução a dois corpos, órbita plana e cinemática polar',2),
 (['efetivo','estabilidade','lancamento'],'Potencial efetivo, estabilidade e lançamento tangencial',3),
 (['binet','forca-inversa'],'Equação de Binet, cônicas e reconstrução da força',2),
 (['geometria','energia','vetor-excentricidade'],'Geometria, energia, apses e vetor de excentricidade',3),
 (['kepler','barker-virial'],'Leis de Kepler, evolução temporal, Barker e virial',2),
 (['escape','queda','colisao'],'Escape, queda radial e colisão com uma fonte extensa',2),
 (['hohmann','oberth'],'Impulsos, transferência de Hohmann e efeito Oberth',2),
 (['hiperboles','assistencia'],'Hipérboles, espalhamento e assistência gravitacional',2),
 (['precessao','mares','hill'],'Além de Kepler: precessão, marés e escala de Hill',2),
 (['estrategia','sintese','referencias'],'Estratégia, problemas de síntese e referências',3),
 (['formulario-campos','formulario-invariantes'],'Formulário: campos, dois corpos e invariantes',2),
 (['formulario-binet','formulario-tempo'],'Formulário: Binet, geometria, energia e tempo',2),
 (['formulario-manobras','formulario-extensoes'],'Formulário: escape, manobras, espalhamento e extensões',2),
 (['gabarito'],'Gabarito completo para conferência',2),
]

def build_catalog(dest):
 pages=json.loads((dest/'source-pages.json').read_text())
 lessons=[];current=None
 for n in [2]+list(range(5,37)):
  for index,block in enumerate(pages[f'aula-{n}']):
   spec=next((x for x in LESSONS if x[3]==n and ((x[4] is None and index==0) or (x[4] and block['type']=='heading' and block['text'].startswith(x[4])))),None)
   if spec:
    slug,unit,title,_,_=spec
    current={'id':'olymp-gravity-'+slug,'unit':unit,'title':title,'description':title+'. Derivações, hipóteses e condições de uso da apostila.','refs':[]}
    lessons.append(current)
   assert current is not None
   ref={'page':f'aula-{n}','start':index,'end':index+1}
   if current['refs'] and current['refs'][-1]['page']==ref['page'] and current['refs'][-1]['end']==index:current['refs'][-1]['end']+=1
   else:current['refs'].append(ref)
 assert len(lessons)==len(LESSONS), (len(lessons),len(LESSONS))
 questions={};question=None;guide=[];structural=[]
 for n in range(1,13):
  category=''
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)\s*[-–]',b['text']) if b['type']=='heading' else None
   if q:
    number=int(q[1])
    question={'id':f'olymp-gravity-q{number:02}','kind':'written','sourceNumber':number,'topic':'Gravitação','course':'olympiad-gravity','lessonId':'olymp-gravity-'+QUESTION_LESSON[number],'difficulty':'easy' if number<=12 else 'medium' if number<=17 else 'hard','objective':category or 'Modelagem e dedução','format':'Discursiva','prompt':b['text'],'reasoning':'Defina o sistema, o referencial, as conservações e o domínio físico antes de calcular.','statement':[],'solution':[]}
    questions[number]=question
   elif b['type']=='heading' and b.get('level')==2 and not b.get('boxed'):
    category=b['text']
    if n!=1:structural.append(ref);continue
   if question is None:guide.append(ref)
   else:question['statement'].append(ref)
 solution=None;solution_intro=[]
 for n in range(15,28):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)',b['text']) if b['type']=='heading' else None
   if q:solution=questions[int(q[1])]
   if solution is None:solution_intro.append(ref)
   else:solution['solution'].append(ref)
 assert len(questions)==20 and all(q['statement'] and q['solution'] for q in questions.values())
 lessons.extend([
  {'id':'olymp-gravity-treino','unit':'13 · Treino e conferência','title':'Como treinar e avaliar sua resolução','description':'Convenções da ficha, roteiro de trabalho e uso das soluções comentadas.','refs':guide+solution_intro},
  {'id':'olymp-gravity-gabarito','unit':'13 · Treino e conferência','title':'Gabarito completo para conferência','description':'Resultados das 20 questões, incluindo modelos, regimes e condições.','refs':[{'page':f'ficha-{n}'} for n in range(13,15)]},
 ])
 from group_handbook_lessons import group_lessons
 lessons=group_lessons(lessons,list(questions.values()),'olymp-gravity-',GROUPS)
 for lesson in lessons:
  chars=sum(sum(len(b['text']) for b in pages[r['page']][r.get('start',0):r.get('end')]) for r in lesson['refs'])
  lesson['minutes']=max(8,round(chars/750*4))
 for name,value in [('lessons',lessons),('questions',list(questions.values())),('structural-headings',structural)]:
  (dest/f'{name}.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 print('Mapped',len(lessons),'lessons,',len(set(l['unit'] for l in lessons)),'modules and',len(questions),'complete problems with solutions')

if __name__=='__main__':build_catalog(Path(__file__).resolve().parents[1]/'content/olimpiadas/gravitacao')
