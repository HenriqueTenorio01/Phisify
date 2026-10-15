import { coursesForTrack } from '../../content/catalog'
import { tracks } from '../../content/tracks'
import { useApp } from '../app/context'

export function HomePage() {
  const { selectTrack, navigate, streak } = useApp()
  return (
    <section className="screen active home-screen">
      <div className="home-hero">
        <div className="hero-copy">
          <div className="live-pill">
            <span /> Laboratório interativo disponível
          </div>
          <h1>
            A física que você <em>sente</em>, não só lê.
          </h1>
          <p>
            Escolha seu percurso de estudo ou explore os fenômenos no
            laboratório.
          </p>
          <div className="hero-actions">
            <button className="btn" onClick={() => navigate('lab')}>
              Ver simulações
            </button>
          </div>
          <p className="quiet">{streak} dias de sequência</p>
        </div>
        <div className="physics-panel">
          <div className="panel-head">
            <span>Simulação · Queda livre</span>
            <b>LAB</b>
          </div>
          <div className="experiment">
            <div className="axis" />
            <div className="orb-glow" />
            <div className="falling-orb">g</div>
            <code>g = 9,81 m/s² · t = 2,4 s</code>
          </div>
          <div className="measurement-grid">
            <div>
              <strong>9,81</strong>
              <span>gravidade</span>
            </div>
            <div>
              <strong>2,4s</strong>
              <span>tempo</span>
            </div>
            <div>
              <strong>28m</strong>
              <span>altura</span>
            </div>
          </div>
        </div>
      </div>
      <div className="section-row">
        <div>
          <div className="section-label">Trilhas de estudo</div>
          <h2>Escolha seu percurso</h2>
        </div>
      </div>
      <div className="course-cards">
        {tracks.map((track, index) => (
          <button
            className="course-card"
            key={track.id}
            onClick={() => selectTrack(track.id)}
          >
            <div className="course-card-top">
              <span>0{index + 1}</span>
              <small>
                {coursesForTrack(track.id).some((course) =>
                  course.units.some((unit) => unit.lessons.length),
                )
                  ? 'Curso disponível'
                  : 'Conteúdo em preparação'}
              </small>
            </div>
            <h3>{track.title}</h3>
            <p>{track.description}</p>
            <div className="course-card-foot">
              <span>Explorar trilha</span>
              <b aria-hidden="true">→</b>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
