import type { Equipo } from '../types'

export interface TarjetaEquipoProps {
  equipo: Equipo
  onPrestar: (id: number) => void
}

export function TarjetaEquipo({ equipo, onPrestar }: TarjetaEquipoProps) {
  return (
    <article className="equipment-card">
      <div className="equipment-card__top">
        <span className="equipment-card__category">{equipo.categoria}</span>
        <span
          className={`status-badge ${equipo.disponible ? 'status-badge--available' : 'status-badge--borrowed'}`}
        >
          <span className="status-badge__dot" />
          {equipo.disponible ? 'Disponible' : 'Prestado'}
        </span>
      </div>
      <div>
        <p className="equipment-card__eyebrow">Equipo de laboratorio</p>
        <h3>{equipo.nombre}</h3>
      </div>
      <button
        className="button button--primary equipment-card__button"
        type="button"
        disabled={!equipo.disponible}
        onClick={() => onPrestar(equipo.id)}
      >
        {equipo.disponible ? 'Prestar equipo' : 'No disponible'}
        {equipo.disponible && <span aria-hidden="true">↗</span>}
      </button>
    </article>
  )
}
