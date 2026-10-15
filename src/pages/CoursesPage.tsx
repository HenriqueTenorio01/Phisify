import { coursesForTrack } from '../../content/catalog'
import { tracks, trackById } from '../../content/tracks'
import { worksheetPath } from '../../content/worksheets'
import { useState } from 'react'
import { useApp } from '../app/context'
import { ProgressTrack } from '../components/ui/ProgressTrack'

export function CoursesPage() {
  const { route, openCourse, openSheet, selectTrack, lessonCompletion } =
    useApp()
  const [filter, setFilter] = useState('Todos')
  const courses = coursesForTrack(route.trackId)
  const filters = ['Todos', ...new Set(courses.map((course) => course.area))]
  const visible = courses.filter(
    (course) =>
      !filters.includes(filter) || filter === 'Todos' || course.area === filter,
  )
  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <div className="eyebrow">mapa de aprendizagem</div>
          <h1>{trackById(route.trackId).title}</h1>
          <p className="page-intro">{trackById(route.trackId).description}</p>
        </div>
      </div>
      <div className="filters" aria-label="Percursos de estudo">
        {tracks.map((track) => (
          <button
            key={track.id}
            className={`filter ${route.trackId === track.id ? 'active' : ''}`}
            aria-pressed={route.trackId === track.id}
            onClick={() => {
              setFilter('Todos')
              selectTrack(track.id)
            }}
          >
            {track.title}
          </button>
        ))}
      </div>
      {courses.length > 0 && (
        <div className="filters" aria-label="Áreas de física">
          {filters.map((item) => (
            <button
              key={item}
              className={`filter ${filter === item ? 'active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="catalog">
        {visible.map((course) => {
          const lessons = course.units.flatMap((unit) => unit.lessons)
          const completion = lessons.map((lesson) =>
            lessonCompletion(lesson.id),
          )
          const totalParts = completion.reduce(
            (sum, part) => sum + part.total,
            0,
          )
          const doneParts = completion.reduce(
            (sum, part) => sum + part.completed,
            0,
          )
          const percent = totalParts ? (doneParts / totalParts) * 100 : 0
          const card = (
            <article className="catalog-row" key={course.id}>
              <div className={`catalog-marker ${course.tone}`} />
              <div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="tag-list">
                  <span className="pill">{course.level}</span>
                  <span className="pill">
                    {lessons.length
                      ? `${lessons.length} aulas`
                      : 'Conteúdo em preparação'}
                  </span>
                  <span className="pill">{course.area}</span>
                </div>
              </div>
              <div className="catalog-side">
                <strong>{Math.round(percent)}%</strong>
                <small>progresso</small>
                <ProgressTrack value={percent} />
                <button
                  className="btn ghost"
                  onClick={() => openCourse(course.id)}
                >
                  Abrir curso →
                </button>
                {course.compact && worksheetPath(course.id, route.trackId) && (
                  <button
                    className="link-button"
                    onClick={() => openSheet(course.id)}
                  >
                    Abrir ficha de questões
                  </button>
                )}
              </div>
            </article>
          )
          return course.compact ? (
            <details className="catalog-topic" key={course.id}>
              <summary>
                <span>{course.area}</span>
                <small>{lessons.length} aulas · teoria e ficha</small>
              </summary>
              {card}
            </details>
          ) : (
            card
          )
        })}
      </div>
      {!visible.length && (
        <div className="empty">
          <strong>
            {courses.length
              ? 'Nenhum curso encontrado.'
              : 'Conteúdo em preparação.'}
          </strong>
          {courses.length
            ? 'Escolha outro filtro.'
            : 'As aulas e questões deste percurso serão disponibilizadas aqui.'}
        </div>
      )}
    </section>
  )
}
