import { useEffect, useMemo, useRef, useState } from 'react'
import { labById } from '../../../simulations/registry'
import type { LabId } from '../../app/types'

const fmt = (value: number, digits = 2) => value.toFixed(digits).replace('.', ',')

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return <label className="sim-slider"><span><b>{label}</b><strong>{fmt(value, step < 1 ? 1 : 0)} {unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /><small><i>{min}</i><i>{max} {unit}</i></small></label>
}

function ProjectileSimulation() {
  const [speed, setSpeed] = useState(20)
  const [angle, setAngle] = useState(45)
  const [gravity, setGravity] = useState(9.8)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const raf = useRef<number | null>(null)
  const p = useMemo(() => {
    const a = angle * Math.PI / 180
    const t = 2 * speed * Math.sin(a) / gravity
    return { a, t, range: speed ** 2 * Math.sin(2 * a) / gravity, h: speed ** 2 * Math.sin(a) ** 2 / (2 * gravity) }
  }, [speed, angle, gravity])
  const t = Math.min(time, p.t)
  const x = speed * Math.cos(p.a) * t
  const y = Math.max(0, speed * Math.sin(p.a) * t - .5 * gravity * t ** 2)
  const vx = speed * Math.cos(p.a)
  const vy = speed * Math.sin(p.a) - gravity * t
  const v = Math.hypot(vx, vy)
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(.04, (now - last) / 1000); last = now
      setTime(old => { const next = old + dt; if (next >= p.t) { setPlaying(false); return p.t } return next })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current) }
  }, [playing, p.t])
  const plot = { l: 60, r: 760, t: 55, b: 365 }
  const sx = (plot.r - plot.l) / Math.max(p.range, 1)
  const sy = (plot.b - plot.t) / Math.max(p.h, 1)
  const pt = (xx: number, yy: number) => ({ x: plot.l + xx * sx, y: plot.b - yy * sy })
  const path = Array.from({ length: 120 }, (_, i) => { const tt = p.t * i / 119; const yy = Math.max(0, speed * Math.sin(p.a) * tt - .5 * gravity * tt ** 2); const q = pt(speed * Math.cos(p.a) * tt, yy); return `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}` }).join(' ')
  const q = pt(x, y)
  const vxEnd = pt(x + vx * .45, y)
  const vyEnd = pt(x, y + vy * .45)
  const reset = () => { setPlaying(false); setTime(0) }
  return <section className="pro-sim projectile-pro" aria-label="Simulação realista de lançamento oblíquo">
    <div className="pro-main">
      <div className="pro-stage projectile-stage-pro">
        <div className="pro-stage-head"><span>LANÇAMENTO OBLÍQUO</span><b>g = {fmt(gravity, 1)} m/s²</b></div>
        <svg viewBox="0 0 820 420" className="pro-svg" role="img" aria-label="Trajetória parabólica sob gravidade uniforme">
          <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07182b"/><stop offset="1" stopColor="#0b2330"/></linearGradient><linearGradient id="ground" x1="0" x2="1"><stop stopColor="#0b5147"/><stop offset="1" stopColor="#0b3030"/></linearGradient><marker id="arr-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#19d3e6"/></marker></defs>
          <rect x="0" y="0" width="820" height="420" rx="16" fill="url(#sky)"/><path d="M0 366H820V420H0Z" fill="url(#ground)"/><path d="M0 366H820" stroke="#6c9b8e" strokeWidth="2"/>
          {Array.from({length:9},(_,i)=><line key={i} x1={60+i*85} y1="366" x2={60+i*85} y2="372" stroke="#78908e"/>)}
          <path d={path} fill="none" stroke="#2f6072" strokeWidth="10" opacity=".28"/><path d={path} fill="none" stroke="#19d3e6" strokeWidth="3" strokeDasharray="8 8" opacity=".72"/>
          <circle cx={q.x} cy={q.y} r="12" fill="#ffd15c"/><circle cx={q.x} cy={q.y} r="22" fill="#ffd15c" opacity=".12"/>
          <line x1={q.x} y1={q.y} x2={vxEnd.x} y2={vxEnd.y} stroke="#19d3e6" strokeWidth="3" markerEnd="url(#arr-p)"/><line x1={q.x} y1={q.y} x2={vyEnd.x} y2={vyEnd.y} stroke="#ff7b7b" strokeWidth="3" markerEnd="url(#arr-p)"/>
          <text x="26" y="32" fill="#91a9b7" fontSize="12">y</text><text x="790" y="392" fill="#91a9b7" fontSize="12">x</text><text x="76" y="391" fill="#7fa59a" fontSize="11">origem</text>
          <text x="90" y="88" fill="#a9c3cf" fontSize="12">trajetória prevista</text><text x={q.x+18} y={q.y-18} fill="#fff" fontSize="12" fontWeight="700">objeto</text>
        </svg>
        <div className="pro-status"><span className={playing ? 'live' : ''}>{playing ? '● EM MOVIMENTO' : time >= p.t ? 'VOO CONCLUÍDO' : 'PRONTO PARA LANÇAR'}</span><b>t = {fmt(t)} s</b></div>
      </div>
      <div className="pro-controls"><Slider label="Velocidade inicial" value={speed} min={5} max={40} step={1} unit="m/s" onChange={v=>{setSpeed(v);reset()}}/><Slider label="Ângulo de lançamento" value={angle} min={10} max={80} step={1} unit="°" onChange={v=>{setAngle(v);reset()}}/><Slider label="Gravidade" value={gravity} min={5} max={15} step={.1} unit="m/s²" onChange={v=>{setGravity(v);reset()}}/><div className="pro-actions"><button className="pro-btn primary" onClick={()=>setPlaying(v=>!v)}>{playing?'Pausar':'Lançar'}</button><button className="pro-btn" onClick={reset}>Reiniciar</button></div></div>
    </div>
    <aside className="pro-side"><div className="side-kicker">LEITURA FÍSICA</div><div className="metric"><span>Posição x</span><b>{fmt(x)} m</b></div><div className="metric"><span>Posição y</span><b>{fmt(y)} m</b></div><div className="metric"><span>Velocidade</span><b>{fmt(v)} m/s</b></div><div className="metric"><span>Alcance</span><b>{fmt(p.range)} m</b></div><div className="metric"><span>Altura máxima</span><b>{fmt(p.h)} m</b></div><div className="physics-note">Modelo ideal: sem resistência do ar, gravidade uniforme e lançamento/queda no mesmo nível.</div></aside>
  </section>
}

type WaveState={playing:boolean;time:number}
function WaveSimulation(){
  const [f,setF]=useState(1.5),[phase,setPhase]=useState(0),[amp,setAmp]=useState(1),[distance,setDistance]=useState(2),[playing,setPlaying]=useState(false),[time,setTime]=useState(0)
  const raf=useRef<number|null>(null); const c=1.5; const lambda=c/f; const k=2*Math.PI/lambda; const omega=2*Math.PI*f
  useEffect(()=>{if(!playing)return;let last=performance.now();const tick=(now:number)=>{const dt=Math.min(.04,(now-last)/1000);last=now;setTime(v=>v+dt);raf.current=requestAnimationFrame(tick)};raf.current=requestAnimationFrame(tick);return()=>{if(raf.current)cancelAnimationFrame(raf.current)}},[playing])
  const sourceA={x:2.5,y:1.7}, sourceB={x:2.5+distance,y:1.7}; const width=820,height=420, xMax=6.5,yMax=3.4; const px=(x:number)=>55+x/xMax*700,py=(y:number)=>45+y/yMax*330
  const rings=(s:{x:number,y:number},color:string,phase0:number)=><>{Array.from({length:7},(_,i)=>{const r=(i+1)*lambda;return <circle key={i} cx={px(s.x)} cy={py(s.y)} r={r/xMax*700} fill="none" stroke={color} strokeWidth="2" opacity={Math.max(.08,.46-i*.055)} strokeDasharray="4 7"/>})}</>
  const heat=Array.from({length:18},(_,iy)=>Array.from({length:34},(_,ix)=>{const x=ix/(33)*xMax,y=iy/17*yMax;const r1=Math.hypot(x-sourceA.x,y-sourceA.y),r2=Math.hypot(x-sourceB.x,y-sourceB.y);const z=amp*(Math.cos(k*r1-omega*time)+Math.cos(k*r2-omega*time+phase*Math.PI/180));return {x,y,z}})).flat()
  const central=amp*(Math.cos(k*Math.hypot((sourceA.x+sourceB.x)/2-sourceA.x,0)-omega*time)+Math.cos(k*Math.hypot((sourceA.x+sourceB.x)/2-sourceB.x,0)-omega*time+phase*Math.PI/180));
  const theoretical=2*amp*Math.abs(Math.cos(phase*Math.PI/360)); const interference=theoretical<.2?'Destrutiva':theoretical>1.8*amp*.9?'Construtiva':'Parcial'
  return <section className="pro-sim waves-pro"><div className="pro-main"><div className="pro-stage wave-stage-pro"><div className="pro-stage-head"><span>INTERFERÊNCIA DE ONDAS</span><b>v = {fmt(c,1)} m/s · λ = {fmt(lambda,2)} m</b></div><svg viewBox={`0 0 ${width} ${height}`} className="pro-svg wave-svg" role="img" aria-label="Frentes de onda circulares e padrão de interferência"><defs><radialGradient id="waveBg"><stop stopColor="#071d2c"/><stop offset="1" stopColor="#040b13"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="3"/></filter></defs><rect width={width} height={height} rx="16" fill="url(#waveBg)"/>{heat.map((p,i)=>{const z=Math.max(-1,Math.min(1,p.z/(2*amp)));return <rect key={i} x={px(p.x)-10} y={py(p.y)-10} width="21" height="21" fill={z>=0?`rgba(24,203,229,${Math.abs(z)*.20})`:`rgba(255,179,63,${Math.abs(z)*.20})`}/>})}<g filter="url(#glow)">{rings(sourceA,'#18cbe5',0)}{rings(sourceB,'#ffb43f',phase)}</g>{rings(sourceA,'#18cbe5',0)}{rings(sourceB,'#ffb43f',phase)}<line x1={px(0)} y1={py(1.7)} x2={px(xMax)} y2={py(1.7)} stroke="#7890a0" strokeDasharray="5 7" opacity=".4"/><circle cx={px(sourceA.x)} cy={py(sourceA.y)} r="10" fill="#18cbe5"/><circle cx={px(sourceB.x)} cy={py(sourceB.y)} r="10" fill="#ffb43f"/><text x={px(sourceA.x)-24} y={py(sourceA.y)-18} fill="#a8dce5" fontSize="11">A</text><text x={px(sourceB.x)-24} y={py(sourceB.y)-18} fill="#ffd89b" fontSize="11">B</text><circle cx={px((sourceA.x+sourceB.x)/2)} cy={py(1.7)} r="6" fill="#fff"/><text x={px((sourceA.x+sourceB.x)/2)+10} y={py(1.7)-8} fill="#fff" fontSize="11">Ponto de observação</text></svg><div className="wave-legend"><span><i className="cyan"/> onda A</span><span><i className="amber"/> onda B</span><span><i className="white"/> máximo/mínimo resultante</span></div></div><div className="pro-controls"><Slider label="Frequência" value={f} min={0.5} max={3} step={.1} unit="Hz" onChange={v=>{setF(v);setTime(0)}}/><Slider label="Amplitude" value={amp} min={.2} max={1.5} step={.1} unit="m" onChange={setAmp}/><Slider label="Fase relativa" value={phase} min={0} max={360} step={5} unit="°" onChange={setPhase}/><Slider label="Distância entre fontes" value={distance} min={1} max={3.5} step={.1} unit="m" onChange={setDistance}/><div className="pro-actions"><button className="pro-btn primary" onClick={()=>setPlaying(v=>!v)}>{playing?'Pausar':'Play'}</button><button className="pro-btn" onClick={()=>{setPlaying(false);setTime(0)}}>Reiniciar</button></div></div></div><aside className="pro-side"><div className="side-kicker">ANÁLISE DA ONDA</div><div className="metric"><span>Comprimento de onda</span><b>{fmt(lambda,2)} m</b></div><div className="metric"><span>Fase relativa</span><b>{phase}°</b></div><div className="metric"><span>Amplitude teórica máxima</span><b>{fmt(theoretical,2)} m</b></div><div className="metric"><span>No ponto central</span><b>{fmt(Math.abs(central),2)} m</b></div><div className="interference-pill"><span>Interferência</span><b>{interference}</b></div><div className="physics-note">Modelo: duas fontes pontuais coerentes, mesma frequência e amplitude, propagação em meio homogêneo e sem perdas. A cor mostra o sinal instantâneo da superposição.</div></aside></section>
}

function CircuitSimulation(){
 const [V,setV]=useState(12),[R,setR]=useState(6),[on,setOn]=useState(true),[time,setTime]=useState(0);const I=on?V/R:0,P=V*I,Q=I*I*R;const raf=useRef<number|null>(null)
 useEffect(()=>{if(!on)return;let last=performance.now();const tick=(now:number)=>{setTime(t=>t+Math.min(.04,(now-last)/1000));last=now;raf.current=requestAnimationFrame(tick)};raf.current=requestAnimationFrame(tick);return()=>{if(raf.current)cancelAnimationFrame(raf.current)}},[on])
 const arrows=Array.from({length:9},(_,i)=>{const x=105+i*78+(time*70)%78;return <g key={i}><circle cx={x} cy="208" r="4" fill="#18cbe5"/><path d={`M${x-14} 208h18l-5-4m5 4l-5 4`} fill="none" stroke="#18cbe5" strokeWidth="2"/></g>})
 return <section className="pro-sim circuit-pro"><div className="pro-main"><div className="pro-stage circuit-stage-pro"><div className="pro-stage-head"><span>CIRCUITO RESISTIVO</span><b>Lei de Ohm · V = R · I</b></div><svg viewBox="0 0 820 420" className="pro-svg" role="img" aria-label="Circuito série com bateria, resistor e corrente convencional"><defs><linearGradient id="circBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#07182b"/><stop offset="1" stopColor="#09110f"/></linearGradient><filter id="cglow"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="820" height="420" rx="16" fill="url(#circBg)"/><path d="M130 120H270M550 120H690V300H130V120" fill="none" stroke="#7c93a5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><path d="M270 120H325L342 92L377 148L412 92L447 148L464 120H550" fill="none" stroke="#f5fbff" strokeWidth="7" strokeLinejoin="round"/><line x1="235" y1="87" x2="235" y2="153" stroke="#18cbe5" strokeWidth="8"/><line x1="265" y1="99" x2="265" y2="141" stroke="#18cbe5" strokeWidth="8"/><circle cx="250" cy="120" r="45" fill="#18cbe5" opacity=".12" filter="url(#cglow)"/><circle cx="410" cy="120" r="35" fill="#ffb43f" opacity=".1" filter="url(#cglow)"/><text x="210" y="73" fill="#a8dce5" fontSize="13" fontWeight="700">Bateria</text><text x="370" y="73" fill="#ffd89b" fontSize="13" fontWeight="700">Resistor</text><text x="138" y="340" fill="#91a9b7" fontSize="12">corrente convencional →</text><text x="600" y="340" fill="#91a9b7" fontSize="12">circuito série</text>{arrows}<rect x="308" y="174" width="204" height="82" rx="14" fill="#07101b" stroke="#243b4c"/><text x="410" y="200" textAnchor="middle" fill="#8ca3b0" fontSize="11">POTÊNCIA DISSIPADA</text><text x="410" y="230" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700">{fmt(P,2)} W</text><text x="410" y="250" textAnchor="middle" fill="#7f97a5" fontSize="10">P = I²R</text></svg><div className="pro-status"><span className={on?'live':''}>{on?'● CIRCUITO FECHADO':'○ CIRCUITO ABERTO'}</span><b>I = {fmt(I,2)} A</b></div></div><div className="pro-controls"><Slider label="Tensão da fonte" value={V} min={3} max={24} step={1} unit="V" onChange={setV}/><Slider label="Resistência" value={R} min={2} max={20} step={1} unit="Ω" onChange={setR}/><div className="pro-actions"><button className="pro-btn primary" onClick={()=>setOn(v=>!v)}>{on?'Abrir circuito':'Fechar circuito'}</button><button className="pro-btn" onClick={()=>{setV(12);setR(6);setOn(true);setTime(0)}}>Redefinir</button></div></div></div><aside className="pro-side"><div className="side-kicker">MEDIDAS DO CIRCUITO</div><div className="metric"><span>Tensão</span><b>{V.toFixed(0)} V</b></div><div className="metric"><span>Resistência</span><b>{R.toFixed(0)} Ω</b></div><div className="metric"><span>Corrente</span><b>{fmt(I,2)} A</b></div><div className="metric"><span>Potência</span><b>{fmt(P,2)} W</b></div><div className="metric"><span>Energia em 10 s</span><b>{fmt(P*10,1)} J</b></div><div className="physics-note">Modelo ideal de circuito CC em série. A corrente é calculada por I = V/R e a potência dissipada no resistor por P = VI = I²R.</div></aside></section>
}

export function SimulationView({id}:{id:LabId}){if(id==='projectile')return <ProjectileSimulation/>;if(id==='waves')return <WaveSimulation/>;return <CircuitSimulation/>}
