import type { LabDefinition, LabId } from '../src/app/types'

export const labs: LabDefinition[] = [
  { id: 'projectile', title: 'Lançamento oblíquo', area: 'Mecânica', icon: '↗', description: 'Acompanhe uma trajetória real ao longo do tempo e compare alcance, altura, velocidade e componentes.', meta: 'play · pausa · vetores · leitura em tempo real' },
  { id: 'waves', title: 'Interferência de ondas', area: 'Ondas', icon: '∿', description: 'Veja duas ondas se propagarem, somarem-se e mudarem de resultado conforme a fase relativa.', meta: 'play · superposição · fase · onda resultante' },
  { id: 'circuit', title: 'Circuito resistivo', area: 'Eletricidade', icon: 'Ω', description: 'Observe o fluxo convencional de carga e relacione tensão, resistência, corrente e potência.', meta: 'play · fluxo de carga · valores medidos' },
]

export function labById(id: string | undefined) { return labs.find((lab) => lab.id === id) ?? labs[0] }
export function isLabId(id: string): id is LabId { return labs.some((lab) => lab.id === id) }
