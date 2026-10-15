#!/usr/bin/env python3
"""Import the supplied center-of-mass handbooks using the existing vector reader."""
import hashlib, importlib.util, json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('handbook_import', Path(__file__).with_name('import-wave-materials.py'))
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)
reader.DEST = ROOT / 'content/olimpiadas/centro-de-massa'
reader.ASSETS = ROOT / 'public/centro-de-massa'
reader.PUBLIC_PREFIX = 'centro-de-massa'
reader.MERGE_INLINE_BLOCKS = True
reader.SOURCES = {'aula': 'Centro_de_Massa_TBF_IPhO.pdf', 'ficha': 'Ficha_Centro_de_Massa_TBF_IPhO.pdf'}
for doc in reader.DOCS.values(): doc.close()
reader.DOCS = {k: fitz.open(ROOT / 'materiais/referencias' / v) for k,v in reader.SOURCES.items()}
reader.FIGURES = {
 ('aula',6): [(202,128,391,239,'Lâmina semicircular com densidade radial: eixos, centro de massa e elemento em coordenadas polares.')],
 ('aula',14): [(214,374,384,501,'Impacto excêntrico em uma barra livre: braço b, impulso J e origem no centro de massa da barra.')],
 ('aula',17): [(388,686,511,787,'Binária circular: duas órbitas baricêntricas, massas m₁ e m₂, separações a₁ e a₂ e centro de massa C.')],
 ('aula',20): [(198,313,397,423,'Cunha livre: coordenada horizontal X do suporte e deslocamento s do bloco ao longo da face inclinada.')],
 ('aula',22): [(220,264,377,398,'Pêndulo em carrinho: pivô móvel, ângulo θ com a vertical e translação horizontal X.')],
 ('aula',25): [(220,312,378,408,'Rolamento em plataforma móvel: velocidades absolutas do corpo e da plataforma, rotação e contato sem deslizamento.')],
 ('ficha',1): [(240,576,357,691,'Questão 2: lâmina em L com dois retângulos de mesma densidade superficial e comprimentos indicados em função de a.')],
 ('ficha',2): [(176,271,424,351,'Questão 3: barra entre 0 e L com densidade linear crescente para a direita.')],
 ('ficha',4): [(248,532,350,637,'Questão 8: disco preso pela borda em O, centro de massa C, raio a e ângulo θ com a vertical descendente.')],
 ('ficha',5): [(248,282,351,390,'Questão 9: lâmina triangular x ≥ 0, y ≥ 0, x + y ≤ a e faixa vertical usada na integração.')],
 ('ficha',6): [(232,607,365,693,'Questão 12: partícula de massa M/4 atinge uma barra de massa M e comprimento ℓ a distância ℓ/4 de seu centro de massa.')],
 ('ficha',7): [(217,326,378,465,'Questão 13: pista circular em carrinho livre, partícula na face interna, raio a e velocidade tangencial relativa v₀.')],
 ('ficha',8): [(246,340,352,428,'Questão 14: projétil de massa µ atinge a massa m de um pêndulo com haste rígida, pivô no carrinho e ângulo inicial θ₀.')],
}

if __name__ == '__main__':
 reader.DEST.mkdir(parents=True, exist_ok=True)
 reader.ASSETS.mkdir(parents=True, exist_ok=True)
 pages={}
 for key in reader.DOCS:
  for number in ([2]+list(range(5,39)) if key=='aula' else range(1,18)):
   pages[f'{key}-{number}']=reader.extract(key,number)
 sprites=reader.make_sprites()
 (reader.DEST/'source-pages.json').write_text(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n')
 (reader.DEST/'coverage.json').write_text(json.dumps({
  'sources':[{'id':k,'file':v,'sha256':hashlib.sha256((ROOT/'materiais/referencias'/v).read_bytes()).hexdigest(),'pages':len(reader.DOCS[k])} for k,v in reader.SOURCES.items()],
  'pages':reader.coverage,'vectorFragments':len(set(x['src'] for x in reader.asset_cache.values())),'spriteFiles':sprites,
 },ensure_ascii=False,indent=2)+'\n')
 from center_of_mass_course_map import build_catalog
 build_catalog(reader.DEST)
 print('Imported',len(pages),'content pages;',sum(p['coveredBlocks'] for p in reader.coverage),'source blocks;',sprites,'SVG sprites')
