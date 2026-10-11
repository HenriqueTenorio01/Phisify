import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Accessibility,
  Bell,
  Check,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Shield,
  SlidersHorizontal,
  Sun,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { Screen } from '../app/types'
import { usePreferences } from '../app/PreferencesProvider'
import type {
  ContrastPreference,
  DensityPreference,
  TextSizePreference,
  ThemePreference,
  UserPreferences,
} from '../app/preferences'
import { useAuth } from '../hooks/useAuth'

type SettingsSection = 'general' | 'appearance' | 'personalization' | 'privacy' | 'accessibility' | 'account' | 'notifications'

interface SettingsPageProps {
  onNavigate: (screen: Screen) => void
}

interface NavigationItem {
  id: SettingsSection
  label: string
  description: string
  icon: LucideIcon
}

const navigationItems: NavigationItem[] = [
  { id: 'general', label: 'Geral', description: 'Preferências básicas', icon: SlidersHorizontal },
  { id: 'appearance', label: 'Aparência', description: 'Tema e contraste', icon: Palette },
  { id: 'personalization', label: 'Personalização', description: 'Como o Phisify se comporta', icon: SlidersHorizontal },
  { id: 'privacy', label: 'Privacidade e dados', description: 'O que fica armazenado', icon: Shield },
  { id: 'accessibility', label: 'Acessibilidade', description: 'Leitura e movimento', icon: Accessibility },
  { id: 'account', label: 'Conta', description: 'Seus dados de acesso', icon: UserRound },
  { id: 'notifications', label: 'Notificações', description: 'Preferências futuras', icon: Bell },
]

const themeOptions: Array<{ value: ThemePreference; label: string; description: string; icon: LucideIcon }> = [
  { value: 'dark', label: 'Escuro', description: 'A identidade noturna do Phisify', icon: Moon },
  { value: 'light', label: 'Claro', description: 'Leitura luminosa e confortável', icon: Sun },
  { value: 'system', label: 'Sistema', description: 'Acompanha seu dispositivo', icon: Monitor },
]

function formatAccountDate(value: string | undefined) {
  if (!value) return 'Data indisponível'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date)
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="settings-section-head">
      <span className="section-label">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

function SettingRow({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div className="setting-row-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.8} /></div>
      <div className="setting-row-copy"><strong>{title}</strong><span>{description}</span></div>
      <div className="setting-row-control">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange?: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={'settings-toggle' + (disabled ? ' is-disabled' : '')}>
      <span className="sr-only">{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} aria-label={label} onChange={(event) => onChange?.(event.target.checked)} />
      <span className="toggle-track" aria-hidden="true"><span /></span>
    </label>
  )
}

function ComingSoon() {
  return <span className="settings-badge">Em breve</span>
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { preferences, updatePreference } = usePreferences()
  const { profile, user, updateFullName, signOut } = useAuth()
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => setFullName(profile?.full_name ?? ''), [profile?.full_name])

  function setPreference<Key extends keyof UserPreferences>(key: Key, value: UserPreferences[Key]) {
    updatePreference(key, value)
    setMessage('Preferência salva neste dispositivo.')
    setError('')
  }

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

  async function handleSignOut() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await signOut()
      onNavigate('home')
    } finally {
      setLoggingOut(false)
    }
  }

  const fullNameFallback = profile?.full_name || user?.email?.split('@')[0] || 'Estudante'
  const avatar = profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : fullNameFallback.slice(0, 1).toUpperCase()

  return (
    <section className="settings-page">
      <header className="settings-page-head">
        <div><span className="eyebrow">Conta Phisify</span><h1>Configurações</h1><p className="page-intro">Ajuste sua experiência de estudo, privacidade e acessibilidade.</p></div>
        <button className="btn" type="button" onClick={() => onNavigate('profile')}>Voltar ao perfil</button>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Categorias de configurações">
          <span className="settings-nav-title">Preferências</span>
          {navigationItems.map(({ id, label, description, icon: Icon }) => (
            <button className={'settings-nav-item' + (activeSection === id ? ' active' : '')} type="button" key={id} onClick={() => setActiveSection(id)} aria-current={activeSection === id ? 'page' : undefined}>
              <span className="settings-nav-icon"><Icon size={17} strokeWidth={1.8} /></span>
              <span><strong>{label}</strong><small>{description}</small></span>
            </button>
          ))}
        </nav>

        <div className="settings-main">
          {message && <p className="form-message success settings-feedback" role="status"><Check size={15} />{message}</p>}
          {error && <p className="form-message error settings-feedback" role="alert">{error}</p>}

          {activeSection === 'general' && (
            <section className="settings-section" aria-labelledby="settings-general-title">
              <SectionHeader eyebrow="Geral" title="Preferências gerais" description="Configurações básicas para manter o Phisify do seu jeito." />
              <div className="settings-card">
                <SettingRow icon={SlidersHorizontal} title="Idioma" description="O conteúdo disponível atualmente está em português do Brasil.">
                  <select className="settings-select" value="pt-BR" disabled aria-label="Idioma"><option value="pt-BR">Português (Brasil)</option></select>
                </SettingRow>
                <SettingRow icon={UserRound} title="Dados da conta" description="Nome, e-mail e segurança ficam na seção Conta.">
                  <button className="settings-link-button" type="button" onClick={() => setActiveSection('account')}>Abrir conta</button>
                </SettingRow>
              </div>
              <p className="settings-note-text">Mais idiomas poderão ser adicionados quando a tradução do conteúdo estiver disponível.</p>
            </section>
          )}

          {activeSection === 'appearance' && (
            <section className="settings-section" aria-labelledby="settings-appearance-title">
              <SectionHeader eyebrow="Aparência" title="Escolha como estudar" description="A mudança é aplicada imediatamente em toda a interface e fica salva neste dispositivo." />
              <div className="settings-card theme-card">
                <div className="setting-card-title"><div><h3 id="settings-appearance-title">Tema</h3><p>Prévia visual antes de selecionar.</p></div></div>
                <div className="theme-options" role="radiogroup" aria-label="Tema da interface">
                  {themeOptions.map(({ value, label, description, icon: Icon }) => (
                    <button className={'theme-option' + (preferences.theme === value ? ' active' : '')} type="button" key={value} onClick={() => setPreference('theme', value)} role="radio" aria-checked={preferences.theme === value}>
                      <span className={'theme-preview theme-preview-' + value} aria-hidden="true"><i /><b /><em /></span>
                      <span className="theme-option-copy"><strong><Icon size={15} />{label}</strong><small>{description}</small></span>
                      {preferences.theme === value && <Check className="theme-check" size={16} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-card settings-card-spaced">
                <SettingRow icon={Accessibility} title="Contraste" description="Aumenta a legibilidade de textos e limites dos controles.">
                  <select className="settings-select" value={preferences.contrast} onChange={(event) => setPreference('contrast', event.target.value as ContrastPreference)} aria-label="Contraste"><option value="standard">Padrão</option><option value="high">Alto contraste</option></select>
                </SettingRow>
              </div>
            </section>
          )}

          {activeSection === 'personalization' && (
            <section className="settings-section" aria-labelledby="settings-personalization-title">
              <SectionHeader eyebrow="Personalização" title="Seu ritmo, suas escolhas" description="Ajustes de interface que não alteram seu progresso ou os conteúdos de Física." />
              <div className="settings-card" id="settings-personalization-title">
                <SettingRow icon={SlidersHorizontal} title="Densidade da interface" description="Escolha entre mais respiro ou mais informação na tela.">
                  <select className="settings-select" value={preferences.density} onChange={(event) => setPreference('density', event.target.value as DensityPreference)} aria-label="Densidade da interface"><option value="comfortable">Confortável</option><option value="compact">Compacta</option></select>
                </SettingRow>
                <SettingRow icon={Accessibility} title="Animações" description="Reduz movimentos e transições para uma navegação mais calma.">
                  <Toggle label="Reduzir animações" checked={preferences.motion === 'reduced'} onChange={(checked) => setPreference('motion', checked ? 'reduced' : 'standard')} />
                </SettingRow>
                <SettingRow icon={Palette} title="Efeitos visuais" description="Controla brilhos, desfoques e elementos decorativos da interface.">
                  <Toggle label="Reduzir efeitos visuais" checked={preferences.effects === 'reduced'} onChange={(checked) => setPreference('effects', checked ? 'reduced' : 'standard')} />
                </SettingRow>
              </div>
              <p className="settings-note-text">Essas preferências são locais e não alteram as simulações ou os resultados dos exercícios.</p>
            </section>
          )}

          {activeSection === 'privacy' && (
            <section className="settings-section" aria-labelledby="settings-privacy-title">
              <SectionHeader eyebrow="Privacidade e dados" title="Você sabe o que fica salvo" description="Transparência sobre os dados usados para manter sua experiência no Phisify." />
              <div className="settings-card data-list" id="settings-privacy-title">
                <div className="data-item"><span className="data-item-icon"><UserRound size={16} /></span><div><strong>Dados da conta</strong><p>Nome, e-mail e data de criação são fornecidos pelo Supabase Auth e pelo seu perfil.</p></div></div>
                <div className="data-item"><span className="data-item-icon"><Check size={16} /></span><div><strong>Progresso de estudos</strong><p>As respostas, aulas concluídas e histórico atuais ficam no armazenamento deste dispositivo.</p></div></div>
                <div className="data-item"><span className="data-item-icon"><Palette size={16} /></span><div><strong>Preferências</strong><p>Tema, densidade, movimento e acessibilidade são salvos localmente neste navegador.</p></div></div>
              </div>
              <div className="settings-card settings-card-spaced privacy-actions"><div><h3>Solicitar exclusão da conta</h3><p>A exclusão segura exige uma operação administrativa no backend e ainda não está disponível nesta versão.</p></div><button className="btn" type="button" disabled><Trash2 size={15} /> Solicitar exclusão</button></div>
              <div className="settings-card settings-card-spaced privacy-actions"><div><h3>Sair de todos os dispositivos</h3><p>O controle global de sessões ainda precisa ser exposto pelo backend do Phisify.</p></div><ComingSoon /></div>
            </section>
          )}

          {activeSection === 'accessibility' && (
            <section className="settings-section" aria-labelledby="settings-accessibility-title">
              <SectionHeader eyebrow="Acessibilidade" title="Mais conforto para aprender" description="Ajustes visuais e de movimento aplicados imediatamente em toda a plataforma." />
              <div className="settings-card" id="settings-accessibility-title">
                <SettingRow icon={Accessibility} title="Tamanho da interface" description="Aumenta textos e medidas base para facilitar a leitura.">
                  <select className="settings-select" value={preferences.textSize} onChange={(event) => setPreference('textSize', event.target.value as TextSizePreference)} aria-label="Tamanho da interface"><option value="standard">Padrão</option><option value="large">Aumentado</option></select>
                </SettingRow>
                <SettingRow icon={Accessibility} title="Movimento reduzido" description="Respeita a preferência de movimento reduzido do sistema quando escolhida.">
                  <Toggle label="Ativar movimento reduzido" checked={preferences.motion === 'reduced'} onChange={(checked) => setPreference('motion', checked ? 'reduced' : 'standard')} />
                </SettingRow>
                <div className="accessibility-hint"><strong>Foco visível</strong><span>Os controles do Phisify mantêm uma borda de foco clara para navegação por teclado.</span></div>
              </div>
            </section>
          )}

          {activeSection === 'account' && (
            <section className="settings-section" aria-labelledby="settings-account-title">
              <SectionHeader eyebrow="Conta" title="Seus dados de acesso" description="Atualize o nome usado no Phisify e gerencie sua sessão." />
              <div className="settings-card account-settings-identity" id="settings-account-title"><div className="settings-avatar" aria-hidden="true">{avatar}</div><div><strong>{fullNameFallback}</strong><span>{user?.email ?? profile?.email ?? 'E-mail não disponível'}</span></div><small>Conta criada em {formatAccountDate(user?.created_at)}</small></div>
              <form className="settings-card settings-form settings-card-spaced" onSubmit={handleSubmit}>
                <div className="setting-card-title"><div><h3>Dados pessoais</h3><p>O nome é atualizado no seu perfil do Supabase.</p></div></div>
                <label className="field"><span>Nome</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>
                <label className="field"><span>E-mail</span><input value={user?.email ?? ''} disabled aria-describedby="settings-email-note" /></label>
                <p className="quiet" id="settings-email-note">A troca de e-mail depende do fluxo de atualização do Supabase Auth.</p>
                <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
              </form>
              <div className="settings-card settings-card-spaced account-actions-card"><SettingRow icon={KeyRound} title="Senha" description="Receba um link seguro para definir uma nova senha."><button className="settings-link-button" type="button" onClick={() => onNavigate('recovery')}>Redefinir senha</button></SettingRow><div className="setting-row-danger"><div><strong>Encerrar sessão</strong><span>Remove a sessão deste dispositivo.</span></div><button className="btn" type="button" onClick={handleSignOut} disabled={loggingOut}><LogOut size={15} />{loggingOut ? 'Saindo…' : 'Sair da conta'}</button></div></div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="settings-section" aria-labelledby="settings-notifications-title">
              <SectionHeader eyebrow="Notificações" title="Fique no controle" description="A área está pronta para receber notificações quando o serviço existir no backend." />
              <div className="settings-card" id="settings-notifications-title">
                <SettingRow icon={Bell} title="Lembretes de estudo" description="Avisos para manter uma rotina constante."><Toggle label="Lembretes de estudo" checked={false} disabled /></SettingRow>
                <SettingRow icon={Bell} title="Recomendações de estudo" description="Sugestões baseadas no seu progresso."><Toggle label="Recomendações de estudo" checked={false} disabled /></SettingRow>
                <SettingRow icon={Bell} title="Atualizações do Phisify" description="Novos conteúdos e melhorias da plataforma."><Toggle label="Atualizações do Phisify" checked={false} disabled /></SettingRow>
              </div>
              <p className="settings-note-text">Nenhuma notificação é enviada atualmente. Esses controles ficarão ativos quando o serviço de notificações for implementado.</p>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}


