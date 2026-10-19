import { useState } from 'react'
import type { Course } from '../../app/types'
import type { HandbookBlock, HandbookLesson } from '../../app/handbook'
import { useApp } from '../../app/context'
import { blockAnchor } from '../handbook/HandbookBlocks'

export function SchoolBreadcrumbs({
  course,
  lesson,
}: {
  course: Course
  lesson: HandbookLesson
}) {
  const { navigate, openCourse } = useApp()
  return (
    <nav className="school-breadcrumbs" aria-label="Caminho da aula">
      <button onClick={() => navigate('courses', 'ensino-medio')}>
        Ensino Médio
      </button>
      <span>›</span>
      <button onClick={() => openCourse(course.id)}>{course.area}</button>
      <span>›</span>
      <button onClick={() => openCourse(course.id, lesson.topicId)}>
        {lesson.unit}
      </button>
      <span>›</span>
      <span aria-current="page">{lesson.title}</span>
    </nav>
  )
}

export function SchoolLessonNavigation({
  course,
  lesson,
  lessons,
}: {
  course: Course
  lesson: HandbookLesson
  lessons: HandbookLesson[]
}) {
  const { openCourse, openLesson, progress } = useApp()
  const [outlineOpen, setOutlineOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1051px)').matches,
  )
  const readings = lessons.filter((item) => item.topicId === lesson.topicId)
  const position = readings.findIndex((item) => item.id === lesson.id) + 1
  return (
    <>
      <button
        className="link-button"
        onClick={() => openCourse(course.id, lesson.topicId)}
      >
        ← Aulas deste tema
      </button>
      <p className="handbook-nav-label">Ensino Médio · {course.area}</p>
      <label htmlFor="school-topic">Assunto do curso</label>
      <select
        id="school-topic"
        className="select school-topic-select"
        value={lesson.topicId}
        onChange={(event) => openCourse(course.id, event.target.value)}
      >
        {course.units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.title}
          </option>
        ))}
      </select>
      <p className="school-current-position">
        <strong>
          Aula {position} de {readings.length} neste tema
        </strong>
        {lesson.chapter
          ? `Capítulo ${lesson.chapter} da apostila`
          : 'Material de consulta'}
      </p>
      <details
        className="handbook-course-outline"
        open={outlineOpen}
        onToggle={(event) => setOutlineOpen(event.currentTarget.open)}
      >
        <summary>Aulas de {lesson.unit}</summary>
        {readings.map((item, i) => (
          <button
            key={item.id}
            className={item.id === lesson.id ? 'active' : ''}
            aria-current={item.id === lesson.id ? 'page' : undefined}
            onClick={() => openLesson(item.id)}
          >
            {progress.completedLessons.includes(item.id) ? '✓' : i + 1} ·{' '}
            {item.title}
          </button>
        ))}
      </details>
    </>
  )
}

export function SchoolSections({
  blocks,
  prefix,
}: {
  blocks: HandbookBlock[]
  prefix: string
}) {
  // Examples have their own expandable cards. List the theory hierarchy here.
  const headings = blocks.filter(
    (b) => b.type === 'heading' && /^\d+\.\d+/.test(b.text),
  )
  if (!headings.length) return null
  return (
    <nav
      className="handbook-local-outline school-section-outline"
      aria-label="Seções e subseções desta aula"
    >
      <strong>Nesta aula · teoria e deduções</strong>
      {headings.map((b) => (
        <a
          key={blockAnchor(b, prefix)}
          href={'#' + blockAnchor(b, prefix)}
          className={
            /^\d+\.\d+\./.test(b.text) ? 'school-subsection' : undefined
          }
        >
          {b.text}
        </a>
      ))}
    </nav>
  )
}
