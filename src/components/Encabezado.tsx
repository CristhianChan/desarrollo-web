import type { Equipo } from '../types'

interface EncabezadoProps {
  equipos: Equipo[]
}

export function Encabezado({ equipos }: EncabezadoProps) {
  const disponibles = equipos.filter((equipo) => equipo.disponible).length

  return (
    <header className="app-header">
      <a className="brand" href="#" aria-label="Préstamos Lab, inicio">
        <span className="brand__mark" aria-hidden="true">L</span>
        <span className="brand__name">LAB<span>FLOW</span></span>
      </a>
      <div className="app-header__meta">
        <span className="app-header__title">Préstamos Lab — 0902-23-2280</span>
        <span className="app-header__counter">
          <span className="counter-dot" />
          {disponibles} de {equipos.length} equipos disponibles
        </span>
      </div>
      <span className="profile-chip" title="Carné 0902-23-2280">0902</span>
    </header>
  )
}
