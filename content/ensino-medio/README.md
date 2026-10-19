# Materiais do Ensino Médio

A trilha reúne cinco áreas independentes. Mecânica já estava publicada e seus IDs,
textos, suplementos e 90 questões permanecem intactos. Os três cursos antes vazios
(`electricity`, `waves`, `thermo`) passam a receber os materiais correspondentes;
`optics` acrescenta Óptica sem reutilizar IDs de conteúdo retirado.

| Área nova | Temas de teoria | Leituras, incluindo consulta | Questões | Páginas de conteúdo | Diagramas | Exemplos resolvidos |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Eletricidade e eletromagnetismo | 7 | 23 | 30 | 76 | 19 | 30 |
| Ondas e oscilações | 6 | 19 | 30 | 79 | 24 | 36 |
| Óptica | 7 | 23 | 30 | 75 | 30 | 30 |
| Termologia e termodinâmica | 7 | 19 | 30 | 79 | 18 | 29 |
| Total novo | 27 | 84 | 120 | 309 | 91 | 125 |

## Organização e estudo

O catálogo apresenta área → temas → aulas. Um capítulo original corresponde a uma
leitura de 2–4 páginas, preservando deduções e exemplos na mesma aula. Guias,
referências e gabaritos ficam em Consulta e orientação; o formulário de seis
páginas de MHS/Ondas foi separado em três leituras de duas páginas por assunto.
Cada leitura tem caminho de navegação, seletor de tema, posição no tema, índice de
seções/subseções e avanço/retorno sequencial. No celular, o índice de aulas começa
recolhido. Os exemplos originais são expansíveis.

A prática fica nas fichas, separada da teoria. Cada ficha tem temas equivalentes,
subtemas originais e filtros de dificuldade: 18 fáceis, 8 intermediárias e 4
difíceis. Enunciados, figuras e subitens ficam juntos; soluções e as cinco pistas
originais são opcionais. Os vínculos indicam a aula principal e, nos problemas
integrados, outras aulas necessárias. Uma aula aponta também para os temas de
prática integrada que a utilizam, além de seu próprio tema.

As rotas preservam o tema ao recarregar, por exemplo:

- `/trilhas/ensino-medio/cursos/electricity?tema=circuitos`
- `/trilhas/ensino-medio/aulas/hs-elec-c09`
- `/trilhas/ensino-medio/questoes/eletricidade?tema=circuitos`

As fichas novas usam os slugs `eletricidade`, `mhs-ondas`, `optica` e `termologia`.
`?tema=todos` permite consultar a lista completa. Gabaritos rápidos têm links
próprios; as resoluções detalhadas pertencem a cada questão. A numeração impressa
dos PDFs foi mantida dentro do texto; o rodapé identifica as páginas físicas PDF.

## Fontes e conversão

Os oito PDFs estão em `materiais/referencias/ensino-medio/`. Foram preservados os
5.967 blocos originais de conteúdo, incluindo guias e mapas de conteúdo, equações,
condições, demonstrações, exemplos, figuras, referências, todos os enunciados e
resoluções. As oito capas e dez páginas de sumário foram substituídas pelos títulos
e pela navegação do site: 327 páginas físicas → 309 páginas de conteúdo.

Parágrafos, hierarquia de títulos e seis tabelas são HTML. Expressões matemáticas
e diagramas são fragmentos SVG isolados; nenhuma página é incorporada ou
rasterizada. Os sprites compartilham glifos por página. As regiões das figuras
foram revisadas individualmente; diagramas com várias partes ficam unidos. A
exportação preserva curvas Bézier e traçados pontilhados dos originais. Tabelas
largas e equações rolam localmente quando necessário, sem alargar a página.

Os quatro leitores são carregados sob demanda por curso. Os catálogos importam
apenas metadados. `coverage.json` registra SHA-256 das fontes e a cobertura por
página; `structural-headings.json` identifica cabeçalhos de blocos de dificuldade
substituídos pela organização das fichas. Os textos originais permanecem em
`source-pages.json`, sem cópia manual ou resumos.

Para regenerar somente estes quatro conjuntos:

```sh
python -m pip install -r scripts/requirements-materials.txt
python scripts/import-high-school-materials.py
```

O mapa pedagógico e os vínculos questão/aula ficam em
`scripts/high_school_course_map.py`; os recortes revisados em
`scripts/high_school_figures.json`. Não execute os importadores de outras trilhas
para atualizar estes conjuntos. Os PDFs não são alterados pelo importador.

## Validação

Veja `tests/README.md` para as dependências externas de teste. Execute:

```sh
PHISIFY_TEST_TOOLS=/tmp/phisify-validation /tmp/phisify-validation/node_modules/.bin/tsx --test tests/*.test.ts tests/*.test.mjs
npm run build
```

`tests/high-school.test.ts` verifica os oito hashes, cobertura exata sem duplicação,
todas as imagens/expressões, capítulos contínuos com 1–4 páginas, 120 pares de
enunciado/resolução com subitens, dificuldades e vínculos corretos, rotas por tema,
progresso isolado, busca e os componentes reais de catálogo/fichas. A suíte anterior
continua cobrindo Mecânica, Olimpíadas, Universidade, login/progresso e a função SQL
de sequência de dias. A integração não exige migrations nem altera contas salvas.
