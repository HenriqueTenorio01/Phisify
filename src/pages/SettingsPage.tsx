import { useEffect, useState, type FormEvent } from 'react'
import type { Screen } from '../app/types'
import { useAuth } from '../hooks/useAuth'

interface SettingsPageProps {
  onNavigate: (screen: Screen) => void
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { profile, user, updateFullName } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
  }, [profile?.full_name])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setMessage('')
    setError('')

    if (!fullName.trim()) {
      setError('Você precisa preencher seu nome.')
      return
    }

    setSaving(true)
    try {
      await updateFullName(fullName.trim())
      setMessage('Perfil atualizado com sucesso.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível atualizar seu perfil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="account-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Conta</span>
          <h1>Configurações</h1>
          <p className="page-intro">Atualize os dados básicos do seu perfil.</p>
        </div>
        <button className="btn" onClick={() => onNavigate('profile')}>Voltar ao perfil</button>
      </div>
      <div className="settings-grid">
        <form className="account-card auth-form" onSubmit={handleSubmit}>
          <div className="auth-panel-head">
            <span className="section-label">Perfil</span>
            <h2>Dados pessoais</h2>
          </div>
          {error && <p className="form-message error" role="alert">{error}</p>}
          {message && <p className="form-message success" role="status">{message}</p>}
          <label className="field">
            <span>Nome</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input value={user?.email ?? ''} disabled />
          </label>
          <p className="quiet">Para trocar o e-mail, use o fluxo de atualização de e-mail do Supabase Auth quando ele for habilitado.</p>
          <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </form>
        <div className="account-card settings-note">
          <span className="section-label">Próxima etapa</span>
          <h2>Seu progresso, com segurança</h2>
          <p>Os dados desta conta ficam associados ao seu usuário no Supabase. O progresso detalhado será conectado em uma próxima etapa, sem misturar contas.</p>
          <button className="btn ghost" onClick={() => onNavigate('home')}>Voltar ao estudo</button>
        </div>
      </div>
    </section>
  )
}
