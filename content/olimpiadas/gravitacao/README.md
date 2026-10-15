# Gravitação — Olimpíadas

Curso baseado em `Aula_Gravitacao_TBF_IPhO.pdf` (36 páginas) e
`Ficha_Gravitacao_TBF_IPhO.pdf` (27 páginas), versionados em
`materiais/referencias`. O material é independente de preparação TBF / IPhO,
sem vínculo oficial com essas competições.

## Conteúdo e continuidade

São 17 aulas em 14 módulos, incluindo orientação, os 11 capítulos de teoria,
seis seções do formulário, reunidas em três aulas e treino/conferência. As divisões seguem as seções,
mantendo juntas as deduções que atravessam páginas: lançamento tangencial,
Binet, vetor de excentricidade, equação de Kepler, queda radial, Hohmann e marés.
Preservam-se os 11 exemplos resolvidos, hipóteses, limites de validade,
referências e convenções do problema relativo de dois corpos.

A ficha contém 20 problemas: 12 fáceis, cinco intermediários e três difíceis.
Todas as alíneas, os cinco diagramas dos enunciados, os resultados para
conferência e as soluções comentadas estão disponíveis. A solução 18 inclui
as páginas 24 e 25 completas, até a análise das conservações e da energia.

## Cobertura e apresentação

`coverage.json` registra os hashes das fontes e os 1.903 blocos originais das
60 páginas instrucionais. Apenas a capa e as duas páginas de sumário da aula
foram substituídas pela apresentação e pelo sumário navegável. Cabeçalhos e
rodapés repetidos não fazem parte do corpo. Os títulos que organizam as faixas
da ficha aparecem como metadados das questões (`structural-headings.json`).

O leitor usa o mesmo tratamento aprovado em Ondulatória: parágrafos nativos
responsivos, títulos azuis, texto serifado, resultados destacados e equações
com rolagem horizontal local. Os nove diagramas e as expressões matemáticas
preservam os vetores das fontes, compartilhados em 60 arquivos de símbolos
SVG. Não há incorporação do PDF, captura rasterizada nem imagem de página
inteira. Não foram acrescentadas visualizações interativas decorativas.

O importador reúne os fragmentos que o PDF separa ao redor de radicais em uma
mesma linha de prosa. Na questão 9, o gráfico preserva a curva e suas regiões
de recorte sem absorver a alínea (c) no desenho. Isso conserva o enunciado
nativo e evita duplicações ou inversões na ordem dos parágrafos.

## Navegação e registros

O curso está em `/trilhas/olimpiadas/cursos/olympiad-gravity`. A área de Fichas
oferece entradas independentes para `/trilhas/olimpiadas/questoes/gravitacao`
e `/trilhas/olimpiadas/questoes/ondulatoria`, com filtros, convenções, gabarito,
soluções e retorno às aulas. As questões continuam vinculadas às respectivas
aulas, sem duplicação no banco ou mudança nos identificadores de Ondulatória.

As questões são discursivas. A comparação com a solução e o registro de
acerto são explicitamente uma autoavaliação, disponível após login. Notas
digitadas são temporárias e a interface informa essa limitação. Ensino Médio,
Universidade, laboratórios e o armazenamento de progresso permanecem separados.
Cada leitor de conteúdo carrega sob demanda o material do seu próprio curso.

## Regeneração e validação

```sh
python -m pip install -r scripts/requirements-materials.txt
python scripts/import-gravity-materials.py
```

As divisões editoriais e os vínculos entre questões e aulas ficam em
`scripts/gravity_course_map.py`. A importação reutiliza as rotinas vetoriais
de `scripts/import-wave-materials.py`, sem regenerar ou alterar o conteúdo
de Ondulatória. Não edite manualmente as faixas ou os arquivos gerados.

`tests/gravity.test.ts` confere os hashes, a cobertura de cada bloco original,
todos os símbolos, as alíneas e os finais das soluções, os limites das aulas,
os endereços das fichas e o isolamento das trilhas. Execute a suíte conforme
`tests/README.md`, além de `npm run build`.

## Agrupamento e progresso

As 38 entradas publicadas foram reunidas em 17 leituras. As aulas usuais têm
uma ou duas páginas de referência; potencial efetivo, geometria/excentricidade
e síntese têm três, abaixo do limite de quatro. O guia reúne a página de
convenções e as introduções curtas da ficha, com extensão explicitamente
estimada em duas páginas de leitura.

Todos os IDs anteriores são preservados em `previousIds` como trechos de
conclusão e endereços compatíveis. O catálogo não reescreve o progresso salvo.
Uma leitura agrupada só recebe a marca de concluída quando todos os seus trechos
estão completos; o progresso parcial aparece no sumário e na aula. O percentual
do curso continua usando os trechos originais. Enunciados, soluções, IDs de
questões e autoavaliações permanecem os mesmos.

`LESSONS` em `scripts/gravity_course_map.py` registra os recortes publicados;
`GROUPS` define a organização atual. Execute `python scripts/gravity_course_map.py`
para regenerar somente os metadados, sem tocar no texto ou nos símbolos vetoriais.
