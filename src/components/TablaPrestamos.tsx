import type { Equipo, Prestamo } from '../types'

interface TablaPrestamosProps {
  prestamos: Prestamo[]
  equipos: Equipo[]
  devolviendoId: number | null
  onDevolver: (prestamo: Prestamo) => void
}

function formatoFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}

export function TablaPrestamos({
  prestamos,
  equipos,
  devolviendoId,
  onDevolver,
}: TablaPrestamosProps) {
  if (prestamos.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon" aria-hidden="true">✓</span>
        <h3>Todo está al día</h3>
        <p>No hay préstamos activos en este momento.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="loans-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Solicitante</th>
            <th>Fecha límite</th>
            <th>Estado</th>
            <th><span className="visually-hidden">Acción</span></th>
          </tr>
        </thead>
        <tbody>
          {prestamos.map((prestamo) => {
            const vencido = Date.parse(prestamo.fechaLimite) < Date.now()
            const equipo = equipos.find((item) => item.id === prestamo.equipoId)

            return (
              <tr className={vencido ? 'loan-row loan-row--overdue' : 'loan-row'} key={prestamo.id}>
                <td>
                  <strong>{equipo?.nombre ?? `Equipo #${prestamo.equipoId}`}</strong>
                  <span className="table-secondary">{equipo?.categoria ?? 'Categoría desconocida'}</span>
                </td>
                <td>
                  <strong>{prestamo.solicitante}</strong>
                  <span className="table-secondary">Carné {prestamo.carne}</span>
                </td>
                <td className={vencido ? 'date-cell date-cell--overdue' : 'date-cell'}>
                  {formatoFecha(prestamo.fechaLimite)}
                </td>
                <td>
                  <span className={vencido ? 'loan-status loan-status--overdue' : 'loan-status loan-status--active'}>
                    {vencido ? 'Vencido' : 'En curso'}
                  </span>
                </td>
                <td className="table-action">
                  <button
                    className="button button--return"
                    type="button"
                    disabled={devolviendoId === prestamo.id}
                    onClick={() => onDevolver(prestamo)}
                  >
                    {devolviendoId === prestamo.id ? 'Procesando…' : 'Devolver'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
