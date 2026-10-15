"""Complete source coverage; thematic lessons keep every derivation and worked example."""
import json,re
from pathlib import Path
TOPICS=[('fundamentos','Fundamentos','Medidas, modelos, vetores e leitura de gráficos.'),('cinematica','Cinemática','Descrição escalar e vetorial do movimento, lançamentos e movimento circular.'),('dinamica','Dinâmica','Forças, vínculos, trabalho, energia, impulso e colisões.'),('estatica','Estática','Equilíbrio, torques, apoios e estabilidade.'),('gravitacao','Gravitação','Campo, órbitas, leis de Kepler e energia gravitacional.'),('hidrostatica','Hidrostática','Pressão, manômetros, Pascal, empuxo e flutuação.'),('hidrodinamica','Hidrodinâmica','Vazão, continuidade, Bernoulli, jatos e bombas.'),('integracao','Integração','Escolha dos sistemas e combinação de métodos.'),('consulta','Consulta e orientação','Roteiros, gabaritos e formulários com condições de uso.')]
# slug, topic, title, first page, first heading. The next start closes the interval.
CORE=[
 ('medidas','fundamentos','Medidas, dimensões e construção de modelos',6,None),
 ('vetores','fundamentos','Vetores, componentes e trigonometria',7,'1.2 '),
 ('graficos','fundamentos','O que um gráfico físico permite concluir',8,'1.4 '),
 ('medias','cinematica','Referencial, posição, deslocamento e médias',9,None),
 ('mu','cinematica','Movimento uniforme, encontros e relógios',10,None),
 ('mruv','cinematica','Construir as equações do movimento acelerado',10,'2.4 '),
 ('frenagem','cinematica','Tempo de reação e frenagem',12,'2.7 '),
 ('vertical','cinematica','Queda livre e lançamento vertical',12,'2.8 '),
 ('relativo','cinematica','Movimento relativo e composição de velocidades',14,None),
 ('lancamentos','cinematica','Lançamentos: duas direções, um mesmo tempo',15,None),
 ('circular','cinematica','Movimento circular e aceleração vetorial',17,None),
 ('newton','dinamica','Leis de Newton, sistema e diagrama de forças',19,None),
 ('atrito','dinamica','Atrito, contato e resistência do ar',21,'5.7 '),
 ('rampa','dinamica','Plano inclinado: projetar e testar o regime',22,None),
 ('vinculos','dinamica','Blocos, polias e molas: forças e restrições',23,None),
 ('curvas','dinamica','Curvas e perda de contato',24,'6.5 '),
 ('trabalho','dinamica','Trabalho e teorema da energia cinética',26,None),
 ('energia','dinamica','Potenciais, conservação e dissipação',27,'7.3 '),
 ('potencia','dinamica','Potência, rendimento e consumo',29,None),
 ('impulso','dinamica','Impulso e conservação do momento linear',30,None),
 ('colisoes','dinamica','Colisões, recuo e centro de massa',31,'8.3 '),
 ('equilibrio','estatica','Equilíbrio de partículas e corpos extensos',34,None),
 ('apoios','estatica','Alavancas, escadas e tombamento',35,None),
 ('orbitas','gravitacao','Gravitação, campo e movimento orbital',37,None),
 ('escape','gravitacao','Energia, escape e satélites geoestacionários',39,'10.5 '),
 ('pressao','hidrostatica','Densidade, pressão, Stevin e manômetros',41,None),
 ('pascal','hidrostatica','Forças nas paredes e transmissão de pressão',43,'11.4.1 '),
 ('empuxo','hidrostatica','Empuxo, flutuação e capacidade de carga',44,None),
 ('bernoulli','hidrodinamica','Vazão, continuidade e dedução de Bernoulli',46,None),
 ('torricelli','hidrodinamica','Torricelli, alcance de jatos e bombas',47,'12.4 '),
 ('fluidos-reais','hidrodinamica','Fluidos reais e transporte de momento',49,'12.6 '),
 ('metodos','integracao','Combinar assuntos sem misturar conservações',50,None),
]
QUESTION_LESSON={**dict.fromkeys(range(1,3),'medidas'),3:'relativo',**dict.fromkeys(range(4,7),'vetores'),7:'graficos',8:'medias',9:'mu',10:'medias',11:'mu',12:'mruv',13:'mruv',14:'frenagem',15:'vertical',16:'vertical',17:'frenagem',18:'mu',19:'relativo',20:'lancamentos',21:'lancamentos',22:'lancamentos',23:'relativo',24:'circular',25:'circular',26:'circular',**dict.fromkeys(range(27,33),'newton'),33:'rampa',34:'atrito',35:'vinculos',36:'vinculos',37:'curvas',38:'curvas',39:'vinculos',40:'atrito',**dict.fromkeys(range(41,45),'trabalho'),45:'energia',46:'potencia',47:'energia',48:'potencia',49:'trabalho',50:'energia',51:'impulso',52:'impulso',53:'impulso',54:'colisoes',55:'colisoes',56:'colisoes',57:'colisoes',58:'colisoes',59:'equilibrio',60:'equilibrio',61:'equilibrio',62:'apoios',63:'apoios',64:'apoios',**dict.fromkeys(range(65,69),'orbitas'),69:'escape',70:'escape',71:'pressao',72:'pressao',73:'pascal',74:'pascal',75:'empuxo',76:'empuxo',77:'pressao',78:'empuxo',79:'bernoulli',80:'bernoulli',81:'torricelli',82:'torricelli',83:'torricelli',84:'fluidos-reais',**dict.fromkeys(range(85,91),'metodos')}
# Link each original question to the lesson teaching its actual subject.
QUESTION_LESSON.update({8:'mu',11:'mruv',13:'vertical',14:'vertical',15:'frenagem',16:'mruv',17:'mruv',18:'vertical',21:'relativo',22:'relativo',23:'lancamentos',28:'atrito',31:'atrito',32:'rampa',33:'vinculos',34:'vinculos',36:'curvas',38:'rampa',40:'curvas',42:'energia',44:'energia',45:'potencia',47:'potencia',48:'trabalho',68:'escape',69:'orbitas',74:'empuxo',76:'pressao',78:'pascal',81:'bernoulli',82:'bernoulli',84:'torricelli'})
def question_topic(n):
 return next(t for start,end,t in [(1,6,'fundamentos'),(7,26,'cinematica'),(27,58,'dinamica'),(59,64,'estatica'),(65,70,'gravitacao'),(71,78,'hidrostatica'),(79,84,'hidrodinamica'),(85,90,'integracao')] if start<=n<=end)
def build_catalog(dest):
 pages=json.loads((dest/'source-pages.json').read_text());names={id:title for id,title,_ in TOPICS}
 def position(page,marker):
  return (page,0 if marker is None else next(i for i,b in enumerate(pages[f'aula-{page}']) if b['type']=='heading' and b['text'].startswith(marker)))
 def refs_between(start,end):
  refs=[]
  for n in range(start[0],end[0]+1):
   a=start[1] if n==start[0] else 0;b=end[1] if n==end[0] else len(pages[f'aula-{n}'])
   if a<b:refs.append({'page':f'aula-{n}','start':a,'end':b})
  return refs
 lessons=[]
 for i,(slug,topic,title,n,marker) in enumerate(CORE):
  start=position(n,marker);end=position(CORE[i+1][3],CORE[i+1][4]) if i+1<len(CORE) else (52,len(pages['aula-52']))
  refs=refs_between(start,end)
  # Complements are authored in the site, not represented as source PDF pages.
  original_pages=sum((r['end']-r['start'])/max(1,len(pages[r['page']])) for r in refs)
  lessons.append({'id':'hs-mech-'+slug,'topicId':topic,'unit':names[topic],'title':title,'description':'Compreenda o modelo, acompanhe a dedução e reconheça as condições de uso.','pages':min(4,max(2,round(original_pages+1))),'estimatedPages':True,'refs':[{'page':'complemento-'+slug}]+refs})
 def add(slug,topic,title,document,first,last):
  lessons.append({'id':'hs-mech-'+slug,'topicId':topic,'unit':names[topic],'title':title,'description':'Consulta integral ao material de referência, com as condições de uso.','pages':last-first+1,'refs':[{'page':f'{document}-{n}'} for n in range(first,last+1)]})
 for slug,topic,title,first,last in [('formulario-cinematica','cinematica','Consulta: medidas, cinemática e lançamentos',54,55),('formulario-dinamica','dinamica','Consulta: forças, vínculos, energia e potência',56,57),('formulario-estatica','estatica','Consulta: impulso, centro de massa e estática',58,58),('formulario-gravitacao','gravitacao','Consulta: gravitação, órbitas e escape',59,59),('formulario-hidrostatica','hidrostatica','Consulta: pressão, empuxo e flutuação',60,60),('formulario-hidrodinamica','hidrodinamica','Consulta: escoamento, jatos e bombas',61,61),('guia','consulta','Como estudar Mecânica e conferir uma resolução',2,3),('referencias','consulta','Referências e limites dos modelos',53,53)]:add(slug,topic,title,'aula',first,last)
 add('treino','consulta','Orientações e convenções da ficha','ficha',1,2)
 for k,first,last in [(1,36,37),(2,38,39),(3,40,41)]:add('gabarito-'+str(k),'consulta',f'Gabarito de conferência · parte {k}','ficha',first,last)
 for k,first,last in [(1,74,75),(2,76,77),(3,78,78)]:add('revisao-'+str(k),'consulta',f'Formulário de revisão da ficha · parte {k}','ficha',first,last)
 lessons.sort(key=lambda l:list(names).index(l['topicId']))
 from mechanics_complements import build_complements
 complements=build_complements(CORE)
 (dest/'complements.json').write_text(json.dumps(complements,ensure_ascii=False,indent=2)+'\n')
 for lesson in lessons:
  chars=sum(sum(len(b['text']) for b in (complements|pages)[r['page']][r.get('start',0):r.get('end')]) for r in lesson['refs'])
  lesson['minutes']=max(6,round(chars/900*4))
 questions={};structural=[];current=None;category=''
 for n in range(3,36):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)\s*[-–]',b['text']) if b['type']=='heading' else None
   if q:
    number=int(q[1]);topic=question_topic(number)
    current={'id':f'hs-mech-q{number:02}','kind':'written','sourceNumber':number,'topic':names[topic],'topicId':topic,'subtopic':category,'course':'mechanics','lessonId':'hs-mech-'+QUESTION_LESSON[number],'difficulty':'easy','objective':category,'format':'Discursiva','prompt':b['text'],'reasoning':'Escolha o sistema e os eixos, explicite o modelo e confira unidades e sinais.','statement':[],'solution':[]}
    questions[number]=current
   elif b['type']=='heading':
    category=re.sub(r' - continuação$','',b['text']);structural.append(ref);continue
   elif b['text'] in ['Básica','Intermediária','Integração']:
    assert current is not None
    current['difficulty']={'Básica':'easy','Intermediária':'medium','Integração':'hard'}[b['text']]
    current['difficultyLabel']=b['text']
   assert current is not None,(n,i,b['text'])
   current['statement'].append(ref)
 current=None
 for n in range(42,74):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1}
   q=re.match(r'Questão (\d+)\s*[-–]',b['text']) if b['type']=='heading' else None
   if q:current=questions[int(q[1])]
   elif b['type']=='heading':structural.append(ref);continue
   assert current is not None
   current['solution'].append(ref)
 assert len(questions)==90 and all(q['statement'] and len(q['solution'])>=3 and q.get('difficultyLabel') for q in questions.values())
 for name,value in [('lessons',lessons),('questions',list(questions.values())),('topics',[{'id':id,'title':title,'description':description} for id,title,description in TOPICS]),('structural-headings',structural)]:
  (dest/f'{name}.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 print('Mapped',len(lessons),'lessons and',len(questions),'complete problems')
if __name__=='__main__':build_catalog(Path(__file__).resolve().parents[1]/'content/ensino-medio/mecanica')
