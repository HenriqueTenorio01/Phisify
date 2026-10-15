# Centro de Massa — Olimpíadas

Curso baseado nos PDFs versionados em `materiais/referencias`:

- `Centro_de_Massa_TBF_IPhO.pdf`: 38 páginas.
- `Ficha_Centro_de_Massa_TBF_IPhO.pdf`: 17 páginas e 14 questões autorais.

O conteúdo aparece em uma aba recolhível **Centro de Massa** no catálogo de
Olimpíadas. O curso e a ficha possuem endereços próprios e reaproveitam o leitor,
o estilo e os registros usados em Ondulatória e Gravitação.

## Tamanho e continuidade das aulas

São 18 aulas em sete módulos. A unidade de tamanho é a página do material de
referência; a leitura no site continua responsiva. As aulas usuais reúnem uma ou
duas páginas. Corpos rígidos e impacto excêntrico, pêndulo em carrinho, síntese e
formulário avançado têm três páginas, dentro do limite de quatro solicitado.

Cada capítulo reúne suas definições, deduções, hipóteses, exemplos e limites de
validade. Assim, não há aulas separadas apenas para uma fórmula ou uma subseção
curta. A divisão do formulário preserva juntas as transformações de referenciais
e suas condições de validade, mesmo quando continuam na página seguinte.

Preservam-se os oito exemplos resolvidos, os três problemas de síntese com
pistas/conferências, as referências, as dez seções do formulário e os seis
diagramas da apostila. As aulas existentes de Ondulatória e Gravitação conservam
seus identificadores, organização e registros.

## Ficha completa

`/trilhas/olimpiadas/questoes/centro-de-massa` apresenta oito questões fáceis,
quatro intermediárias e duas difíceis. Todos os enunciados, alíneas e sete
diagramas foram mantidos. Cada problema oferece sua própria pista opcional em
um bloco recolhível, antes da solução. Consultar uma pista não revela a solução
nem registra a questão como resolvida.

As soluções 13 e 14 incluem suas duas páginas completas, até as análises do
contato unilateral e do limiar de rotação com haste rígida. O PDF chama essas
resoluções de gabarito comentado; elas aparecem junto aos respectivos problemas,
evitando criar uma aula com oito páginas de respostas. Orientações e pistas
também estão reunidas em uma aula de treino com duas páginas de referência.

As questões continuam discursivas, com autoavaliação explícita após login.
Notas digitadas são temporárias e a interface informa isso. Não há correção
automática de demonstrações.

## Cobertura e reprodução

`coverage.json` registra os hashes dos PDFs e todos os 1.450 blocos originais de
52 páginas instrucionais. A capa e as duas páginas de sumário da apostila foram
substituídas pela apresentação e pelo sumário navegável; cabeçalhos e rodapés
repetidos não entram no corpo da leitura. Títulos de progressão e de agrupamento
do gabarito ficam registrados em `structural-headings.json`.

O corpo é texto nativo com ênfases e títulos. As expressões matemáticas e os
13 diagramas preservam os vetores das fontes em 52 arquivos de símbolos SVG,
sem PDF incorporado, imagem de página inteira ou rasterização. Equações longas
possuem rolagem local. Cada leitor de curso carrega seus dados sob demanda.

```sh
python -m pip install -r scripts/requirements-materials.txt
python scripts/import-center-of-mass-materials.py
```

O importador reutiliza a extração existente. As divisões e os vínculos entre
questões e aulas estão em `scripts/center_of_mass_course_map.py`. Não edite os
JSONs ou os símbolos gerados manualmente.

`tests/center-of-mass.test.ts` valida hashes, cobertura de cada bloco original,
ausência de duplicações na teoria, símbolos, tamanho das aulas, continuidade,
alíneas, pistas e finais das soluções, rotas e isolamento das trilhas. Consulte
`tests/README.md` para executar a suíte e faça também `npm run build`.

Este material se identifica como independente e não oficial; a distinção foi
preservada no curso.
