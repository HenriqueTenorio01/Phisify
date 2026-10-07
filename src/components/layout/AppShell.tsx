import type { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import type { Screen } from '../../app/types'

const primary: Array<[Screen, string, string]> = [
  ['home', 'Início', '⌂'],
  ['courses', 'Trilhas', '▤'],
  ['lab', 'Laboratório', '◌'],
  ['sheets', 'Fichas', '▣'],
  ['performance', 'Desempenho', '◔'],
  ['review', 'Revisão', '↻'],
  ['search', 'Buscar', '⌕'],
]

interface AppShellProps {
  screen: Screen
  streak: number
  moreOpen: boolean
  onNavigate: (screen: Screen) => void
  onToggleMore: () => void
  onOpenAccount: () => void
  isAuthenticated: boolean
  userName: string
  children: ReactNode
}

export function AppShell({
  screen,
  streak,
  moreOpen,
  onNavigate,
  onToggleMore,
  onOpenAccount,
  isAuthenticated,
  userName,
  children,
}: AppShellProps) {
  const initial = userName.slice(0, 1).toUpperCase()

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => onNavigate('home')} aria-label="Página inicial da Phisify">
            <span className="brand-mark"><span>Φ</span><i /></span>
            <span className="brand-copy">PHISIFY<small>APRENDER EM MOVIMENTO</small></span>
          </button>
          <nav className="main-nav">
            {primary.slice(0, 5).map(([target, label]) => (
              <button key={target} className={screen === target ? 'active' : ''} onClick={() => onNavigate(target)}>
                {label}
              </button>
            ))}
          </nav>
          <div className="top-actions">
            <span className="streak"><b>{streak}</b> dias de sequência</span>
            {isAuthenticated && (
              <button
                className="settings-button"
                onClick={() => onNavigate('settings')}
                aria-label="Abrir configurações"
                title="Configurações"
              >
                <Settings size={16} aria-hidden="true" />
                <span>Configurações</span>
              </button>
            )}
            <button className="account-button" onClick={onOpenAccount} aria-label={isAuthenticated ? 'Abrir meu perfil' : 'Entrar ou criar conta'}>
              {isAuthenticated && <span className="avatar">{initial}</span>}
              <span>{isAuthenticated ? userName : 'Entrar'}</span>
            </button>
          </div>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="side-label">Navegação</div>
          {primary.map(([target, label, icon]) => (
            <button className={'side-link ' + (screen === target ? 'active' : '')} key={target} onClick={() => onNavigate(target)}>
              <span className="side-icon">{icon}</span>{label}
            </button>
          ))}
          <div className="sidebar-note"><strong>Ritmo constante</strong>Um conceito por vez. Continue sua sequência de estudos.</div>
        </aside>
        <main className="content">{children}</main>
      </div>
      <nav className="mobile-nav">
        {primary.slice(0, 3).map(([target, label, icon]) => (
          <button className={'mobile-link ' + (screen === target ? 'active' : '')} key={target} onClick={() => onNavigate(target)}>
            <span>{icon}</span>{label}
          </button>
        ))}
        <button className={'mobile-link ' + (moreOpen ? 'active' : '')} onClick={onToggleMore}><span>•••</span>Mais</button>
      </nav>
      <div className={'more-menu ' + (moreOpen ? 'open' : '')}>
        {primary.slice(3).map(([target, label]) => <button key={target} onClick={() => onNavigate(target)}>{label}</button>)}
      </div>
    </div>
  )
}


