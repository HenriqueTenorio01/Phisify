export function StatsGrid({ stats }: { stats: Array<[string, string, string?]> }) {
  return <div className="stat-grid">{stats.map(([label, value, detail]) => <div className="stat" key={label}><small>{label}</small><strong>{value}</strong>{detail && <span>{detail}</span>}</div>)}</div>
}
