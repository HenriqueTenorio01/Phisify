import { universityCourse } from './universidade/semestre-1'
import { mechanicsCourse } from './ensino-medio/mecanica'
import { waveCourse } from './olimpiadas/ondas'
import { gravityCourse } from './olimpiadas/gravitacao'
import { centerOfMassCourse } from './olimpiadas/centro-de-massa'
import { resolveLessonId } from './lesson-compatibility'
import type { Course } from '../src/app/types'

export const courses: Course[] = [
  universityCourse,
  waveCourse,
  gravityCourse,
  centerOfMassCourse,
  mechanicsCourse,
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
  const canonical = resolveLessonId(id)
  for (const course of courses)
    for (const unit of course.units) {
      const lesson = unit.lessons.find((item) => item.id === canonical)
      if (lesson) return { course, unit, data: lesson }
    }
  return null
}
