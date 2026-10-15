import { handbooks } from '../../content/handbooks'
import { courseById } from '../../content/courses'
import { useApp } from '../app/context'
import { ProgressTrack } from '../components/ui/ProgressTrack'
export function CoursePage() {
  const {
    route,
    progress,
    openLesson,
    navigate,
    lessonCompletion,
    openCourse,
    openSheet,
  } = useApp()
  const course = courseById(route.courseId)
  if (!course || course.trackId !== route.trackId)
    return (
      <section className="screen active">
        <div className="empty">
          <strong>Curso indisponível.</strong>Escolha um curso deste percurso.
        </div>
        <button className="btn" onClick={() => navigate('courses')}>
          Ver trilha
        </button>
      </section>
    )
  const themed = course.units.some((unit) => unit.id)
  const topic = course.units.find((unit) => unit.id === route.topicId)
  const showAll = route.topicId === 'todos'
  const lessons = course.units.flatMap((unit) => unit.lessons)
  const completion = lessons.map((lesson) => lessonCompletion(lesson.id))
  const totalParts = completion.reduce((sum, part) => sum + part.total, 0)
  const doneParts = completion.reduce((sum, part) => sum + part.completed, 0)
  const percent = totalParts ? (doneParts / totalParts) * 100 : 0
  return (
    <section className="screen active">
      <div className="course-crumb">
        <button onClick={() => navigate('courses')}>Trilhas</button>
        <span>/</span>
        <span>{course.area}</span>
      </div>
      <div className="course-header">
        <div>
          <div className="eyebrow">{course.level}</div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-meta">
            <span>{lessons.length} aulas</span>
            <span>{course.units.length} unidades</span>
            <span>estudo progressivo</span>
          </div>
        </div>
        <div className="course-summary">
          <strong>{Math.round(percent)}%</strong>
          <small>trilha concluída</small>
          <ProgressTrack value={percent} />
        </div>
      </div>
      {!lessons.length && (
        <div className="empty">
          <strong>Conteúdo em preparação.</strong>Novas aulas e questões serão
          disponibilizadas aqui.
        </div>
      )}
      {themed && (
        <>
          <div className="sheet-links">
            <button
              className="link-button"
              onClick={() => openCourse(course.id)}
            >
              Todos os temas de Mecânica
            </button>
            <button
              className="link-button"
              onClick={() => openCourse(course.id, 'todos')}
            >
              Ver todas as aulas
            </button>
            {topic && topic.id !== 'consulta' && (
              <button
                className="btn"
                onClick={() => openSheet(course.id, topic.id)}
              >
                Ficha de {topic.title}
              </button>
            )}
          </div>
          {topic && <p className="quiet">{topic.description}</p>}
          {!topic && !showAll && (
            <div className="sheet-catalog">
              {course.units.map((unit) => (
                <article className="sheet-catalog-card" key={unit.id}>
                  <div className="eyebrow">Ensino Médio · Mecânica</div>
                  <h2>{unit.title}</h2>
                  <p>{unit.description}</p>
                  <p className="quiet">{unit.lessons.length} leituras</p>
                  <div className="sheet-links">
                    <button
                      className="btn primary"
                      onClick={() => openCourse(course.id, unit.id)}
                    >
                      Aulas de {unit.title}
                    </button>
                    {unit.id !== 'consulta' && (
                      <button
                        className="btn"
                        onClick={() => openSheet(course.id, unit.id)}
                      >
                        Ficha de {unit.title}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
      {course.units
        .filter(
          (unit) =>
            unit.lessons.length > 0 &&
            (!themed || showAll || unit.id === topic?.id),
        )
        .map((unit, unitIndex) => (
          <section className="unit" key={unit.title}>
            <div className="unit-head">
              <h2>
                {handbooks.some((book) => book.course.id === course.id)
                  ? unit.title
                  : `${unitIndex + 1}. ${unit.title}`}
              </h2>
              <span>{unit.lessons.length} aulas</span>
            </div>
            {unit.lessons.map((lesson, index) => {
              const isDone = progress.completedLessons.includes(lesson.id)
              const parts = lessonCompletion(lesson.id)
              return (
                <button
                  className="lesson-row"
                  key={lesson.id}
                  onClick={() => openLesson(lesson.id)}
                >
                  <span
                    className={`lesson-state ${isDone ? 'done' : index === 0 && unitIndex === 0 ? 'current' : ''}`}
                  >
                    {isDone ? '✓' : unitIndex + index + 1}
                  </span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.description}</small>
                    {parts.completed > 0 && parts.completed < parts.total && (
                      <small className="lesson-progress-note">
                        {parts.completed} de {parts.total} trechos já concluídos
                      </small>
                    )}
                  </span>
                  <span className="lesson-kind">
                    {lesson.pages && (
                      <>
                        {lesson.estimatedPages ? '≈ ' : ''}
                        {lesson.pages}{' '}
                        {lesson.pages === 1 ? 'página' : 'páginas'} ·{' '}
                      </>
                    )}
                    {lesson.type} · {lesson.minutes} min
                  </span>
                </button>
              )
            })}
          </section>
        ))}
    </section>
  )
}
