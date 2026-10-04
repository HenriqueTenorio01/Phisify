import { supabase } from './client'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  current_streak: number
  longest_streak: number
  questions_answered: number
  questions_correct: number
  study_time_minutes: number
  created_at: string
  updated_at: string
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as Profile | null
}

export async function updateProfile(
  userId: string,
  updates: Pick<Profile, 'full_name' | 'avatar_url'>,
): Promise<Profile> {
  if (!supabase) throw new Error('Supabase não está configurado.')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data as Profile
}
