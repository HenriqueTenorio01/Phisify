import { useEffect, useState, type SetStateAction } from 'react'
import { emptyProgress, loadProgress, saveProgress } from './storage'
import type { ProgressState } from './types'

export function useUserProgress(
  userId: string | undefined,
  authLoading: boolean,
) {
  const owner = userId ?? null
  const [state, setState] = useState<{
    owner: string | null | undefined
    progress: ProgressState
  }>(() => ({ owner: undefined, progress: emptyProgress() }))
  const ready = !authLoading && state.owner === owner

  useEffect(() => {
    if (!authLoading) {
      setState({ owner, progress: loadProgress(userId) })
    }
  }, [authLoading, owner, userId])

  useEffect(() => {
    // The state must belong to this account before anything can be persisted.
    // Reordering load/save effects alone still saves stale state on account switches.
    if (ready && userId) saveProgress(state.progress, userId)
  }, [ready, state.progress, userId])

  const setProgress = (update: SetStateAction<ProgressState>) => {
    if (!ready) return
    setState((current) =>
      current.owner !== owner
        ? current
        : {
            ...current,
            progress:
              typeof update === 'function' ? update(current.progress) : update,
          },
    )
  }

  return {
    progress: ready ? state.progress : emptyProgress(),
    setProgress,
    ready,
  }
}
