import { cloneElement, isValidElement, type ReactNode } from 'react'
import { usePreferences } from '../app/PreferencesProvider'

export type Language = 'pt-BR' | 'en-US'

const translations: Record<string, string> = {
  'Início':'Home','Trilhas':'Learning paths','Lab':'Lab','Fichas':'Practice','Desempenho':'Performance','Revisão':'Review','Buscar':'Search','Mais':'More',
  'Navegação':'Navigation','Configurações':'Settings','Abrir configurações':'Open settings','Abrir meu perfil':'Open my profile','Entrar ou criar conta':'Sign in or create an account','Entrar':'Sign in',
  'mapa de aprendizagem':'LEARNING MAP','Trilhas de Física':'Physics learning paths','Percursos organizados para construir uma base sólida, do modelo ao problema.':'Structured paths to build a solid foundation, from models to problem-solving.',
  'Meu plano':'My plan','Todos':'All','Ensino Médio':'High school','Mecânica':'Mechanics','Eletricidade':'Electricity','Ondas':'Waves','Termologia':'Thermal physics','progresso':'progress','Abrir trilha →':'Open path →','Nenhuma trilha encontrada.':'No learning paths found.','Escolha outro filtro.':'Choose another filter.',
  'estudo progressivo':'Progressive learning','trilha concluída':'path completed','unidades':'units','aulas':'lessons','Ver trilhas':'View learning paths',
  'experimentos de física':'PHYSICS EXPERIMENTS','Laboratório':'Laboratory','Escolha um fenômeno, configure as condições e observe o que acontece ao longo do tempo.':'Choose a phenomenon, configure the conditions, and observe what happens over time.','Como usar':'How to use','Abrir experimento →':'Open experiment →','← Todas as experiências':'← All experiments','experiência interativa':'interactive experiment',
  'prática orientada':'GUIDED PRACTICE','Fichas de questões':'Practice questions','Problemas selecionados para testar modelagem, interpretação e domínio dos conceitos.':'Selected problems to test modeling, interpretation, and understanding of concepts.',
  'Todas':'All','Fácil':'Easy','Média':'Medium','Difícil':'Hard','questões nesta ficha':'questions in this set',
  'visão de aprendizagem':'LEARNING OVERVIEW','Seu desempenho':'Your performance','Use os sinais abaixo para decidir onde estudar em seguida. Progresso é ferramenta de diagnóstico, não nota.':'Use the indicators below to decide what to study next. Progress is a diagnostic tool, not a grade.',
  'questões respondidas':'questions answered','acertos':'correct answers','aproveitamento':'accuracy','aulas concluídas':'lessons completed','Domínio por área':'Mastery by subject','baseado no que você respondeu':'based on your answers',
  'Próximo passo recomendado':'Recommended next step','Revise os conceitos dos problemas errados antes de avançar para uma ficha difícil.':'Review the concepts behind incorrect answers before moving on to a difficult set.','Escolha uma questão média e explique cada hipótese antes de calcular.':'Choose a medium-difficulty question and explain each assumption before calculating.',
  'Abrir revisão →':'Open review →','Atividade recente':'Recent activity','Retomar aula':'Resume lesson','aula concluída':'lesson completed','questão respondida':'question answered',
  'aprendizagem espaçada':'SPACED LEARNING','Revisão':'Review','Volte aos pontos em que seu raciocínio ainda pode ficar mais preciso.':'Return to topics where your reasoning can become more precise.','Revisar conceito':'Review concept','questões para revisitar':'questions to revisit','feedback disponível após cada resposta':'feedback available after each answer','Nenhuma revisão pendente.':'No pending review.','Responda algumas questões e os pontos que merecem atenção aparecerão aqui.':'Answer a few questions and topics that need attention will appear here.',
  'encontre seu próximo passo':'FIND YOUR NEXT STEP','Busca':'Search','Aulas, conceitos, exercícios e experiências em um só lugar.':'Lessons, concepts, exercises, and experiments in one place.',
  'Buscar por exemplo: velocidade, circuitos, ondas...':'Search for example: velocity, circuits, waves...','Comece a digitar.':'Start typing.','Experimente buscar uma grandeza, fenômeno ou tipo de problema.':'Try searching for a quantity, phenomenon, or type of problem.','Nenhum resultado encontrado.':'No results found.','Tente outra palavra ou um conceito mais geral.':'Try another word or a broader concept.','Questões':'Questions','Abrir aula →':'Open lesson →','Abrir →':'Open →',
  'Aula indisponível.':'Lesson unavailable.','Este endereço não corresponde a uma aula válida.':'This address does not match a valid lesson.',
  'A física que você':'Physics you','sente':'feel','não só lê.':'not just read.','Trilhas, exercícios e simulações para dominar os fenômenos que movem o mundo.':'Learning paths, exercises, and simulations to understand the phenomena that move the world.',
  'Continuar aula':'Continue lesson','Ver simulações':'Explore simulations','Laboratório interativo disponível':'Interactive lab available','dias de sequência':'day streak','PROGRESSO DA AULA':'LESSON PROGRESS','Trilhas de estudo':'Study paths','Continue explorando':'Keep exploring','Ver todas →':'View all →','concluídas':'completed','ABRIR →':'OPEN →','AO VIVO':'LIVE',
  'Configurações':'Settings','Idioma':'Language','O conteúdo disponível atualmente está em português do Brasil.':'Choose the language used throughout Phisify.','Português (Brasil)':'Português (Brasil)','English (United States)':'English (United States)','Geral':'General','Preferências básicas':'Basic preferences','Aparência':'Appearance','Tema e contraste':'Theme and contrast','Personalização':'Personalization','Como o Phisify se comporta':'How Phisify behaves','Privacidade e dados':'Privacy & data','O que fica armazenado':'What is stored','Acessibilidade':'Accessibility','Leitura e movimento':'Reading and motion','Conta':'Account','Seus dados de acesso':'Your account details','Notificações':'Notifications',
  'Preferências':'Preferences','Preferências gerais':'General preferences','Configurações básicas para manter o Phisify do seu jeito.':'Basic settings to make Phisify work for you.','Voltar ao perfil':'Back to profile','Dados da conta':'Account details','Nome, e-mail e segurança ficam na seção Conta.':'Name, email, and security settings are in the Account section.','Abrir conta':'Open account','Mais idiomas poderão ser adicionados quando a tradução do conteúdo estiver disponível.':'More languages may be added as content translations become available.',
  'Escolha como estudar':'Choose how to study','A mudança é aplicada imediatamente em toda a interface e fica salva neste dispositivo.':'Changes apply immediately throughout the interface and are saved on this device.','Tema':'Theme','Prévia visual antes de selecionar.':'Visual preview before selecting.','Escuro':'Dark','A identidade noturna do Phisify':'Phisify’s night look','Claro':'Light','Leitura luminosa e confortável':'Bright, comfortable reading','Sistema':'System','Acompanha seu dispositivo':'Follows your device','Contraste':'Contrast','Aumenta a legibilidade de textos e limites dos controles.':'Improves text readability and control boundaries.','Padrão':'Default','Alto contraste':'High contrast',
  'Seu ritmo, suas escolhas':'Your pace, your choices','Ajustes de interface que não alteram seu progresso ou os conteúdos de Física.':'Interface settings that do not change your progress or Physics content.','Densidade da interface':'Interface density','Escolha entre mais respiro ou mais informação na tela.':'Choose more spacing or more information on screen.','Confortável':'Comfortable','Compacta':'Compact','Animações':'Animations','Reduz movimentos e transições para uma navegação mais calma.':'Reduces motion and transitions for a calmer experience.','Reduzir animações':'Reduce animations','Efeitos visuais':'Visual effects','Controla brilhos, desfoques e elementos decorativos da interface.':'Controls glows, blur, and decorative interface elements.','Reduzir efeitos visuais':'Reduce visual effects','Essas preferências são locais e não alteram as simulações ou os resultados dos exercícios.':'These preferences are stored locally and do not change simulations or exercise results.',
  'Você sabe o que fica salvo':'Know what is saved','Transparência sobre os dados usados para manter sua experiência no Phisify.':'Transparency about the data used to provide your Phisify experience.','Progresso de estudos':'Study progress','Em breve':'Coming soon',
  'Mais conforto para aprender':'More comfort for learning','Ajustes visuais e de movimento aplicados imediatamente em toda a plataforma.':'Visual and motion settings applied immediately across the platform.','Tamanho da interface':'Interface text size','Aumenta textos e medidas base para facilitar a leitura.':'Increases text and base sizing for easier reading.','Aumentado':'Large','Conta Phisify':'Phisify account','Ajuste sua experiência de estudo, privacidade e acessibilidade.':'Customize your study experience, privacy, and accessibility.',
  'Data indisponível':'Date unavailable','Você precisa preencher seu nome.':'Please enter your name.','Perfil atualizado com sucesso.':'Profile updated successfully.','Não foi possível atualizar seu perfil.':'Could not update your profile.','Preferência salva neste dispositivo.':'Preference saved on this device.',
  'Lançamento oblíquo':'Projectile motion','Interferência de ondas':'Wave interference','Circuito resistivo':'Resistive circuit','Acompanhe uma trajetória real ao longo do tempo e compare alcance, altura, velocidade e componentes.':'Follow a trajectory over time and compare range, height, velocity, and components.','Veja duas ondas se propagarem, somarem-se e mudarem de resultado conforme a fase relativa.':'Watch two waves propagate, combine, and change based on their relative phase.','Observe o fluxo convencional de carga e relacione tensão, resistência, corrente e potência.':'Observe conventional current flow and relate voltage, resistance, current, and power.','play · pausa · vetores · leitura em tempo real':'play · pause · vectors · real-time readings','play · superposição · fase · onda resultante':'play · superposition · phase · resultant wave','play · fluxo de carga · valores medidos':'play · current flow · measured values',
  'Fundamentos da Mecânica':'Fundamentals of Mechanics','Linguagem da Física':'The Language of Physics','Grandezas e unidades':'Physical Quantities and Units','Como medir e comparar fenômenos':'How to measure and compare phenomena','Leitura de gráficos':'Reading Graphs','O que uma curva conta sobre o movimento':'What a curve tells us about motion','Movimento':'Motion','Movimento uniforme':'Uniform Motion','Quando a velocidade não muda':'When velocity does not change','Movimento variado':'Accelerated Motion','Aceleração como mudança da velocidade':'Acceleration as a change in velocity','Queda livre':'Free Fall','Da aceleração à equação do movimento':'From acceleration to the equation of motion','Forças':'Forces','As leis de Newton':'Newton’s Laws','Por que o movimento muda':'Why motion changes','Movimento circular':'Circular Motion','Aceleração em uma trajetória curva':'Acceleration along a curved path',
  'Eletricidade essencial':'Essential Electricity','Circuitos':'Circuits','Lei de Ohm':'Ohm’s Law','A relação entre tensão, corrente e resistência':'The relationship between voltage, current, and resistance','Circuitos em série':'Series Circuits','Como os componentes compartilham a corrente':'How components share current','Energia elétrica':'Electrical Energy','Potência elétrica':'Electrical Power','Energia transferida por unidade de tempo':'Energy transferred per unit time',
  'Ondas e oscilações':'Waves and Oscillations','Velocidade da onda':'Wave Speed','Como comprimento de onda e frequência determinam a rapidez de repetição de um padrão.':'How wavelength and frequency determine the rate at which a pattern repeats.',
  'Termologia na prática':'Thermal Physics in Practice','Calor sensível':'Sensible Heat','Como a energia altera a temperatura':'How energy changes temperature','Mudanças de fase':'Phase Changes','Energia sem variar a temperatura':'Energy transfer without a temperature change',
  'Mecânica · Movimento variado':'Mechanics · Accelerated motion','Como um corpo cai quando a única força relevante é a gravidade.':'How an object falls when gravity is the only relevant force.',
  'Em queda livre ideal, desprezamos a resistência do ar. Perto da superfície da Terra, a aceleração é aproximadamente constante e aponta para baixo. Isso significa que a velocidade muda na mesma proporção a cada segundo.':'In ideal free fall, air resistance is neglected. Near Earth’s surface, acceleration is approximately constant and points downward. This means velocity changes by the same amount each second.',
  'O objeto não “ganha uma velocidade fixa”; ele ganha aproximadamente 9,8 m/s de velocidade vertical a cada segundo.':'The object does not “gain a fixed velocity”; its vertical velocity increases by approximately 9.8 m/s each second.',
  'aceleração constante':'constant acceleration','velocidade após o tempo t':'velocity after time t','posição vertical, adotando para baixo como positivo':'vertical position, taking downward as positive',
  'Como a energia transferida altera a temperatura de um corpo sem mudar seu estado físico.':'How transferred energy changes an object’s temperature without changing its physical state.',
  'Uma onda transporta energia e informação por meio de uma perturbação.':'A wave transports energy and information through a disturbance.',
  'Física':'Physics','Aula':'Lesson','Aulas':'Lessons','questões':'questions','questão':'question','unidade':'unit','unidades':'units','progresso':'progress','concluída':'completed',
  'Velocidade':'Velocity','aceleração':'acceleration','Força':'Force','Energia':'Energy','Temperatura':'Temperature','Corrente':'Current','Tensão':'Voltage','Resistência':'Resistance','Comprimento de onda':'Wavelength','Frequência':'Frequency',
}

export function translate(text: string, language: Language): string {
  if (language === 'pt-BR') return text
  return translations[text] ?? text
}

function localizeNode(node: ReactNode, language: Language): ReactNode {
  if (typeof node === 'string') return translate(node, language)
  if (typeof node === 'number' || node == null || typeof node === 'boolean') return node
  if (Array.isArray(node)) return node.map((child) => localizeNode(child, language))
  if (!isValidElement<{ children?: ReactNode; placeholder?: string; title?: string; 'aria-label'?: string; alt?: string }>(node)) return node
  const props = node.props
  const next: Record<string, unknown> = {}
  if (props.children !== undefined) next.children = localizeNode(props.children, language)
  for (const key of ['placeholder', 'title', 'aria-label', 'alt'] as const) {
    const value = props[key]
    if (typeof value === 'string') next[key] = translate(value, language)
  }
  return cloneElement(node, next)
}

export function Localize({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences()
  return <>{localizeNode(children, preferences.language)}</>
}

export function useTranslation() {
  const { preferences, updatePreference } = usePreferences()
  return {
    language: preferences.language,
    t: (text: string) => translate(text, preferences.language),
    setLanguage: (language: Language) => updatePreference('language', language),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(preferences.language, options).format(value),
    formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(preferences.language, options ?? { dateStyle: 'medium' }).format(new Date(value)),
  }
}
