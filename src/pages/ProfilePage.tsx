import { useState } from 'react'
import type { Screen } from '../app/types'
import type { Profile } from '../lib/supabase/profile'
import type { User } from '@supabase/supabase-js'

interface ProfilePageProps {
  profile: Profile | null
  user: User | null
  onNavigate: (screen: Screen) => void
  onSignOut: () => Promise<void>
}

export function ProfilePage({ profile, user, onNavigate, onSignOut }: ProfilePageProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'Estudante'
  const answered = profile?.questions_answered ?? 0
  const correct = profile?.questions_correct ?? 0
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0

  async function handleSignOut() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await onSignOut()
      onNavigate('home')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <section className="account-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Conta</span>
          <h1>Seu perfil</h1>
          <p className="page-intro">Um resumo do seu espaço pessoal no Phisify.</p>
        </div>
        <button className="btn" onClick={() => onNavigate('settings')}>Configurações</button>
      </div>
      <div className="account-identity">
        <div className="account-avatar">{fullName.slice(0, 1).toUpperCase()}</div>
        <div>
          <h2>{fullName}</h2>
          <p>{user?.email ?? profile?.email ?? 'E-mail não disponível'}</p>
        </div>
      </div>
      <div className="account-stat-grid">
        <div className="account-stat"><span>Sequência atual</span><strong>{profile?.current_streak ?? 0} <small>dias</small></strong></div>
        <div className="account-stat"><span>Maior sequência</span><strong>{profile?.longest_streak ?? 0} <small>dias</small></strong></div>
        <div className="account-stat"><span>Questões respondidas</span><strong>{answered}</strong></div>
        <div className="account-stat"><span>Aproveitamento</span><strong>{accuracy}%</strong></div>
        <div className="account-stat"><span>Tempo estudado</span><strong>{profile?.study_time_minutes ?? 0} <small>min</small></strong></div>
      </div>
      <div className="account-actions">
        <button className="btn primary" onClick={() => onNavigate('home')}>Continuar estudando</button>
        <button className="btn" onClick={handleSignOut} disabled={loggingOut}>{loggingOut ? 'Saindo…' : 'Sair da conta'}</button>
      </div>
    </section>
  )
}
