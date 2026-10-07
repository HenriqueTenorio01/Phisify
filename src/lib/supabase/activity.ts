import { supabase } from './client'

export interface RecordedQuestionCompletion {
  activity_date: string
  exercises_completed: number
  streak_day_completed: boolean
  new_completion: boolean
  current_streak: number
  longest_streak: number
  questions_answered: number
  questions_correct: number
}

export async function setUserTimezone(timezone: string) {
  if (!supabase) return

  const { error } = await supabase.rpc('set_user_timezone', { p_timezone: timezone })
  if (error) throw error
}

export async function refreshUserStreak() {
  if (!supabase) return

  const { error } = await supabase.rpc('refresh_user_streak')
  if (error) throw error
}

export async function recordQuestionCompletion(questionId: string, isCorrect: boolean) {
  if (!supabase) throw new Error('Supabase não está configurado.')

  const { data, error } = await supabase.rpc('record_question_completion', {
    p_question_id: questionId,
    p_is_correct: isCorrect,
  })

  if (error) throw error
  return data as RecordedQuestionCompletion
}

