"""Editorial divisions of the source, never splitting an ongoing deduction at a page break."""
import json,re
from pathlib import Path
# slug, module, title, source page, optional start-of-section marker
LESSONS = [
 ('guia','Orientação','Como estudar: convenções e hipóteses',2,None),
 ('equacao','1 · Dinâmica e dados iniciais','Da dinâmica da corda à solução de d’Alembert',5,None),
 ('cauchy','1 · Dinâmica e dados iniciais','Dados iniciais, fórmula de Cauchy e pulso gaussiano',6,None),
 ('fase','2 · Superposição e batimentos','Fase, fasores e interferência',7,None),
 ('batimentos','2 · Superposição e batimentos','Batimentos e a janela temporal da medida',8,None),
 ('energia','3 · Energia e propagação','Energia, conservação local e potência na corda',9,None),
 ('esfericas','3 · Energia e propagação','Ondas esféricas e espalhamento geométrico',10,'3.4 '),
 ('interfaces','4 · Interfaces e impedância','Reflexão, transmissão e conservação de potência',11,None),
 ('juncao','4 · Interfaces e impedância','Junção com massa: resposta e armazenamento de energia',12,'4.4 '),
 ('acoplados','5 · Modos normais','Osciladores acoplados e diagonalização',13,None),
 ('modos','5 · Modos normais','Condições de contorno, projeção e energia modal',14,None),
 ('dedilhada','5 · Modos normais','Corda dedilhada e ortogonalidade ponderada',15,'5.5 '),
 ('som','6 · Acústica e ressonância','Equações acústicas, impedância e modos dos tubos',16,None),
 ('ressonancia','6 · Acústica e ressonância','Forçamento modal: picos de amplitude e de potência',17,'6.4 '),
 ('pacotes','7 · Dispersão','Velocidades de fase e grupo, pacotes e alargamento',18,None),
 ('dispersao','7 · Dispersão','Cadeia discreta, frequência de corte e evanescência',19,None),
 ('agua','7 · Dispersão','Ondas de gravidade e capilaridade na água',20,None),
 ('doppler','8 · Doppler e fronteiras móveis','Doppler no meio e reflexão em uma parede móvel',21,None),
 ('mach','8 · Doppler e fronteiras móveis','Fonte supersônica e cone de Mach',22,'8.4 '),
 ('wkb','9 · Meios não uniformes','WKB: fase, amplitude e quantização aproximada',23,None),
 ('suspensa','9 · Meios não uniformes','Corda suspensa, equação de Bessel e fronteira singular',23,'9.2 '),
 ('optica','10 · Óptica ondulatória','Campo eletromagnético, caminho óptico, Snell e Fresnel',25,None),
 ('young','10 · Óptica ondulatória','Experiência de Young e deslocamento de franjas',26,None),
 ('filmes','10 · Óptica ondulatória','Filmes finos: caminho óptico e fases de reflexão',26,'10.4 '),
 ('cavidade','10 · Óptica ondulatória','Reflexões múltiplas, série geométrica e função de Airy',27,'10.6 '),
 ('polarizacao','10 · Óptica ondulatória','Polarização, elipse e lei de Malus',28,None),
 ('fenda','11 · Difração','Fraunhofer: integral de amplitudes e fenda única',29,None),
 ('duas-fendas','11 · Difração','Duas fendas: envelope, franjas e ordens ausentes',30,None),
 ('rede','11 · Difração','Rede de difração e poder de resolução',30,'11.5 '),
 ('circular-bragg','11 · Difração','Abertura circular, critério de Rayleigh e lei de Bragg',31,'11.7 '),
 ('estrategia','12 · Método e referências','Estratégia de resolução e verificações físicas',32,None),
 ('referencias','12 · Método e referências','Referências e alcance do material',33,None),
 ('formulario-dinamica','13 · Formulário fundamental','Dinâmica, harmônicas e dados iniciais',34,None),
 ('formulario-energia','13 · Formulário fundamental','Superposição, média e energia',35,None),
 ('formulario-interfaces','13 · Formulário fundamental','Interfaces e impedâncias',36,None),
 ('formulario-modos','13 · Formulário fundamental','Modos e ressonância',37,None),
 ('formulario-dispersao','13 · Formulário fundamental','Acústica e dispersão',38,None),
 ('formulario-doppler','13 · Formulário fundamental','Doppler e meios não uniformes',39,None),
 ('formulario-optica','13 · Formulário fundamental','Caminho óptico, filmes e polarização',40,None),
 ('formulario-difracao','13 · Formulário fundamental','Difração e resolução',41,None),
]
QUESTION_LESSON = {1:'fase',2:'equacao',3:'cauchy',4:'fase',5:'batimentos',6:'energia',7:'interfaces',8:'modos',9:'som',10:'doppler',11:'young',12:'polarizacao',13:'acoplados',14:'modos',15:'som',16:'agua',17:'filmes',18:'rede',19:'juncao',20:'wkb'}

def build_catalog(dest):
 pages=json.loads((dest/'source-pages.json').read_text())
 lessons=[];current=None
 for n in [2]+list(range(5,42)):
  blocks=pages[f'aula-{n}']
  for index,block in enumerate(blocks):
   spec=next((x for x in LESSONS if x[3]==n and ((x[4] is None and index==0) or (x[4] and block['type']=='heading' and block['text'].startswith(x[4])))),None)
   if spec:
    slug,unit,title,_,_=spec
    current={'id':'olymp-waves-'+slug,'unit':unit,'title':title,'description':title+'. Derivações, hipóteses e condições de uso da apostila.','refs':[]}
    lessons.append(current)
   assert current is not None
   ref={'page':f'aula-{n}','start':index,'end':index+1}
   if current['refs'] and current['refs'][-1]['page']==ref['page'] and current['refs'][-1]['end']==index:current['refs'][-1]['end']+=1
   else:current['refs'].append(ref)
 assert len(lessons)==len(LESSONS)
 questions={};question=None;guide=[];structural=[]
 for n in range(1,12):
  category=''
  for i,b in enumerate(pages[f'ficha-{n}']):
   q=re.match(r'Questão (\d+)\s*[-–]',b['text']) if b['type']=='heading' else None
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   if q:
    number=int(q[1]);question={'id':f'olymp-waves-q{number:02}','kind':'written','sourceNumber':number,'topic':'Ondulatória','course':'olympiad-waves','lessonId':'olymp-waves-'+QUESTION_LESSON[number],'difficulty':'easy' if number<=12 else 'medium' if number<=18 else 'hard','objective':category or 'Modelagem e dedução','format':'Discursiva','prompt':b['text'],'reasoning':'Identifique a variável física, as hipóteses e os vínculos antes de calcular.','statement':[],'solution':[]}
    questions[number]=question
   elif b['type']=='heading' and b.get('level')==2 and not b.get('boxed'):
    category=b['text']
    if n!=1:structural.append(ref);continue
   if question is None:guide.append(ref)
   else:question['statement'].append(ref)
 solution=None;solution_intro=[]
 for n in range(15,31):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)',b['text']) if b['type']=='heading' else None
   if q:solution=questions[int(q[1])]
   if solution is None:solution_intro.append(ref)
   else:solution['solution'].append(ref)
 assert len(questions)==20 and all(q['statement'] and q['solution'] for q in questions.values())
 lessons.extend([
  {'id':'olymp-waves-treino','unit':'14 · Treino e conferência','title':'Como treinar e avaliar sua resolução','description':'Convenções da ficha, roteiro de trabalho e uso das soluções comentadas.','refs':guide+solution_intro},
  {'id':'olymp-waves-gabarito','unit':'14 · Treino e conferência','title':'Gabarito completo para conferência','description':'Resultados das 20 questões, incluindo coeficientes, regimes e condições.','refs':[{'page':f'ficha-{n}'} for n in range(12,15)]},
 ])
 for l in lessons:
  chars=sum(sum(len(b['text']) for b in pages[r['page']][r.get('start',0):r.get('end')]) for r in l['refs'])
  l['minutes']=max(8,round(chars/750*4))
 (dest/'lessons.json').write_text(json.dumps(lessons,ensure_ascii=False,indent=2)+'\n')
 (dest/'questions.json').write_text(json.dumps(list(questions.values()),ensure_ascii=False,indent=2)+'\n')
 (dest/'structural-headings.json').write_text(json.dumps(structural,indent=2)+'\n')
 print('Mapped',len(lessons),'navigable lessons,',len(set(l['unit'] for l in lessons)),'modules and',len(questions),'complete written problems with solutions')

if __name__=='__main__':build_catalog(Path(__file__).resolve().parents[1]/'content/olimpiadas/ondas')
