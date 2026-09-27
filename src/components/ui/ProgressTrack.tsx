export function ProgressTrack({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  return <div className="progress-track" aria-label={`${Math.round(safe)}% concluído`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe}><span style={{ width: `${safe}%` }} /></div>
}
