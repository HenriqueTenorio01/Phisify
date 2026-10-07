import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  applyPreferences,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from './preferences'

interface PreferencesContextValue {
  preferences: UserPreferences
  updatePreference: <Key extends keyof UserPreferences>(key: Key, value: UserPreferences[Key]) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences())

  useEffect(() => {
    applyPreferences(preferences)
    savePreferences(preferences)

    if (preferences.theme !== 'system' || typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = () => applyPreferences(preferences)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preferences])

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    updatePreference: (key, value) => setPreferences((current) => ({ ...current, [key]: value })),
  }), [preferences])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences precisa estar dentro de PreferencesProvider')
  return context
}


