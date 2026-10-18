import { useEffect, useState } from 'react'
import type { Course } from '../../app/types'
import type { HandbookBlock, HandbookLesson } from '../../app/handbook'
import { useApp } from '../../app/context'
import { blockAnchor } from '../handbook/HandbookBlocks'

export function UniversityBreadcrumbs({
  course,
  lesson,
}: {
  course: Course
  lesson: HandbookLesson
}) {
  const { navigate, openCourse } = useApp()
  return (
    <nav className="university-breadcrumbs" aria-label="Caminho da leitura">
      <button onClick={() => navigate('courses', 'universidade')}>
        Universidade
      </button>
      <span>›</span>
      <button onClick={() => openCourse(course.id)}>
        {course.semester}º semestre · {course.title}
      </button>
      <span>›</span>
      <button onClick={() => openCourse(course.id, lesson.topicId)}>
        Aula {String(lesson.sourceLesson).padStart(2, '0')}
      </button>
      <span>›</span>
      <span aria-current="page">{lesson.title}</span>
    </nav>
  )
}
export function UniversityLessonNavigation({
  course,
  lesson,
  lessons,
}: {
  course: Course
  lesson: HandbookLesson
  lessons: HandbookLesson[]
}) {
  const { openCourse, openLesson, progress } = useApp()
  const unitLessons = lessons.filter(
    (l) => l.sourceLesson === lesson.sourceLesson,
  )
  const index = unitLessons.findIndex((l) => l.id === lesson.id)
  return (
    <>
      <button
        className="link-button"
        onClick={() => openCourse(course.id, lesson.topicId)}
      >
        ← Assuntos desta aula
      </button>
      <p className="handbook-nav-label">
        {course.semester}º semestre · {course.title}
      </p>
      <label htmlFor="university-aula">Aula da coleção</label>
      <select
        id="university-aula"
        className="select university-lesson-select"
        value={lesson.topicId}
        onChange={(event) => openCourse(course.id, event.target.value)}
      >
        {course.units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            Aula {String(unit.sourceNumber).padStart(2, '0')} · {unit.title}
          </option>
        ))}
      </select>
      <div className="university-current-position">
        <strong>
          Leitura {index + 1} de {unitLessons.length}
        </strong>
        {lesson.chapter
          ? `Capítulo ${lesson.chapter} · ${lesson.chapterTitle}`
          : lesson.title}
      </div>
      <details className="handbook-course-outline">
        <summary>Leituras desta aula</summary>
        {unitLessons.map((item, i) => (
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
export function UniversitySections({
  blocks,
  prefix,
}: {
  blocks: HandbookBlock[]
  prefix: string
}) {
  const headings = blocks.filter(
    (b) => b.type === 'heading' && /^\d+\.\d+/.test(b.text),
  )
  const [active, setActive] = useState('')
  const signature = headings.map((b) => blockAnchor(b, prefix)).join(',')
  useEffect(() => {
    const ids = signature.split(',').filter(Boolean)
    if (!ids.length) {
      setActive('')
      return
    }
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          entry.isIntersecting
            ? visible.add(entry.target.id)
            : visible.delete(entry.target.id)
        const current = ids.find((id) => visible.has(id))
        if (current) setActive(current)
      },
      { rootMargin: '-95px 0px -30% 0px' },
    )
    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    setActive(ids[0]!)
    return () => observer.disconnect()
  }, [signature])
  if (!headings.length) return null
  return (
    <nav
      className="handbook-local-outline university-section-outline"
      aria-label="Seções e subseções desta leitura"
    >
      <strong>Nesta leitura</strong>
      {headings.map((b) => {
        const anchor = blockAnchor(b, prefix)
        return (
          <a
            key={anchor}
            href={'#' + anchor}
            onClick={() => setActive(anchor)}
            className={
              /^\d+\.\d+\./.test(b.text) ? 'university-subsection' : undefined
            }
            aria-current={active === anchor ? 'location' : undefined}
          >
            {b.text}
          </a>
        )
      })}
    </nav>
  )
}
