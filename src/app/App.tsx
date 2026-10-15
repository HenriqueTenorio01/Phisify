import { useEffect, useState } from 'react'
import { courseById, lessonById } from '../../content/courses'
import { useUserProgress } from './useUserProgress'
import { routeFromLocation, screenPath } from './navigation'
import { progressForTrack, questionsForTrack } from '../../content/catalog'
import { AppContext, type AppContextValue } from './context'
import type {
  CourseId,
  LabId,
  Question,
  RouteState,
  Screen,
  TrackId,
} from './types'
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
import { recordQuestionCompletion } from '../lib/supabase/activity'
import { Localize } from '../i18n'
import { isResponseCorrect } from '../questions'
import { worksheetPath } from '../../content/worksheets'
import { lessonCompletion } from '../../content/lesson-compatibility'
import { completeLessonProgress } from './lessonProgress'

const initialRoute: RouteState = {
  screen: 'home',
  trackId: 'ensino-medio',
  courseId: 'mechanics',
  lessonId: '',
  labId: 'projectile',
  sheetId: null,
  topicId: null,
}

function routeFromPath() {
  return typeof window === 'undefined'
    ? null
    : routeFromLocation(window.location.pathname, window.location.search)
}

export function App() {
  const {
    user,
    profile,
    isLoading: authLoading,
    signOut,
    refreshProfile,
  } = useAuth()
  const [route, setRoute] = useState<RouteState>(() => ({
    ...initialRoute,
    ...routeFromPath(),
  }))
  const {
    progress,
    setProgress,
    ready: progressReady,
  } = useUserProgress(user?.id, authLoading)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const onPopState = () => {
      const pathRoute = routeFromPath()
      if (pathRoute) setRoute((current) => ({ ...current, ...pathRoute }))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (screen: Screen, trackId = route.trackId) => {
    const path = screenPath(screen, trackId)
    if (path) window.history.pushState({}, '', path)
    setRoute((current) => ({
      ...current,
      screen,
      trackId,
      sheetId: null,
      topicId: null,
    }))
    if (
      !['login', 'signup', 'recovery', 'profile', 'settings'].includes(screen)
    ) {
      setProgress((current) => ({ ...current, lastScreen: screen }))
    }
    setMoreOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const protectedScreen =
      route.screen === 'profile' || route.screen === 'settings'
    if (!authLoading && !user && protectedScreen) navigate('login')
  }, [authLoading, route.screen, user])

  const selectTrack = (trackId: TrackId) => {
    window.history.pushState({}, '', screenPath('courses', trackId))
    setRoute((current) => ({
      ...current,
      screen: 'courses',
      trackId,
      lessonId: '',
      sheetId: null,
      topicId: null,
    }))
    setMoreOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCourse = (courseId: CourseId, topicId?: string) => {
    if (courseById(courseId)?.trackId !== route.trackId) return
    window.history.pushState(
      {},
      '',
      `/trilhas/${route.trackId}/cursos/${courseId}${topicId ? `?tema=${encodeURIComponent(topicId)}` : ''}`,
    )
    setRoute((current) => ({
      ...current,
      screen: 'course',
      courseId,
      topicId: topicId ?? null,
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLesson = (lessonId: string) => {
    const found = lessonById(lessonId)
    if (!found || found.course.trackId !== route.trackId) return
    window.history.pushState(
      {},
      '',
      `/trilhas/${route.trackId}/aulas/${found.data.id}`,
    )
    setRoute((current) => ({
      ...current,
      screen: 'lesson',
      lessonId: found.data.id,
      courseId: found.course.id,
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

  const openSheet = (sheetId: CourseId, topicId?: string) => {
    const path = worksheetPath(sheetId, route.trackId)
    if (!path) return
    window.history.pushState(
      {},
      '',
      path + (topicId ? `?tema=${encodeURIComponent(topicId)}` : ''),
    )
    setRoute((current) => ({
      ...current,
      screen: 'sheets',
      sheetId,
      topicId: topicId ?? null,
    }))
    setMoreOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const answerQuestion = async (question: Question, selected: number) => {
    if (
      !user ||
      !progressReady ||
      !questionsForTrack(route.trackId).some((item) => item.id === question.id)
    )
      return
    const answeredAt = Date.now()
    setProgress((current) => ({
      ...current,
      responses: {
        ...current.responses,
        [question.id]: {
          selected,
          correct: isResponseCorrect(question, selected),
          at: answeredAt,
        },
      },
      history: [
        {
          label: question.topic + ' · ' + question.objective,
          type: 'answer' as const,
          contentId: question.id,
          at: answeredAt,
        },
        ...current.history,
      ].slice(0, 50),
    }))

    try {
      await recordQuestionCompletion(
        question.id,
        isResponseCorrect(question, selected),
      )
      await refreshProfile()
    } catch {
      // Keep the local answer feedback available if the remote save is temporarily unavailable.
    }
  }

  const completeLesson = (lessonId: string) => {
    const found = lessonById(lessonId)
    if (!user || !progressReady || found?.course.trackId !== route.trackId)
      return
    setProgress((current) =>
      completeLessonProgress(
        current,
        found.data.id,
        found.data.title,
        Date.now(),
      ),
    )
  }

  const streak = user ? (profile?.current_streak ?? 0) : 0
  const displayName =
    profile?.full_name || user?.email?.split('@')[0] || 'Conta'
  const value: AppContextValue = {
    route,
    progress: progressForTrack(progress, route.trackId),
    navigate,
    selectTrack,
    openCourse,
    openLesson,
    openSheet,
    openLab,
    answerQuestion,
    completeLesson,
    lessonCompletion: (id) => lessonCompletion(progress.completedLessons, id),
    streak,
  }

  if (authLoading || !progressReady) {
    return <div className="auth-loading">Carregando sua sessão…</div>
  }

  const page =
    route.screen === 'home' ? (
      <HomePage />
    ) : route.screen === 'courses' ? (
      <CoursesPage key={route.trackId} />
    ) : route.screen === 'course' ? (
      <CoursePage />
    ) : route.screen === 'lab' ? (
      <LabPage />
    ) : route.screen === 'simulation' ? (
      <SimulationPage />
    ) : route.screen === 'sheets' ? (
      <SheetsPage key={`${route.trackId}:${route.sheetId}:${route.topicId}`} />
    ) : route.screen === 'performance' ? (
      <PerformancePage />
    ) : route.screen === 'review' ? (
      <ReviewPage />
    ) : route.screen === 'search' ? (
      <SearchPage />
    ) : route.screen === 'lesson' ? (
      <LessonPage />
    ) : route.screen === 'login' ? (
      <LoginPage onNavigate={navigate} onSuccess={() => navigate('home')} />
    ) : route.screen === 'signup' ? (
      <RegisterPage onNavigate={navigate} onSuccess={() => navigate('home')} />
    ) : route.screen === 'recovery' ? (
      <RecoveryPage onNavigate={navigate} />
    ) : route.screen === 'profile' ? (
      <ProfilePage
        profile={profile}
        user={user}
        onNavigate={navigate}
        onSignOut={signOut}
      />
    ) : (
      <SettingsPage onNavigate={navigate} />
    )

  return (
    <AppContext.Provider value={value}>
      <Localize>
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
      </Localize>
    </AppContext.Provider>
  )
}
