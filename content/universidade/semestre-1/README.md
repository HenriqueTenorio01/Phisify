# Universidade · 1º semestre · Mecânica I

Integração das cinco apostilas em `materiais/referencias/universitario/semestre-1/`:

| Aula original | Assunto | Páginas PDF | Leituras no site |
| --- | --- | ---: | ---: |
| 01 | Cinemática vetorial | 53 | 16 |
| 02 | Leis de Newton | 45 | 14 |
| 03 | Aplicações da dinâmica, trabalho e energia | 54 | 17 |
| 05 | Quantidade de movimento e centro de massa | 50 | 16 |
| 06 | Momento angular, torque e estática | 47 | 16 |

A numeração fornecida é preservada. Não há PDF da Aula 04 nesta edição; a
integração não cria uma aula substituta nem renumera as aulas seguintes.

## Organização pedagógica

A entrada em **Universidade** apresenta o primeiro semestre. O semestre abre as
cinco aulas da coleção; cada aula abre suas leituras por assunto. Essa separação
impede tanto uma página com quase cinquenta páginas de texto quanto uma lista
única de dezenas de pequenos fragmentos sem contexto.

São 79 leituras: 69 de desenvolvimento e dez de orientação, notação e referências.
Os capítulos das apostilas são a unidade principal. As definições, demonstrações,
interpretações, exemplos, pausas e problemas comentados permanecem na sequência
original, sem reescrita ou complementos inventados.

Cada leitura contém entre uma e quatro páginas efetivas de referência. Só dois
capítulos de cinco páginas foram divididos, em seções completas da Aula 01:

- Capítulo 3: velocidade, tangência e rapidez; depois aceleração, regras de
  derivação e gráficos, a partir da seção 3.3.
- Capítulo 10: comparação entre observadores e Galileu; depois origens aceleradas,
  encontros e eixos girantes, a partir da seção 10.3.

Os demais capítulos permanecem inteiros. Não se faz uma aula para cada equação
ou exemplo. Os problemas finais com suas discussões continuam nas leituras da
própria apostila; não são anunciados como uma ficha separada inexistente.

## Navegação e posição

- Semestre: `/trilhas/universidade/cursos/university-mechanics-1`.
- Aula: o mesmo endereço com `?tema=aula-01`, `aula-02`, `aula-03`, `aula-05`
  ou `aula-06`.
- Leitura: `/trilhas/universidade/aulas/uni-s1-a01-c01`, por exemplo.

Há caminho de retorno ao semestre e à aula, seletor de aula, lista recolhível das
leituras da aula atual, posição “Leitura N de M”, identificação do capítulo,
seções e subseções com âncoras e indicação da seção visível. A leitura anterior e
a seguinte acompanham a ordem do material, inclusive na transição entre aulas.

A visão do semestre mostra progresso por aula e permite continuar da primeira
leitura ainda não concluída. A conclusão é registrada por leitura, com os
mecanismos existentes de autenticação e persistência; não há migração ou
reescrita dos registros anteriores.

## Conteúdo e cobertura

Os PDFs têm 249 páginas. Foram mantidas as 234 páginas instrucionais, todos os
4.533 blocos do corpo, 64 exemplos, 92 figuras, cinco tabelas de notação e os
problemas comentados. A capa e as duas páginas de sumário de cada PDF são
representadas pela apresentação e pela navegação do site; cabeçalhos e rodapés
recorrentes não são inseridos no texto.

`coverage.json` registra os hashes dos cinco arquivos e a cobertura de cada
página. Cada bloco é vinculado exatamente uma vez a uma leitura. Os títulos
originais, inclusive o de cada capítulo, são preservados; quando o título da
leitura coincide com o do capítulo, o cabeçalho da leitura o apresenta uma única
vez.

O corpo usa texto nativo, hierarquia semântica e tabelas HTML responsivas. As
fórmulas e figuras preservam os desenhos vetoriais em 229 arquivos de símbolos
SVG, sem PDF incorporado, imagem de página ou rasterização dos diagramas. O único
glifo Type 3 das fontes — a seta entre etapas do método de estudo — é transcrito
como `→`. Referências XML inválidas em metadados `data-text` de certos glifos são
removidas; seus contornos visíveis permanecem intactos.

Cada apostila é um bloco de conteúdo carregado sob demanda: ler a Aula 01 não
baixa o texto das aulas 02, 03, 05 e 06. Figuras e equações carregam os símbolos
apenas das páginas necessárias à leitura.

## Manutenção

```sh
python -m pip install -r scripts/requirements-materials.txt
python scripts/import-university-materials.py
```

O importador reutiliza o exportador vetorial existente, com extração específica
para as fontes, legendas e tabelas desta coleção. Não muda os importadores nem
os materiais das outras trilhas. `scripts/university_course_map.py` define as
aulas, as divisões e os IDs. Não edite os JSONs ou SVGs gerados manualmente.

Os novos IDs usam `uni-s1-`, e o curso pertence exclusivamente à Universidade.
Ensino Médio, Olimpíadas, laboratório, fichas, questões e compatibilidade de
progresso continuam nas estruturas existentes.

`tests/university.test.ts` verifica hashes, cobertura integral e única, símbolos,
figuras, exemplos, tabelas, tamanho, continuidade, numeração, carregamento por
aula, rotas, isolamento de progresso e a página real do semestre. Consulte
`tests/README.md` para executar a suíte e rode também `npm run build`.
