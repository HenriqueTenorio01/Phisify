# Ondulatória — Olimpíadas

Curso baseado nos dois PDFs versionados em `materiais/referencias`:

- `Aula_Ondulatoria_TBF_IPhO.pdf`: 41 páginas.
- `Ficha_Ondulatoria_TBF_IPhO.pdf`: 30 páginas, com 20 questões autorais.

São 15 módulos e 22 aulas. O curso mantém a progressão e a numeração de seções e
equações da apostila, os 12 exemplos resolvidos, as hipóteses, as extensões, as
referências, as oito seções do formulário e as 20 questões com todas as alíneas e
resoluções comentadas. As soluções 19 e 20 incluem ambas as páginas originais.

## Cobertura e apresentação

`coverage.json` registra os hashes dos PDFs e os 1.552 blocos de origem nas 68
páginas instrucionais. Só a capa e as duas páginas do sumário da apostila foram
substituídas pela apresentação e pelo sumário navegável do curso. Cabeçalhos e
rodapés repetidos não são conteúdo de aula. Os títulos de progressão da ficha são
apresentados nos metadados das questões.

`source-pages.json` contém parágrafos com texto nativo e ênfases, títulos,
proveniência e referências a expressões e diagramas vetoriais. O corpo se reorganiza
conforme a largura da tela. Não há iframe, leitor de PDF, página rasterizada ou
imagem de uma página completa. Os SVGs contêm somente expressões ou diagramas
isolados, com os contornos matemáticos compartilhados em 68 arquivos de símbolos.
Isso conserva frações, índices, matrizes, integrais e a notação original sem depender
de uma reconstrução aproximada por OCR. Há 284 blocos de equações destacadas e os
oito diagramas/gráficos originais, além das expressões inseridas no texto.

O tratamento editorial mantém a hierarquia azul, o texto serifado, as caixas
verde-petróleo e os enunciados subdivididos das apostilas. Equações longas têm
rolagem horizontal local para manter o tamanho de leitura no celular. Nenhum
conteúdo físico ou matemático foi abreviado. As adaptações são divisão em aulas,
refluxo dos parágrafos, navegação, cabeçalhos, identificação da fonte e explicação
da autoavaliação. Não foram acrescentados gráficos interativos decorativos.

As questões são discursivas: não foram convertidas em múltipla escolha. Enunciados
e soluções são abertos a todos; alunos autenticados podem marcar a própria
resolução como correta ou para revisão. Essa escolha é explicitamente uma
**autoavaliação**, reaproveitando os registros e o controle de sequência existentes.
Notas digitadas na questão são temporárias e a interface informa essa limitação.

A ficha também tem uma entrada própria na área de Fichas, em
`/trilhas/olimpiadas/questoes/ondulatoria`, ao lado da Ficha de Gravitação.
Os identificadores e os registros de progresso das questões foram preservados.

## Manutenção

As divisões editoriais e os vínculos dos exercícios ficam em
`scripts/wave_course_map.py`. A exportação é reproduzível com:

```sh
python -m pip install -r scripts/requirements-materials.txt
python scripts/import-wave-materials.py
```

O comando atualiza os JSONs e os SVGs gerados. Não modifique os SVGs ou as faixas de
blocos manualmente. O importador remove conteúdo externo a cada recorte antes de
exportar os símbolos; os arquivos não são páginas inteiras ocultas por uma janela.
Os testes em `tests/waves.test.ts` conferem os hashes das fontes, a cobertura,
todos os símbolos, as alíneas e finais das soluções, a continuidade das deduções e
o isolamento das três trilhas. Consulte `tests/README.md` para executar a suíte.

Os materiais se identificam como independentes e não oficiais. Essa distinção é
preservada na interface e nas referências do curso.

## Agrupamento e compatibilidade

As 42 entradas publicadas foram reunidas em 22 leituras: em geral uma ou duas
páginas de referência, com três páginas para modos normais e para o gabarito.
Cada dedução continua junto de seus exemplos e condições de uso. O guia reúne
as convenções da aula e as introduções curtas da ficha: sua extensão aproximada
é indicada como duas páginas de leitura, distinguindo-a da contagem de páginas
inteiras dos demais agrupamentos.

`previousIds` registra os trechos publicados de cada aula. Todos os endereços
anteriores continuam funcionando, sem criar entradas duplicadas no sumário ou
na busca. As questões mantêm seus IDs, enunciados, soluções e registros; apenas
o vínculo com a aula foi atualizado.

Nenhum progresso é reescrito ao carregar o catálogo. Trechos concluídos aparecem
como progresso parcial até que todos os trechos da aula estejam concluídos.
Os percentuais do curso continuam ponderados pelos trechos originais. Concluir
uma aula acrescenta apenas os trechos faltantes, preserva respostas e histórico
e permite que versões anteriores continuem lendo os mesmos IDs salvos.

Em `scripts/wave_course_map.py`, `LESSONS` preserva os recortes publicados e
`GROUPS` define os agrupamentos atuais. Para alterar apenas a organização, execute
`python scripts/wave_course_map.py`; não é necessário reexportar os SVGs ou o
texto das fontes. `tests/lesson-grouping.test.ts` compara os agrupamentos com os
80 recortes publicados dos dois cursos e testa endereços e progresso.
