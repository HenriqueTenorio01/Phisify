import { useState, type FormEvent } from 'react'
import type { Screen } from '../app/types'
import { useAuth } from '../hooks/useAuth'

interface LoginPageProps {
  onNavigate: (screen: Screen) => void
  onSuccess: () => void
}

export function LoginPage({ onNavigate, onSuccess }: LoginPageProps) {
  const { signIn, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')

    if (!email.trim()) {
      setError('Você precisa preencher seu e-mail.')
      return
    }
    if (!password) {
      setError('Você precisa preencher sua senha.')
      return
    }

    setLoading(true)
    try {
      await signIn(email.trim(), password)
      onSuccess()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">Conta Phisify</span>
        <h1>Continue de onde parou.</h1>
        <p>Entre para acompanhar seu estudo e manter seu espaço pessoal no Phisify.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-head">
          <span className="section-label">Acesso</span>
          <h2>Entrar</h2>
          <p>Use o e-mail e a senha da sua conta.</p>
        </div>
        {!isConfigured && <p className="auth-notice">A autenticação ainda precisa ser configurada no ambiente.</p>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@exemplo.com" />
          </label>
          <label className="field">
            <span>Senha</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Sua senha" />
          </label>
          <button className="btn primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <div className="auth-links">
          <button className="link-button" onClick={() => onNavigate('recovery')}>Esqueci minha senha</button>
          <button className="link-button" onClick={() => onNavigate('signup')}>Criar uma conta</button>
        </div>
      </div>
    </section>
  )
}
