import { useState, type FormEvent } from 'react'
import type { Screen } from '../app/types'
import { useAuth } from '../hooks/useAuth'

interface RecoveryPageProps {
  onNavigate: (screen: Screen) => void
}

export function RecoveryPage({ onNavigate }: RecoveryPageProps) {
  const { resetPassword, updatePassword, session, isPasswordRecovery, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const showPasswordForm = Boolean(session) && isPasswordRecovery

  async function handleRecoverySubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('Sua senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmation) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(newPassword)
      setSuccess('Senha atualizada com sucesso.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível atualizar sua senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">Recuperação</span>
        <h1>Volte a acessar sua conta.</h1>
        <p>Informe seu e-mail ou defina uma nova senha a partir do link recebido.</p>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-head">
          <span className="section-label">Acesso</span>
          <h2>{showPasswordForm ? 'Criar nova senha' : 'Esqueci minha senha'}</h2>
          <p>{showPasswordForm ? 'Escolha uma senha nova para continuar estudando.' : 'Enviaremos um link seguro para o seu e-mail.'}</p>
        </div>
        {!isConfigured && <p className="auth-notice">A autenticação ainda precisa ser configurada no ambiente.</p>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {success && <p className="form-message success" role="status">{success}</p>}
        {showPasswordForm ? (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <label className="field">
              <span>Nova senha</span>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="Mínimo de 6 caracteres" />
            </label>
            <label className="field">
              <span>Confirmar nova senha</span>
              <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Repita sua nova senha" />
            </label>
            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Salvando…' : 'Atualizar senha'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRecoverySubmit}>
            <label className="field">
              <span>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@exemplo.com" />
            </label>
            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar recuperação'}
            </button>
          </form>
        )}
        <div className="auth-links">
          <button className="link-button" onClick={() => onNavigate('login')}>Voltar para entrar</button>
          <button className="link-button" onClick={() => onNavigate('signup')}>Criar uma conta</button>
        </div>
      </div>
    </section>
  )
}
