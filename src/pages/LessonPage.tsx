import { lazy, Suspense } from 'react'
import { handbookForLesson } from '../../content/handbooks'
import { academicLessonById, lessonDataById } from '../../content/lessons'
import { questionBank } from '../../content/questions'
import { lessonById } from '../../content/courses'
import { useApp } from '../app/context'
import { AcademicLesson } from '../components/lessons/AcademicLesson'
const HandbookLessonPage = lazy(
  () => import('../components/lessons/HandbookLessonPage'),
)

export function LessonPage() {
  const {
    route,
    progress,
    answerQuestion,
    completeLesson,
    openCourse,
    navigate,
  } = useApp()
  const found = lessonById(route.lessonId)
  if (
    found?.course.trackId === route.trackId &&
    handbookForLesson(route.lessonId)
  ) {
    return (
      <Suspense fallback={<p>Carregando aula…</p>}>
        <HandbookLessonPage key={route.lessonId} id={route.lessonId} />
      </Suspense>
    )
  }
  const raw = lessonDataById[route.lessonId]
  const exercise = questionBank.find((q) => q.lessonId === route.lessonId)
  if (!found || found.course.trackId !== route.trackId || !raw || !exercise)
    return (
      <section className="screen active">
        <div className="empty">
          <strong>Aula indisponível.</strong>Este endereço não corresponde a uma
          aula válida.
        </div>
        <button className="btn" onClick={() => navigate('courses')}>
          Ver trilhas
        </button>
      </section>
    )
  const data = {
    ...raw,
    course: found.course.id,
    title: found.data.title,
    kicker: `${found.course.area} · ${found.unit.title}`,
  }
  return (
    <section className="screen active">
      <AcademicLesson
        lesson={data}
        academic={academicLessonById(route.lessonId)}
        completed={progress.completedLessons.includes(route.lessonId)}
        response={progress.responses[exercise.id]}
        exercise={exercise}
        onAnswer={answerQuestion}
        onComplete={() => completeLesson(route.lessonId)}
        onBack={() => openCourse(found.course.id)}
        onNavigateLesson={() => navigate('sheets')}
      />
    </section>
  )
}
