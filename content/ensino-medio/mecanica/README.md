# Mecânica — Ensino Médio

O curso usa integralmente as partes instrucionais dos dois PDFs versionados em
`materiais/referencias`:

- `Aula_Mecanica_Ensino_Medio.pdf`: 61 páginas, incluindo capa e sumário.
- `Ficha_Mecanica_Ensino_Medio_90_Questoes.pdf`: 78 páginas, 90 questões.

A área `/trilhas/ensino-medio/cursos/mechanics` oferece Fundamentos, Cinemática,
Dinâmica, Estática, Gravitação, Hidrostática, Hidrodinâmica e Integração. Consulta
reúne orientações, referências, gabaritos e revisões. Cada tema tem sua seleção de
aulas e acesso direto à parte correspondente da ficha.

A ficha `/trilhas/ensino-medio/questoes/mecanica` abre pela escolha de tema. As
seleções usam URLs persistentes, por exemplo `?tema=cinematica`, que funcionam
com recarregamento e histórico do navegador. `?tema=todos` reúne a ficha completa.
Há 6 questões de fundamentos, 20 de cinemática, 32 de dinâmica, 6 de estática,
6 de gravitação, 8 de hidrostática, 6 de hidrodinâmica e 6 de integração. Os
subtemas originais continuam disponíveis no filtro: cinemática escalar, vetorial,
circular, forças, vínculos, energia, impulso e demais seções da ficha.

## Aulas ampliadas

São 32 aulas de desenvolvimento e 15 leituras de orientação e consulta, incluindo
formulários separados por tema. As 32 ampliações conceituais do Phisify explicam
interpretação, hipóteses, deduções e limites de validade antes do desenvolvimento
original. Elas são identificadas como acréscimos, sem atribuí-las aos PDFs.

Os 40 exemplos originais estão completos em blocos expansíveis, para que teoria
e deduções tenham prioridade na leitura. Exemplos que atravessam páginas ficam
inteiros na mesma aula. Nenhum exemplo numérico adicional foi criado. As aulas
normais mais curtas têm cerca de duas páginas de leitura; desenvolvimentos mais
longos chegam a quatro, incluindo os complementos. A interface sinaliza essa
estimativa: a paginação real depende da tela e dos exemplos abertos. As leituras
de consulta informam as páginas efetivas do material de referência.

Os enunciados, alíneas, figuras, resultados e caminhos de resolução das 90 questões
foram preservados. As dificuldades originais são 60 básicas, 24 intermediárias e
6 de integração; não se deduz a dificuldade pela posição na lista, pois ela varia
dentro de cada tema. As resoluções aparecem junto a cada problema, em blocos
fechados inicialmente. A autoavaliação continua explícita e depende do login.

## Cobertura e regeneração

`coverage.json` registra os hashes de ambos os PDFs e os 2.591 blocos de 136
páginas instrucionais. Só a capa e as duas páginas de sumário foram substituídas
pela apresentação e pela navegação do site; cabeçalhos e rodapés repetidos não
compõem o corpo do texto. `structural-headings.json` registra os títulos que
agrupavam perguntas e soluções no documento original.

O texto é nativo e responsivo. Equações e os 24 diagramas originais usam símbolos
vetoriais em 135 arquivos SVG, sem incorporar o PDF ou imagens de páginas inteiras.
As cinco equações novas destacadas usam MathML nativo, com marcação estática
validada pelo gerador contra uma lista de elementos e atributos de apresentação.
O leitor com o conteúdo integral é carregado sob demanda.

```sh
python -m pip install -r scripts/requirements-materials.txt
python scripts/import-mechanics-materials.py
```

Edite `scripts/mechanics_course_map.py` para modificar divisões e vínculos e
`scripts/mechanics_complements.py` para modificar as ampliações. Não edite os
JSONs ou SVGs gerados. O importador reutiliza o leitor existente, com um limiar
específico para separar equações destacadas cujo numerador está próximo da linha
de prosa anterior. Os demais importadores preservam seu limiar original.

Os IDs novos usam `hs-mech-`; os conteúdos antigos aposentados não são reativados.
O curso reutiliza o identificador `mechanics`, já reservado ao Ensino Médio. As
outras trilhas, seus IDs históricos e os registros salvos não são reescritos.
`tests/mechanics.test.ts` cobre cada bloco exatamente uma vez, símbolos, exemplos,
continuidade, questões, dificuldades, temas, rotas e isolamento de progresso.
Consulte `tests/README.md` para executar as regressões, além de `npm run build`.
