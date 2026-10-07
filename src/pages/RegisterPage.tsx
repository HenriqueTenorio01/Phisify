import { useState, type FormEvent } from 'react'
import type { Screen } from '../app/types'
import { useAuth } from '../hooks/useAuth'

interface RegisterPageProps {
  onNavigate: (screen: Screen) => void
  onSuccess: () => void
}

export function RegisterPage({ onNavigate, onSuccess }: RegisterPageProps) {
  const { signUp, isConfigured } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Você precisa preencher seu nome.')
      return
    }
    if (!email.trim()) {
      setError('Você precisa preencher seu e-mail.')
      return
    }
    if (password.length < 6) {
      setError('Sua senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    try {
      const result = await signUp(fullName.trim(), email.trim(), password)
      if (result.requiresEmailConfirmation) {
        setSuccess('Conta criada com sucesso. Enviamos um link para confirmar seu e-mail.')
      } else {
        onSuccess()
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível criar sua conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">Primeiro acesso</span>
        <h1>Crie seu espaço de estudo.</h1>
        <p>Seu perfil vai reunir seu ritmo e seus próximos passos no Phisify.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-head">
          <span className="section-label">Cadastro</span>
          <h2>Criar conta</h2>
          <p>Leva menos de um minuto.</p>
        </div>
        {!isConfigured && <p className="auth-notice">A autenticação ainda precisa ser configurada no ambiente.</p>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {success && <p className="form-message success" role="status">{success}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Seu nome" />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@exemplo.com" />
          </label>
          <label className="field">
            <span>Senha</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Mínimo de 6 caracteres" />
          </label>
          <label className="field">
            <span>Confirmar senha</span>
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Repita sua senha" />
          </label>
          <button className="btn primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Criando…' : 'Criar conta'}
          </button>
        </form>
        <div className="auth-links">
          <button className="link-button" onClick={() => onNavigate('login')}>Já tenho uma conta</button>
          <button className="link-button" onClick={() => onNavigate('home')}>Voltar ao Phisify</button>
        </div>
      </div>
    </section>
  )
}
