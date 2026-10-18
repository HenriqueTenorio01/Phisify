import type { Course } from '../../app/types'
import { useApp } from '../../app/context'
import { ProgressTrack } from '../ui/ProgressTrack'

export function UniversityCoursePage({ course }: { course: Course }) {
  const { route, navigate, openCourse, openLesson, lessonCompletion } = useApp()
  const unit = course.units.find((item) => item.id === route.topicId)
  const lessons = course.units.flatMap((item) => item.lessons)
  const done = (id: string) => {
    const p = lessonCompletion(id)
    return p.completed === p.total
  }
  const completed = lessons.filter((l) => done(l.id)).length
  return (
    <section className="screen active university-course">
      <nav className="university-breadcrumbs" aria-label="Caminho do semestre">
        <button onClick={() => navigate('courses', 'universidade')}>
          Universidade
        </button>
        <span>›</span>
        <button onClick={() => openCourse(course.id)}>
          {course.semester}º semestre · {course.title}
        </button>
        {unit && (
          <>
            <span>›</span>
            <span aria-current="page">
              Aula {String(unit.sourceNumber).padStart(2, '0')}
            </span>
          </>
        )}
      </nav>
      <div className="course-header">
        <div>
          <div className="eyebrow">
            Coleção universitária · Física e Engenharia
          </div>
          <h1>
            {course.semester}º semestre · {course.title}
          </h1>
          <p>{course.description}</p>
          <div className="course-meta">
            <span>{course.units.length} aulas da coleção</span>
            <span>{lessons.length} leituras por assunto</span>
            <span>Cálculo I e Geometria Analítica</span>
          </div>
        </div>
        <div className="course-summary">
          <strong>{Math.round((completed / lessons.length) * 100)}%</strong>
          <small>
            {completed} de {lessons.length} leituras
          </small>
          <ProgressTrack value={(completed / lessons.length) * 100} />
        </div>
      </div>
      <nav
        className="university-aula-tabs"
        aria-label={`Aulas do ${course.semester}º semestre`}
      >
        <button
          className={`btn ${!unit ? 'primary' : ''}`}
          onClick={() => openCourse(course.id)}
          aria-current={!unit ? 'page' : undefined}
        >
          Visão do semestre
        </button>
        {course.units.map((item) => (
          <button
            key={item.id}
            className={`btn ${unit?.id === item.id ? 'primary' : ''}`}
            onClick={() => openCourse(course.id, item.id)}
            aria-current={unit?.id === item.id ? 'page' : undefined}
          >
            Aula {String(item.sourceNumber).padStart(2, '0')}
          </button>
        ))}
      </nav>
      {unit ? (
        <section
          className="unit university-unit"
          aria-label={`Conteúdo da aula ${unit.sourceNumber}`}
        >
          <div className="unit-head">
            <div>
              <div className="eyebrow">
                Aula {String(unit.sourceNumber).padStart(2, '0')}
              </div>
              <h2>{unit.title}</h2>
              <p>{unit.description}</p>
            </div>
            <span>
              {unit.lessons.filter((l) => done(l.id)).length} /{' '}
              {unit.lessons.length} leituras
            </span>
          </div>
          <p className="quiet">
            Siga a ordem das leituras para acompanhar as deduções. As seções e
            subseções estão no sumário de cada leitura.
          </p>
          <ol className="university-reading-list">
            {unit.lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <button
                  className="lesson-row"
                  onClick={() => openLesson(lesson.id)}
                >
                  <span
                    className={`lesson-state ${done(lesson.id) ? 'done' : ''}`}
                  >
                    {done(lesson.id) ? '✓' : index + 1}
                  </span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.description}</small>
                  </span>
                  <span className="lesson-kind">
                    {lesson.pages} {lesson.pages === 1 ? 'página' : 'páginas'} ·{' '}
                    {lesson.minutes} min
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <div className="sheet-catalog university-aulas">
          {course.units.map((item) => {
            const completed = item.lessons.filter((l) => done(l.id)).length
            const next =
              item.lessons.find((l) => !done(l.id)) ?? item.lessons[0]!
            return (
              <article className="sheet-catalog-card" key={item.id}>
                <div className="eyebrow">
                  {course.semester}º semestre · Aula{' '}
                  {String(item.sourceNumber).padStart(2, '0')}
                </div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p className="quiet">
                  {item.lessons.length} leituras · {completed} concluídas
                </p>
                <ProgressTrack
                  value={(completed / item.lessons.length) * 100}
                />
                <div className="sheet-links">
                  <button
                    className="btn primary"
                    onClick={() => openCourse(course.id, item.id)}
                  >
                    Ver assuntos da aula{' '}
                    {String(item.sourceNumber).padStart(2, '0')}
                  </button>
                  <button
                    className="link-button"
                    onClick={() => openLesson(next.id)}
                  >
                    {completed === item.lessons.length
                      ? 'Revisar desde o início'
                      : completed
                        ? 'Continuar leitura'
                        : 'Começar pela orientação'}{' '}
                    →
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
