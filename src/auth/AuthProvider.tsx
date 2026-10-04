import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getAuthErrorMessage } from './auth-errors'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'
import { fetchProfile, updateProfile as updateProfileRecord, type Profile } from '../lib/supabase/profile'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isConfigured: boolean
  isPasswordRecovery: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (fullName: string, email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateFullName: (fullName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const nextProfile = await fetchProfile(userId)
      setProfile(nextProfile)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let mounted = true

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      setSession(currentSession)
      if (currentSession?.user) void loadProfile(currentSession.user.id)
      setIsLoading(false)
    }).catch(() => {
      if (!mounted) return
      setSession(null)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setIsPasswordRecovery(event === 'PASSWORD_RECOVERY')
      if (nextSession?.user) {
        window.setTimeout(() => void loadProfile(nextSession.user.id), 0)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não está configurado.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(getAuthErrorMessage(error))
  }, [])

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não está configurado.')
    const options: { data: { full_name: string }; emailRedirectTo?: string } = {
      data: { full_name: fullName },
    }
    if (typeof window !== 'undefined') options.emailRedirectTo = window.location.origin + '/'
    const { data, error } = await supabase.auth.signUp({ email, password, options })
    if (error) throw new Error(getAuthErrorMessage(error))
    if (data.session?.user) await loadProfile(data.session.user.id)
    return { requiresEmailConfirmation: !data.session }
  }, [loadProfile])

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase não está configurado.')
    if (typeof window === 'undefined') {
      throw new Error('A recuperação de senha precisa ser iniciada no navegador.')
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/?auth=recovery',
    })
    if (error) throw new Error(getAuthErrorMessage(error))
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) throw new Error('Supabase não está configurado.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(getAuthErrorMessage(error))
    setIsPasswordRecovery(false)
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(getAuthErrorMessage(error))
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    await loadProfile(session.user.id)
  }, [loadProfile, session?.user])

  const updateFullName = useCallback(async (fullName: string) => {
    if (!session?.user) throw new Error('Você precisa estar conectado para atualizar seu perfil.')
    try {
      const nextProfile = await updateProfileRecord(session.user.id, {
        full_name: fullName,
        avatar_url: profile?.avatar_url ?? null,
      })
      setProfile(nextProfile)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }, [profile?.avatar_url, session?.user])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    profile,
    isLoading,
    isConfigured: isSupabaseConfigured,
    isPasswordRecovery,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
    refreshProfile,
    updateFullName,
  }), [isLoading, isPasswordRecovery, profile, refreshProfile, resetPassword, session, signIn, signOut, signUp, updateFullName, updatePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
