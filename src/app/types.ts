export type Screen = 'home' | 'courses' | 'lab' | 'sheets' | 'performance' | 'review' | 'search' | 'course' | 'lesson' | 'simulation' | 'login' | 'signup' | 'recovery' | 'profile' | 'settings'

export type CourseId = 'mechanics' | 'electricity' | 'waves' | 'thermo'
export type LabId = 'projectile' | 'waves' | 'circuit'

export interface RouteState {
  screen: Screen
  courseId: CourseId
  lessonId: string
  labId: LabId
}

export interface StoredResponse {
  selected: number
  correct: boolean
  at: number
}

export interface ProgressState {
  completedLessons: string[]
  responses: Record<string, StoredResponse>
  history: Array<{ label: string; type: 'answer' | 'lesson'; at: number }>
  lastScreen: Screen
}

export interface LessonSummary {
  id: string
  title: string
  description: string
  type: string
  minutes: number
}

export interface CourseUnit {
  title: string
  lessons: LessonSummary[]
}

export interface Course {
  id: CourseId
  title: string
  area: string
  level: string
  tone: string
  description: string
  units: CourseUnit[]
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

export interface Question {
  id: string
  topic: string
  course: CourseId
  lessonId: string
  difficulty: 'easy' | 'medium' | 'hard'
  objective: string
  format: string
  prompt: string
  options: string[]
  answer: number
  reasoning: string
  explanation: string
}

export interface LabDefinition {
  id: LabId
  title: string
  area: string
  icon: string
  description: string
  meta: string
}
