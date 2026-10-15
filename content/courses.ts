import type { Course } from '../src/app/types'

export const courses: Course[] = [
  {
    trackId: 'ensino-medio',
    id: 'mechanics',
    title: 'Fundamentos da Mecânica',
    area: 'Mecânica',
    level: 'Ensino Médio',
    tone: 'blue',
    description:
      'Do movimento às leis de Newton, com intuição, modelos e resolução de problemas.',
    units: [
      { title: 'Linguagem da Física', lessons: [] },
      { title: 'Movimento', lessons: [] },
      { title: 'Forças', lessons: [] },
    ],
  },
  {
    trackId: 'ensino-medio',
    id: 'electricity',
    title: 'Eletricidade essencial',
    area: 'Eletricidade',
    level: 'Ensino Médio',
    tone: 'green',
    description:
      'Leia circuitos e conecte tensão, corrente, resistência e potência.',
    units: [
      { title: 'Circuitos', lessons: [] },
      { title: 'Energia elétrica', lessons: [] },
    ],
  },
  {
    trackId: 'ensino-medio',
    id: 'waves',
    title: 'Ondas e oscilações',
    area: 'Ondas',
    level: 'Ensino Médio',
    tone: 'amber',
    description:
      'Visualize padrões periódicos e entenda suas grandezas fundamentais.',
    units: [{ title: 'Ondas', lessons: [] }],
  },
  {
    trackId: 'ensino-medio',
    id: 'thermo',
    title: 'Termologia na prática',
    area: 'Termologia',
    level: 'Ensino Médio',
    tone: 'blue',
    description:
      'Uma introdução clara a temperatura, calor, capacidade térmica e mudanças de fase.',
    units: [{ title: 'Calor e temperatura', lessons: [] }],
  },
]

export function courseById(id: string) {
  return courses.find((course) => course.id === id)
}
export function lessonById(id: string) {
  for (const course of courses)
    for (const unit of course.units) {
      const lesson = unit.lessons.find((item) => item.id === id)
      if (lesson) return { course, unit, data: lesson }
    }
  return null
}
