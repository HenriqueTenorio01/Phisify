import type { Course } from '../src/app/types'

export const courses: Course[] = [
  {
    id: 'mechanics', title: 'Fundamentos da Mecânica', area: 'Mecânica', level: 'Ensino Médio', tone: 'blue',
    description: 'Do movimento às leis de Newton, com intuição, modelos e resolução de problemas.',
    units: [
      { title: 'Linguagem da Física', lessons: [
        { id: 'lesson-units', title: 'Grandezas e unidades', description: 'Como medir e comparar fenômenos', type: 'Aula', minutes: 8 },
        { id: 'lesson-graphs', title: 'Leitura de gráficos', description: 'O que uma curva conta sobre o movimento', type: 'Aula', minutes: 10 },
      ] },
      { title: 'Movimento', lessons: [
        { id: 'lesson-uniform', title: 'Movimento uniforme', description: 'Quando a velocidade não muda', type: 'Aula', minutes: 11 },
        { id: 'lesson-varied', title: 'Movimento variado', description: 'Aceleração como mudança da velocidade', type: 'Aula', minutes: 13 },
        { id: 'lesson-free-fall', title: 'Queda livre', description: 'Da aceleração à equação do movimento', type: 'Aula', minutes: 12 },
      ] },
      { title: 'Forças', lessons: [
        { id: 'lesson-newton', title: 'As leis de Newton', description: 'Por que o movimento muda', type: 'Aula', minutes: 15 },
        { id: 'lesson-circular', title: 'Movimento circular', description: 'Aceleração em uma trajetória curva', type: 'Aula', minutes: 14 },
      ] },
    ],
  },
  {
    id: 'electricity', title: 'Eletricidade essencial', area: 'Eletricidade', level: 'Ensino Médio', tone: 'green',
    description: 'Leia circuitos e conecte tensão, corrente, resistência e potência.',
    units: [
      { title: 'Circuitos', lessons: [
        { id: 'lesson-ohm', title: 'Lei de Ohm', description: 'A relação entre tensão, corrente e resistência', type: 'Aula', minutes: 12 },
        { id: 'lesson-circuits', title: 'Circuitos em série', description: 'Como os componentes compartilham a corrente', type: 'Aula', minutes: 14 },
      ] },
      { title: 'Energia elétrica', lessons: [{ id: 'lesson-power', title: 'Potência elétrica', description: 'Energia transferida por unidade de tempo', type: 'Aula', minutes: 11 }] },
    ],
  },
  {
    id: 'waves', title: 'Ondas e oscilações', area: 'Ondas', level: 'Ensino Médio', tone: 'amber',
    description: 'Visualize padrões periódicos e entenda suas grandezas fundamentais.',
    units: [
      { title: 'Ondas', lessons: [
        { id: 'lesson-wave-speed', title: 'Velocidade da onda', description: 'Como λ e f determinam a velocidade', type: 'Aula', minutes: 12 },
        { id: 'lesson-interference', title: 'Interferência', description: 'Quando ondas se somam', type: 'Aula', minutes: 15 },
      ] },
    ],
  },
  {
    id: 'thermo', title: 'Termologia na prática', area: 'Termologia', level: 'Ensino Médio', tone: 'blue',
    description: 'Uma introdução clara a temperatura, calor, capacidade térmica e mudanças de fase.',
    units: [{ title: 'Calor e temperatura', lessons: [
      { id: 'lesson-heat', title: 'Calor sensível', description: 'Como a energia altera a temperatura', type: 'Aula', minutes: 12 },
      { id: 'lesson-phase', title: 'Mudanças de fase', description: 'Energia sem variar a temperatura', type: 'Aula', minutes: 14 },
    ] }],
  },
]

export function courseById(id: string) { return courses.find((course) => course.id === id) ?? courses[0] }
export function lessonById(id: string) {
  for (const course of courses) for (const unit of course.units) {
    const lesson = unit.lessons.find((item) => item.id === id)
    if (lesson) return { course, unit, data: lesson }
  }
  return null
}
