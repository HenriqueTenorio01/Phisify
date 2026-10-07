export type ThemePreference = 'dark' | 'light' | 'system'
export type DensityPreference = 'comfortable' | 'compact'
export type MotionPreference = 'standard' | 'reduced'
export type EffectsPreference = 'standard' | 'reduced'
export type TextSizePreference = 'standard' | 'large'
export type ContrastPreference = 'standard' | 'high'

export interface UserPreferences {
  theme: ThemePreference
  density: DensityPreference
  motion: MotionPreference
  effects: EffectsPreference
  textSize: TextSizePreference
  contrast: ContrastPreference
}

export const PREFERENCES_STORAGE_KEY = 'phisify-preferences-v1'

export const defaultPreferences: UserPreferences = {
  theme: 'dark',
  density: 'comfortable',
  motion: 'standard',
  effects: 'standard',
  textSize: 'standard',
  contrast: 'standard',
}

function isOption<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T)
}

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences

  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!raw) return defaultPreferences
    const parsed = JSON.parse(raw) as Partial<UserPreferences>

    return {
      theme: isOption(parsed['theme'], ['dark', 'light', 'system']) ? parsed['theme'] : defaultPreferences.theme,
      density: isOption(parsed['density'], ['comfortable', 'compact']) ? parsed['density'] : defaultPreferences.density,
      motion: isOption(parsed['motion'], ['standard', 'reduced']) ? parsed['motion'] : defaultPreferences.motion,
      effects: isOption(parsed['effects'], ['standard', 'reduced']) ? parsed['effects'] : defaultPreferences.effects,
      textSize: isOption(parsed['textSize'], ['standard', 'large']) ? parsed['textSize'] : defaultPreferences.textSize,
      contrast: isOption(parsed['contrast'], ['standard', 'high']) ? parsed['contrast'] : defaultPreferences.contrast,
    }
  } catch {
    return defaultPreferences
  }
}

export function savePreferences(preferences: UserPreferences) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    /* Preferences remain available for the current session when storage is unavailable. */
  }
}

export function resolveTheme(theme: ThemePreference): 'dark' | 'light' {
  if (theme !== 'system' || typeof window === 'undefined') return theme === 'light' ? 'light' : 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function applyPreferences(preferences: UserPreferences) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const theme = resolveTheme(preferences.theme)
  root.dataset['theme'] = theme
  root.dataset['density'] = preferences.density
  root.dataset['motion'] = preferences.motion
  root.dataset['effects'] = preferences.effects
  root.dataset['textSize'] = preferences.textSize
  root.dataset['contrast'] = preferences.contrast
  root.style.colorScheme = theme
}


