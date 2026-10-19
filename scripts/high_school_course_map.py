"""Pedagogical map for the four source collections; existing Mechanics is untouched."""
import json,math,re
CONFIG={
 'eletricidade':{
 'id':'electricity','prefix':'hs-elec','title':'Eletricidade e eletromagnetismo','area':'Eletricidade','tone':'green',
 'topics':[
 ('eletrostatica','Eletrostática','Cargas, campos, potencial, condutores e capacitores.'),
 ('corrente-energia','Corrente e energia','Materiais, resistência, potência e associações de resistores.'),
 ('circuitos','Circuitos elétricos','Kirchhoff, instrumentos, fontes reais e transitórios RC.'),
 ('magnetismo','Magnetismo','Fontes do campo magnético, forças e trajetórias de cargas.'),
 ('inducao','Indução e corrente alternada','Faraday, Lenz, indutância, máquinas, transformadores e transmissão.'),
 ('ondas-eletromagneticas','Ondas eletromagnéticas','Propagação dos campos, espectro e interação com a matéria.'),
 ('integracao','Integração de modelos','Escolha dos sistemas, regimes e balanços de energia.')],
 'starts':[6,8,10,12,14,16,18,20,22,25,27,29,31,33,35,37,40,43],
 'groups':['eletrostatica']*5+['corrente-energia']*3+['circuitos']*3+['magnetismo']*2+['inducao']*3+['ondas-eletromagneticas','integracao'],
 'reference':45,'intro':[2],'answers':20,'solutions':23,
 'question_chapters':[1,1,2,3,4,5,6,6,8,7,9,10,12,13,13,14,16,17,2,5,8,9,10,13,15,16,11,9,14,18],
 'related':{24:[3],25:[16],27:[5,7],28:[8],29:[7,13],30:[1,2,3]},
 },
 'mhs-ondas':{
 'id':'waves','prefix':'hs-mhs','title':'Ondas e oscilações','area':'Ondas','tone':'amber',
 'topics':[
 ('mhs','Movimento harmônico simples','Fase, cinemática, molas, energia, pêndulos e ressonância.'),
 ('propagacao','Propagação e fenômenos ondulatórios','O que se propaga, função de onda, cordas, reflexão e refração.'),
 ('interferencia','Superposição e interferência','Fase relativa, diferença de caminho, composição e batimentos.'),
 ('cordas','Ondas estacionárias e cordas','Nós, ventres, modos permitidos e harmônicos.'),
 ('acustica','Acústica','Som, intensidade, decibéis, tubos sonoros e Doppler.'),
 ('integracao','Problemas integrados','Oscilações iniciadas por colisões, vínculos e ressonâncias combinadas.')],
 'starts':[6,8,11,15,18,21,24,28,31,35,39],
 'groups':['mhs']*4+['propagacao']*2+['interferencia','cordas']+['acustica']*2+['integracao'],
 'reference':41,'intro':[2,3],'answers':20,'solutions':23,
 'question_chapters':[1,2,2,3,3,3,4,4,5,5,5,6,6,6,6,7,8,9,2,2,3,7,7,9,10,10,11,11,11,11],
 'related':{27:[3],28:[3],29:[8,10],30:[9,10]},
 'formulas':[(42,43,'MHS, molas e pêndulo'),(44,45,'Propagação, interferência e batimentos'),(46,47,'Cordas, tubos, som e Doppler')],
 },
 'optica':{
 'id':'optics','prefix':'hs-opt','title':'Óptica','area':'Óptica','tone':'green',
 'topics':[
 ('luz-cores','Luz e cores','Propagação, fontes, sombras, absorção e filtros.'),
 ('espelhos','Reflexão e espelhos','Reflexão, imagens, espelhos planos e esféricos.'),
 ('refracao','Refração','Snell, reflexão total, dioptros, lâminas, prismas e dispersão.'),
 ('lentes','Lentes, instrumentos e visão','Lentes delgadas, associações, projeção, instrumentos e olho humano.'),
 ('optica-ondulatoria','Óptica ondulatória','Fermat, interferência, filmes finos, difração, resolução e polarização.'),
 ('energia-luz','Energia e medidas da luz','Irradiância, fotometria e interação da luz com a matéria.'),
 ('integracao','Aplicações integradas','Escolha dos modelos e análise de sistemas com meios sucessivos.')],
 'starts':[6,8,10,12,14,16,18,20,22,24,26,28,30,32,35,37,39,41],
 'groups':['luz-cores']*2+['espelhos']*3+['refracao']*3+['lentes']*4+['optica-ondulatoria']*4+['energia-luz','integracao'],
 'reference':43,'intro':[2],'answers':21,'solutions':24,
 'question_chapters':[1,1,2,3,3,4,5,6,6,7,7,8,9,9,10,12,14,16,5,9,11,15,13,14,17,16,10,10,18,14],
 'related':{20:[7],27:[9],28:[9],29:[6,7,9],30:[7]},
 },
 'termologia':{
 'id':'thermo','prefix':'hs-term','title':'Termologia e termodinâmica','area':'Termologia','tone':'blue',
 'topics':[
 ('temperatura','Temperatura e dilatação','Equilíbrio térmico, escalas, dimensões e dilatação aparente.'),
 ('calorimetria','Calor e mudanças de fase','Calor sensível e latente, estados da matéria, vapor e balanços térmicos.'),
 ('transferencia','Transferência de calor','Condução, convecção, radiação, isolamento e potência.'),
 ('gases','Gases e teoria cinética','Leis macroscópicas, misturas e interpretação microscópica.'),
 ('primeira-lei','Primeira lei e transformações','Sistemas, trabalho, energia interna e processos dos gases.'),
 ('maquinas','Máquinas, segunda lei e entropia','Ciclos, irreversibilidade, Carnot, refrigeração e motores.'),
 ('integracao','Resolução integrada','Etapas, vínculos e escolha dos balanços adequados.')],
 'starts':[6,8,11,14,17,20,23,26,29,32,36,38,41,45],
 'groups':['temperatura']*2+['calorimetria']*3+['transferencia']+['gases']*2+['primeira-lei']*2+['maquinas']*3+['integracao'],
 'reference':47,'intro':[2,3],'answers':20,'solutions':23,
 'question_chapters':[1,1,2,2,3,4,5,5,6,6,7,7,8,9,9,10,11,13,5,5,6,4,7,10,12,13,14,10,11,13],
 'related':{18:[12],20:[4],24:[9],27:[3,4,5],28:[7,9],29:[9,10],30:[10,11,12]},
 },
}
CONSULTA=('consulta','Consulta e orientação','Como estudar, convenções, referências e gabaritos de conferência.')

def build_catalog(collection,dest):
 cfg=CONFIG[collection];pages=json.loads((dest/'source-pages.json').read_text())
 topics=cfg['topics']+[CONSULTA];names={t[0]:t[1] for t in topics};lessons=[]
 def add(slug,topic,title,document,first,last,description=None,chapter=None):
  refs=[{'page':f'{document}-{n}'} for n in range(first,last+1)]
  chars=sum(sum(len(b['text']) for b in pages[r['page']]) for r in refs)
  lesson={'id':cfg['prefix']+'-'+slug,'topicId':topic,'unit':names[topic],'title':title,'description':description or 'Texto integral da referência, com as convenções e condições de uso.','pages':last-first+1,'minutes':max(5,round(chars/900*4)),'refs':refs}
  if chapter:lesson['chapter']=chapter
  lessons.append(lesson)
  return lesson
 for i,(start,topic) in enumerate(zip(cfg['starts'],cfg['groups'])):
  end=(cfg['starts'][i+1] if i+1<len(cfg['starts']) else cfg['reference'])-1
  title=next(b['text'] for b in pages[f'aula-{start}'] if b['type']=='heading' and b['level']==2)
  sections=[re.sub(r'^\d+\.\d+\s+','',b['text']) for n in range(start,end+1) for b in pages[f'aula-{n}'] if b['type']=='heading' and b['level']==3 and not b.get('boxed')]
  add(f'c{i+1:02}',''+topic,title,'aula',start,end,' · '.join(sections[:3]) or 'Conceitos, deduções e exemplos resolvidos do capítulo.',i+1)
 chapters={l['chapter']:l for l in lessons}
 add('guia','consulta','Como estudar: roteiro, notação e hipóteses','aula',cfg['intro'][0],cfg['intro'][-1])
 for k,(first,last,title) in enumerate(cfg.get('formulas',[]),1):add(f'formulario-{k}','consulta','Formulário: '+title,'aula',first,last)
 add('referencias','consulta','Referências e alcance dos modelos','aula',cfg['reference'],cfg['reference'])
 add('treino','consulta','Como usar a ficha: treino e convenções','ficha',2,2)
 for k,(first,last) in enumerate([(cfg['answers'],cfg['answers']+1),(cfg['answers']+2,cfg['solutions']-1)],1):
  add(f'gabarito-{k}','consulta',f'Gabarito de conferência · parte {k}','ficha',first,last)
 questions={};structural=[];current=None;difficulty=None
 for n in range(3,cfg['answers']):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1};t=b['text']
   if re.match(r'^Bloco [123]\s*[-–]',t):
    difficulty='easy' if 'fáceis' in t else 'medium' if 'intermediárias' in t else 'hard';structural.append(ref);continue
   match=re.match(r'^Questão (\d+)\s*[-–]',t) if b['type']=='heading' else None
   if match:
    number=int(match[1]);lesson=chapters[cfg['question_chapters'][number-1]];topic=lesson['topicId']
    assert number not in questions,(collection,number,'duplicate question')
    current={'id':f'{cfg["prefix"]}-q{number:02}','kind':'written','sourceNumber':number,'topic':names[topic],'topicId':topic,'course':cfg['id'],'lessonId':lesson['id'],'difficulty':difficulty,'difficultyLabel':{'easy':'Fácil','medium':'Intermediária','hard':'Difícil'}[difficulty],'objective':'','format':'Discursiva','prompt':t,'reasoning':'Declare o modelo e suas hipóteses; confira unidades, sinais e interpretação do resultado.','statement':[],'solution':[]}
    related=[chapters[c]['id'] for c in cfg.get('related',{}).get(number,[]) if chapters[c]['id']!=lesson['id']]
    if related:current['relatedLessonIds']=related
    questions[number]=current
   assert current is not None,(collection,n,i,t)
   if not current['objective'] and not match:
    current['objective']=t;current['subtopic']=t
   if t.startswith(('Roteiro de raciocínio:','Roteiro:')):current.setdefault('hints',[]).append(ref)
   else:current['statement'].append(ref)
 current=None
 for n in range(cfg['solutions'],max(int(k.split('-')[1]) for k in pages if k.startswith('ficha-'))+1):
  for i,b in enumerate(pages[f'ficha-{n}']):
   ref={'page':f'ficha-{n}','start':i,'end':i+1};t=b['text']
   match=re.match(r'^Questão (\d+)\s*[-–]',t) if b['type']=='heading' else None
   if match:current=questions[int(match[1])]
   elif current is None:structural.append(ref);continue
   current['solution'].append(ref)
 assert len(questions)==30 and all(q['objective'] and len(q['statement'])>=3 and len(q['solution'])>=3 for q in questions.values()),collection
 assert collections_count(questions)=={'easy':18,'medium':8,'hard':4},collection
 for name,value in [('lessons',lessons),('questions',list(questions.values())),('topics',[{'id':id,'title':title,'description':description} for id,title,description in topics]),('structural-headings',structural)]:
  (dest/f'{name}.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 print('Mapped',collection,len(lessons),'readings and',len(questions),'complete problems',flush=True)

def collections_count(questions):
 from collections import Counter
 return dict(Counter(q['difficulty'] for q in questions.values()))
