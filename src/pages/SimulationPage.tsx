import { labById } from '../../simulations/registry'
import { useApp } from '../app/context'
import { SimulationView } from '../components/laboratory/SimulationView'
export function SimulationPage() { const { route, navigate } = useApp(); const lab = labById(route.labId); return <section className="screen active"><div className="sim-header"><div><div className="course-crumb"><button onClick={() => navigate('lab')}>Laboratório</button><span>/</span><span>{lab.area}</span></div><h1>{lab.title}</h1><p>{lab.description}</p></div><button className="btn" onClick={() => navigate('lab')}>← Todas as experiências</button></div><SimulationView id={lab.id} /></section> }
