import { coursesForTrack, questionsForTrack } from '../../content/catalog'
import { useApp } from '../app/context'
import { ProgressTrack } from '../components/ui/ProgressTrack'
import { StatsGrid } from '../components/ui/StatsGrid'
export function PerformancePage() {
  const { route, progress, navigate } = useApp()
  const courses = coursesForTrack(route.trackId)
  const questionBank = questionsForTrack(route.trackId)
  const responses = Object.values(progress.responses)
  const correct = responses.filter((response) => response.correct).length
  const byTopic = courses.map((course) => {
    const qs = questionBank.filter((question) => question.course === course.id)
    const answered = qs.map((q) => progress.responses[q.id]).filter(Boolean)
    return [
      course.area,
      answered.length
        ? Math.round(
            (answered.filter((r) => r?.correct).length / answered.length) * 100,
          )
        : 0,
    ] as [string, number]
  })
  return (
    <section className="screen active">
      <div className="performance-intro">
        <div className="eyebrow">visão de aprendizagem</div>
        <h1>Seu desempenho</h1>
        <p className="page-intro">
          Use os sinais abaixo para decidir onde estudar em seguida. Progresso é
          ferramenta de diagnóstico, não nota.
        </p>
      </div>
      <StatsGrid
        stats={[
          [`questões respondidas`, String(responses.length)],
          ['acertos', String(correct)],
          [
            'aproveitamento',
            `${responses.length ? Math.round((correct / responses.length) * 100) : 0}`,
            '%',
          ],
          ['aulas concluídas', String(progress.completedLessons.length)],
        ]}
      />
      <div className="section-row">
        <h2>Domínio por área</h2>
        <span className="quiet">baseado no que você respondeu</span>
      </div>
      <div className="list mastery">
        {byTopic.map(([name, value]) => (
          <div className="mastery-row" key={name}>
            <span className="mastery-name">{name}</span>
            <ProgressTrack value={value} />
            <span className="mastery-value">{value}%</span>
          </div>
        ))}
      </div>
      <div className="diagnostic">
        <div className="diagnostic-mark" />
        <div>
          <h3>
            {questionBank.length
              ? 'Próximo passo recomendado'
              : 'Conteúdo em preparação'}
          </h3>
          <p>
            {!questionBank.length
              ? 'Novas aulas e questões deste percurso aparecerão aqui.'
              : responses.length && correct / responses.length < 0.7
                ? 'Revise os conceitos dos problemas errados antes de avançar para uma ficha difícil.'
                : 'Escolha uma questão média e explique cada hipótese antes de calcular.'}
          </p>
          <button className="btn ghost" onClick={() => navigate('review')}>
            Abrir revisão →
          </button>
        </div>
      </div>
      <div className="activity">
        <div className="section-row">
          <h2>Atividade recente</h2>
          <button className="link-button" onClick={() => navigate('courses')}>
            Ver trilha
          </button>
        </div>
        {progress.history.slice(0, 6).map((item) => (
          <div className="activity-row" key={`${item.at}-${item.label}`}>
            <span>{item.label}</span>
            <strong>
              {item.type === 'lesson' ? 'aula concluída' : 'questão respondida'}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
