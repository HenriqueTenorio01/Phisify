import { useEffect, useMemo, useState } from 'react'
import { lessonById } from '../../content/courses'
import { loadProgress, saveProgress } from './storage'
import { AppContext, type AppContextValue } from './context'
import type { CourseId, LabId, ProgressState, Question, RouteState, Screen } from './types'
import { AppShell } from '../components/layout/AppShell'
import { useAuth } from '../hooks/useAuth'
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
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { RecoveryPage } from '../pages/RecoveryPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'

const initialRoute: RouteState = {
  screen: 'home',
  courseId: 'mechanics',
  lessonId: 'lesson-free-fall',
  labId: 'projectile',
}

const routePaths: Partial<Record<Screen, string>> = {
  home: '/',
  lab: '/laboratorio',
  login: '/login',
  signup: '/cadastro',
  recovery: '/recuperar-senha',
  profile: '/perfil',
  settings: '/configuracoes',
}

function routeFromPath(): Pick<RouteState, 'screen' | 'labId'> | null {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname.replace(/\/+$/, '') || '/'\n  const authMode = new URLSearchParams(window.location.search).get('auth')\n  if (authMode === 'recovery') return { screen: 'recovery', labId: 'projectile' }\n  const screens: Record<string, Screen> = {
    '/': 'home',
    '/login': 'login',
    '/cadastro': 'signup',
    '/recuperar-senha': 'recovery',
    '/perfil': 'profile',
    '/configuracoes': 'settings',
    '/laboratorio': 'lab',
    '/laboratorio/lancamento-obliquo': 'simulation',
    '/laboratorio/interferencia-de-ondas': 'simulation',
    '/laboratorio/circuito-resistivo': 'simulation',
  }
  const screen = screens[path]
  if (!screen) return null
  const labId = path.includes('interferencia') ? 'waves' : path.includes('circuito') ? 'circuit' : 'projectile'
  return { screen, labId }
}

export function App() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth()
  const [route, setRoute] = useState<RouteState>(() => {
    const saved = loadProgress()
    const pathRoute = routeFromPath()
    return {
      ...initialRoute,
      screen: pathRoute?.screen ?? saved.lastScreen,
      labId: pathRoute?.labId ?? initialRoute.labId,
    }
  })
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    const onPopState = () => {
      const pathRoute = routeFromPath()
      if (pathRoute) setRoute((current) => ({ ...current, ...pathRoute }))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (screen: Screen) => {
    const path = routePaths[screen]
    if (path) window.history.pushState({}, '', path)
    setRoute((current) => ({ ...current, screen }))
    if (!['login', 'signup', 'recovery', 'profile', 'settings'].includes(screen)) {
      setProgress((current) => ({ ...current, lastScreen: screen }))
    }
    setMoreOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const protectedScreen = route.screen === 'profile' || route.screen === 'settings'
    if (!authLoading && !user && protectedScreen) navigate('login')
  }, [authLoading, route.screen, user])

  const openCourse = (courseId: CourseId) => {
    setRoute((current) => ({ ...current, screen: 'course', courseId }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLesson = (lessonId: string) => {
    const found = lessonById(lessonId)
    setRoute((current) => ({
      ...current,
      screen: 'lesson',
      lessonId,
      courseId: found?.course.id ?? current.courseId,
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLab = (labId: LabId) => {
    const paths: Record<LabId, string> = {
      projectile: '/laboratorio/lancamento-obliquo',
      waves: '/laboratorio/interferencia-de-ondas',
      circuit: '/laboratorio/circuito-resistivo',
    }
    window.history.pushState({}, '', paths[labId])
    setRoute((current) => ({ ...current, screen: 'simulation', labId }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const answerQuestion = (question: Question, selected: number) => {
    setProgress((current) => ({
      ...current,
      responses: {
        ...current.responses,
        [question.id]: { selected, correct: selected === question.answer, at: Date.now() },
      },
      history: [
        {
          label: question.topic + ' · ' + question.objective,
          type: 'answer' as const,
          at: Date.now(),
        },
        ...current.history,
      ].slice(0, 50),
    }))
  }

  const completeLesson = (lessonId: string) => {
    setProgress((current) =>
      current.completedLessons.includes(lessonId)
        ? current
        : {
            ...current,
            completedLessons: [...current.completedLessons, lessonId],
            history: [
              {
                label: lessonById(lessonId)?.data.title ?? lessonId,
                type: 'lesson' as const,
                at: Date.now(),
              },
              ...current.history,
            ].slice(0, 50),
          },
    )
  }

  const streak = useMemo(
    () =>
      progress.history.length
        ? Math.min(12, Math.max(1, new Set(progress.history.map((item) => new Date(item.at).toDateString())).size))
        : 4,
    [progress.history],
  )
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Conta'
  const value: AppContextValue = {
    route,
    progress,
    navigate,
    openCourse,
    openLesson,
    openLab,
    answerQuestion,
    completeLesson,
    streak,
  }

  if (authLoading) {
    return <div className="auth-loading">Carregando sua sessão…</div>
  }

  const page =
    route.screen === 'home' ? <HomePage /> :
    route.screen === 'courses' ? <CoursesPage /> :
    route.screen === 'course' ? <CoursePage /> :
    route.screen === 'lab' ? <LabPage /> :
    route.screen === 'simulation' ? <SimulationPage /> :
    route.screen === 'sheets' ? <SheetsPage /> :
    route.screen === 'performance' ? <PerformancePage /> :
    route.screen === 'review' ? <ReviewPage /> :
    route.screen === 'search' ? <SearchPage /> :
    route.screen === 'lesson' ? <LessonPage /> :
    route.screen === 'login' ? <LoginPage onNavigate={navigate} onSuccess={() => navigate('home')} /> :
    route.screen === 'signup' ? <RegisterPage onNavigate={navigate} onSuccess={() => navigate('home')} /> :
    route.screen === 'recovery' ? <RecoveryPage onNavigate={navigate} /> :
    route.screen === 'profile' ? <ProfilePage profile={profile} user={user} onNavigate={navigate} onSignOut={signOut} /> :
    <SettingsPage onNavigate={navigate} />

  return (
    <AppContext.Provider value={value}>
      <AppShell
        screen={route.screen}
        streak={streak}
        moreOpen={moreOpen}
        onNavigate={navigate}
        onToggleMore={() => setMoreOpen((open) => !open)}
        onOpenAccount={() => navigate(user ? 'profile' : 'login')}
        isAuthenticated={Boolean(user)}
        userName={displayName}
      >
        {page}
      </AppShell>
    </AppContext.Provider>
  )
}
