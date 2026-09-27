import { useEffect, useMemo, useState } from 'react'
import { courseById, lessonById } from '../../content/courses'
import { labs } from '../../simulations/registry'
import { loadProgress, saveProgress } from './storage'
import { AppContext, type AppContextValue } from './context'
import type { CourseId, LabId, ProgressState, Question, RouteState, Screen } from './types'
import { AppShell } from '../components/layout/AppShell'
import { HomePage } from '../pages/HomePage'
import { CoursesPage } from '../pages/CoursesPage'
import { CoursePage } from '../pages/CoursePage'
import { LabPage } from '../pages/LabPage'
import { SimulationPage } from '../pages/SimulationPage'
import { SheetsPage } from '../pages/SheetsPage'
import { PerformancePage } from '../pages/PerformancePage'
import { ReviewPage } from '../pages/ReviewPage'
import { SearchPage } from '../pages/SearchPage'
import { LessonPage } from '../pages/LessonPage'

const initialRoute: RouteState = { screen: 'home', courseId: 'mechanics', lessonId: 'lesson-free-fall', labId: 'projectile' }

function routeFromLabPath(): Pick<RouteState, 'screen' | 'labId'> | null {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/laboratorio') return { screen: 'lab', labId: 'projectile' }
  if (path === '/laboratorio/lancamento-obliquo') return { screen: 'simulation', labId: 'projectile' }
  if (path === '/laboratorio/interferencia-de-ondas') return { screen: 'simulation', labId: 'waves' }
  if (path === '/laboratorio/circuito-resistivo') return { screen: 'simulation', labId: 'circuit' }
  return null
}

export function App() {
  const [route, setRoute] = useState<RouteState>(() => { const saved = loadProgress(); const pathRoute = routeFromLabPath(); return { ...initialRoute, screen: pathRoute?.screen ?? saved.lastScreen, labId: pathRoute?.labId ?? initialRoute.labId } }); const [progress, setProgress] = useState<ProgressState>(() => loadProgress()); const [moreOpen, setMoreOpen] = useState(false)
  useEffect(() => { saveProgress(progress) }, [progress])
  useEffect(() => { const onPopState = () => { const pathRoute = routeFromLabPath(); if (!pathRoute) return; setRoute((current) => ({ ...current, ...pathRoute })) }; window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  const record = (next: ProgressState) => setProgress(next)
  const navigate = (screen: Screen) => { if (screen === 'lab') window.history.pushState({}, '', '/laboratorio'); if (screen === 'home') window.history.pushState({}, '', '/'); setRoute((current) => ({ ...current, screen })); setProgress((current) => ({ ...current, lastScreen: screen })); setMoreOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openCourse = (courseId: CourseId) => { setRoute((current) => ({ ...current, screen: 'course', courseId })); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openLesson = (lessonId: string) => { const found = lessonById(lessonId); setRoute((current) => ({ ...current, screen: 'lesson', lessonId, courseId: found?.course.id ?? current.courseId })); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openLab = (labId: LabId) => { const paths: Record<LabId, string> = { projectile: '/laboratorio/lancamento-obliquo', waves: '/laboratorio/interferencia-de-ondas', circuit: '/laboratorio/circuito-resistivo' }; window.history.pushState({}, '', paths[labId]); setRoute((current) => ({ ...current, screen: 'simulation', labId })); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const answerQuestion = (question: Question, selected: number) => { setProgress((current) => ({ ...current, responses: { ...current.responses, [question.id]: { selected, correct: selected === question.answer, at: Date.now() } }, history: [{ label: `${question.topic} · ${question.objective}`, type: 'answer' as const, at: Date.now() }, ...current.history].slice(0, 50) })) }
  const completeLesson = (lessonId: string) => { setProgress((current) => current.completedLessons.includes(lessonId) ? current : { ...current, completedLessons: [...current.completedLessons, lessonId], history: [{ label: lessonById(lessonId)?.data.title ?? lessonId, type: 'lesson' as const, at: Date.now() }, ...current.history].slice(0, 50) }) }
  const streak = useMemo(() => progress.history.length ? Math.min(12, Math.max(1, new Set(progress.history.map((item) => new Date(item.at).toDateString())).size)) : 4, [progress.history])
  const value: AppContextValue = { route, progress, navigate, openCourse, openLesson, openLab, answerQuestion, completeLesson, streak }
  const page = route.screen === 'home' ? <HomePage /> : route.screen === 'courses' ? <CoursesPage /> : route.screen === 'course' ? <CoursePage /> : route.screen === 'lab' ? <LabPage /> : route.screen === 'simulation' ? <SimulationPage /> : route.screen === 'sheets' ? <SheetsPage /> : route.screen === 'performance' ? <PerformancePage /> : route.screen === 'review' ? <ReviewPage /> : route.screen === 'search' ? <SearchPage /> : <LessonPage />
  return <AppContext.Provider value={value}><AppShell screen={route.screen} streak={streak} moreOpen={moreOpen} onNavigate={navigate} onToggleMore={() => setMoreOpen((open) => !open)}>{page}</AppShell></AppContext.Provider>
}
