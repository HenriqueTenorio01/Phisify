#!/usr/bin/env python3
"""Reuse the semantic handbook importer for the supplied gravitation PDFs."""
import hashlib, importlib.util, json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('handbook_import', Path(__file__).with_name('import-wave-materials.py'))
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)
reader.DEST = ROOT / 'content/olimpiadas/gravitacao'
reader.ASSETS = ROOT / 'public/gravitacao'
reader.PUBLIC_PREFIX = 'gravitacao'
reader.MERGE_INLINE_BLOCKS = True
reader.SOURCES = {'aula': 'Aula_Gravitacao_TBF_IPhO.pdf', 'ficha': 'Ficha_Gravitacao_TBF_IPhO.pdf'}
for doc in reader.DOCS.values(): doc.close()
reader.DOCS = {k: fitz.open(ROOT / 'materiais/referencias' / v) for k,v in reader.SOURCES.items()}
reader.FIGURES = {
 ('aula',9): [(214,465,385,607,'Decomposição da velocidade relativa nas bases radial e transversal, que giram com a posição.')],
 ('aula',11): [(68,117,537,350,'Potencial efetivo: círculo no mínimo, dois pontos de retorno para energia negativa e acesso ao infinito para energia não negativa.')],
 ('aula',15): [(154,407,446,613,'Elipse: foco na fonte, centro geométrico distinto do foco, apses e semieixos a e b.')],
 ('aula',23): [(190,118,411,313,'Transferência de Hohmann: dois impulsos prógrados conectam os círculos interno e externo por uma elipse tangente.')],
 ('ficha',2): [(219,484,379,594,'Questão 4: túnel ao longo de uma corda a distância R/2 do centro da esfera homogênea.')],
 ('ficha',4): [(240,226,359,326,'Questão 7: elipse com periastro d e apoastro 4d, medidos a partir da fonte no foco.')],
 ('ficha',5): [(101,251,504,406,'Questão 9: potencial efetivo normalizado em função de r/r_c, com mínimo em r/r_c = 1.')],
 ('ficha',9): [(158,332,440,416,'Questão 17: duas esferas de massas m e 2m, separação inicial d = 8R e centro de massa indicado.')],
 ('ficha',11): [(194,394,404,513,'Questão 19: posição inicial na superfície e velocidade tangencial no interior de uma esfera homogênea transparente.')],
}

if __name__ == '__main__':
 reader.DEST.mkdir(parents=True, exist_ok=True)
 reader.ASSETS.mkdir(parents=True, exist_ok=True)
 pages={}
 for key in reader.DOCS:
  for number in ([2]+list(range(5,37)) if key=='aula' else range(1,28)):
   pages[f'{key}-{number}']=reader.extract(key,number)
 sprites=reader.make_sprites()
 (reader.DEST/'source-pages.json').write_text(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n')
 (reader.DEST/'coverage.json').write_text(json.dumps({
  'sources':[{'id':k,'file':v,'sha256':hashlib.sha256((ROOT/'materiais/referencias'/v).read_bytes()).hexdigest(),'pages':len(reader.DOCS[k])} for k,v in reader.SOURCES.items()],
  'pages':reader.coverage,'vectorFragments':len(set(x['src'] for x in reader.asset_cache.values())),'spriteFiles':sprites,
 },ensure_ascii=False,indent=2)+'\n')
 from gravity_course_map import build_catalog
 build_catalog(reader.DEST)
 print('Imported',len(pages),'content pages;',sum(p['coveredBlocks'] for p in reader.coverage),'source blocks;',sprites,'SVG sprites')
