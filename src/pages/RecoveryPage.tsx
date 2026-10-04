import { useState, type FormEvent } from 'react'
import type { Screen } from '../app/types'
import { useAuth } from '../hooks/useAuth'

interface RecoveryPageProps {
  onNavigate: (screen: Screen) => void
}

export function RecoveryPage({ onNavigate }: RecoveryPageProps) {
  const { resetPassword, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Você precisa preencher seu e-mail.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSuccess('Enviamos um link para redefinir sua senha.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível enviar o link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">Recuperação</span>
        <h1>Volte a acessar sua conta.</h1>
        <p>Informe seu e-mail e enviaremos um link seguro para redefinir a senha.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-head">
          <span className="section-label">Acesso</span>
          <h2>Esqueci minha senha</h2>
          <p>O link será válido conforme as regras do Supabase Auth.</p>
        </div>
        {!isConfigured && <p className="auth-notice">A autenticação ainda precisa ser configurada no ambiente.</p>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {success && <p className="form-message success" role="status">{success}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@exemplo.com" />
          </label>
          <button className="btn primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar recuperação'}
          </button>
        </form>
        <div className="auth-links">
          <button className="link-button" onClick={() => onNavigate('login')}>Voltar para entrar</button>
          <button className="link-button" onClick={() => onNavigate('signup')}>Criar uma conta</button>
        </div>
      </div>
    </section>
  )
}
