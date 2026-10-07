import { createContext, useContext } from 'react'
import type { CourseId, LabId, ProgressState, Question, RouteState, Screen } from './types'

export interface AppContextValue {
  route: RouteState
  progress: ProgressState
  navigate: (screen: Screen) => void
  openCourse: (id: CourseId) => void
  openLesson: (id: string) => void
  openLab: (id: LabId) => void
  answerQuestion: (question: Question, selected: number) => Promise<void>
  completeLesson: (id: string) => void
  streak: number
}
export const AppContext = createContext<AppContextValue | null>(null)
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('useApp precisa estar dentro de AppContext'); return value }


