export type Screen =
  | 'home'
  | 'courses'
  | 'lab'
  | 'sheets'
  | 'performance'
  | 'review'
  | 'search'
  | 'course'
  | 'lesson'
  | 'simulation'
  | 'login'
  | 'signup'
  | 'recovery'
  | 'profile'
  | 'settings'

export type TrackId = 'ensino-medio' | 'olimpiadas' | 'universidade'

export type CourseId =
  | 'university-mechanics-1'
  | 'mechanics'
  | 'electricity'
  | 'waves'
  | 'thermo'
  | 'optics'
  | 'olympiad-waves'
  | 'olympiad-gravity'
  | 'olympiad-center-of-mass'
export type LabId = 'projectile' | 'waves' | 'circuit'

export interface RouteState {
  trackId: TrackId
  screen: Screen
  courseId: CourseId
  lessonId: string
  labId: LabId
  topicId?: string | null
  sheetId: CourseId | 'unavailable' | null
}

export interface StoredResponse {
  selected: number
  correct: boolean
  at: number
}

export interface ProgressState {
  completedLessons: string[]
  responses: Record<string, StoredResponse>
  history: Array<{
    label: string
    type: 'answer' | 'lesson'
    at: number
    contentId?: string
  }>
  lastScreen: Screen
}

export interface LessonSummary {
  id: string
  title: string
  description: string
  type: string
  minutes: number
  pages?: number
  estimatedPages?: boolean
}

export interface CourseUnit {
  sourceNumber?: number
  id?: string
  description?: string
  title: string
  lessons: LessonSummary[]
}

export interface Course {
  semester?: number
  trackId: TrackId
  id: CourseId
  title: string
  area: string
  level: string
  tone: string
  description: string
  units: CourseUnit[]
  separatePractice?: boolean
  compact?: boolean
}

export interface LessonData {
  course: CourseId
  kicker: string
  title: string
  lead: string
  concept: string
  callout: string
  formulas: Array<[string, string]>
  deduction: string
  question: string
  options: string[]
  answer: number
  explanation: string
  visual: 'free-fall' | 'projectile' | 'circuit' | 'waves' | 'thermo'
}

export interface AcademicLesson {
  definitions: Array<[string, string]>
  interpretation: string
  example: string
  pitfalls: string
}

interface QuestionBase {
  topicId?: string
  subtopic?: string
  difficultyLabel?: string
  id: string
  topic: string
  course: CourseId
  lessonId: string
  difficulty: 'easy' | 'medium' | 'hard'
  objective: string
  format: string
  prompt: string
  reasoning: string
}

export interface ChoiceQuestion extends QuestionBase {
  kind?: 'choice'
  options: string[]
  answer: number
  explanation: string
}

export interface WrittenQuestion extends QuestionBase {
  kind: 'written'
  sourceNumber: number
  relatedLessonIds?: string[]
  statement: import('./handbook').SourceSlice[]
  solution: import('./handbook').SourceSlice[]
  hints?: import('./handbook').SourceSlice[]
}

export type Question = ChoiceQuestion | WrittenQuestion

export interface LabDefinition {
  id: LabId
  title: string
  area: string
  icon: string
  description: string
  meta: string
}
