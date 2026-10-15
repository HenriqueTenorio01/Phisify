#!/usr/bin/env python3
"""Reproduce the school Mechanics handbooks as reflowing text and vector math."""
import hashlib, importlib.util, json
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('handbook_import',Path(__file__).with_name('import-wave-materials.py'))
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
reader.DEST=ROOT/'content/ensino-medio/mecanica';reader.ASSETS=ROOT/'public/mecanica-em';reader.PUBLIC_PREFIX='mecanica-em';reader.MERGE_INLINE_BLOCKS=True;reader.DISPLAY_LINE_GAP=6
reader.SOURCES={'aula':'Aula_Mecanica_Ensino_Medio.pdf','ficha':'Ficha_Mecanica_Ensino_Medio_90_Questoes.pdf'}
for doc in reader.DOCS.values():doc.close()
reader.DOCS={k:fitz.open(ROOT/'materiais/referencias'/v) for k,v in reader.SOURCES.items()}
reader.FIGURES={
 ('aula',7):[(222,662,375,787,'Componentes cartesianas de um vetor e ângulo de projeção.')],
 ('aula',11):[(158,615,450,737,'Gráfico velocidade × tempo: a área orientada representa o deslocamento.')],
 ('aula',13):[(106,230,500,401,'Altura em função do tempo no lançamento vertical: subida, ponto mais alto e retorno.')],
 ('aula',15):[(194,253,405,382,'Lançamento oblíquo: decomposição da velocidade e trajetória parabólica.')],
 ('aula',17):[(165,686,425,791,'Movimento circular: velocidade tangente e aceleração dirigida ao centro.')],
 ('aula',20):[(228,197,390,320,'Diagrama de forças em um bloco apoiado: peso, normal e forças horizontais.')],
 ('aula',22):[(200,345,402,452,'Bloco em plano inclinado: eixos tangencial e normal ao plano.')],
 ('aula',27):[(118,135,492,246,'Trabalho como área sob o gráfico força × posição.')],
 ('aula',33):[(190,287,418,411,'Pessoa caminhando sobre uma balsa: deslocamentos medidos em relação à margem.')],
 ('aula',35):[(208,65,405,174,'Viga apoiada com carga: forças e distâncias para o cálculo dos torques.')],
 ('aula',38):[(138,358,451,490,'Órbita circular: distância medida do centro do planeta, velocidade e força gravitacional.')],
 ('aula',41):[(150,675,441,792,'Coluna de fluido em equilíbrio: forças de pressão nas faces e peso do fluido.')],
 ('aula',42):[(135,672,462,792,'Vasos comunicantes: pressões em pontos de uma mesma horizontal do fluido conectado.')],
 ('aula',45):[(160,450,438,558,'Corpo flutuante: empuxo, peso e fração do volume submerso.')],
 ('aula',46):[(199,530,399,619,'Escoamento em um tubo: seções de áreas diferentes e respectivas velocidades médias.')],
 ('aula',48):[(205,294,397,440,'Reservatório com orifício: profundidade interna e queda externa do jato.')],
 ('ficha',4):[(246,158,354,244,'Questão 4: deslocamentos perpendiculares e vetor resultante.')],
 ('ficha',5):[(174,154,438,273,'Questão 7: gráfico da posição em função do tempo.')],
 ('ficha',6):[(179,527,433,635,'Questão 12: gráfico da velocidade em função do tempo.')],
 ('ficha',10):[(214,350,374,423,'Questão 22: lançamento oblíquo e altura máxima.')],
 ('ficha',13):[(239,526,359,622,'Questão 33: bloco em um plano inclinado com ângulo indicado.')],
 ('ficha',25):[(214,166,389,250,'Questão 62: viga apoiada e posição da carga.')],
 ('ficha',30):[(226,193,372,302,'Questão 77: tubo em U com água e óleo.')],
 ('ficha',32):[(223,397,378,505,'Questão 82: tanque com orifício lateral e trajetória do jato.')],
}
if __name__=='__main__':
 reader.DEST.mkdir(parents=True,exist_ok=True);reader.ASSETS.mkdir(parents=True,exist_ok=True)
 pages={}
 for key in reader.DOCS:
  for n in ([2,3]+list(range(6,62)) if key=='aula' else range(1,79)):
   pages[f'{key}-{n}']=reader.extract(key,n)
   if key=='ficha':
    for block in pages[f'{key}-{n}']:
     if block['type']=='figure':
      import re
      block['text']=re.sub(r'^Questão \d+: ', '', block['text'])
      block['text']=block['text'][0].upper()+block['text'][1:]
 sprites=reader.make_sprites()
 (reader.DEST/'source-pages.json').write_text(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n')
 (reader.DEST/'coverage.json').write_text(json.dumps({'sources':[{'id':k,'file':v,'sha256':hashlib.sha256((ROOT/'materiais/referencias'/v).read_bytes()).hexdigest(),'pages':len(reader.DOCS[k])} for k,v in reader.SOURCES.items()],'pages':reader.coverage,'vectorFragments':len(set(x['src'] for x in reader.asset_cache.values())),'spriteFiles':sprites},ensure_ascii=False,indent=2)+'\n')
 from mechanics_course_map import build_catalog
 build_catalog(reader.DEST)
 print('Imported',len(pages),'instructional pages;',sprites,'SVG sprites')
