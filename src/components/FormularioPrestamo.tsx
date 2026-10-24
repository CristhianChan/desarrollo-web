import { useState, type FormEvent } from 'react'
import type { Equipo, Prestamo } from '../types'

interface DatosPrestamo {
  solicitante: string
  carne: string
  fechaLimite: string
}

type CampoFormulario = keyof DatosPrestamo
type ErroresFormulario = Partial<Record<CampoFormulario, string>>

interface FormularioPrestamoProps {
  equipo: Equipo
  prestamos: Prestamo[]
  enviando: boolean
  onClose: () => void
  onGuardar: (datos: DatosPrestamo) => Promise<void>
}

function fechaLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizarCarne(carne: string): string {
  return carne.replace(/\D/g, '')
}

export function FormularioPrestamo({
  equipo,
  prestamos,
  enviando,
  onClose,
  onGuardar,
}: FormularioPrestamoProps) {
  const [datos, setDatos] = useState<DatosPrestamo>({
    solicitante: '',
    carne: '',
    fechaLimite: '',
  })
  const [errores, setErrores] = useState<ErroresFormulario>({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const hoy = fechaLocal(new Date())
  const maximo = new Date()
  maximo.setDate(maximo.getDate() + 3)
  const fechaMaxima = fechaLocal(maximo)

  function cambiarCampo(campo: CampoFormulario, valor: string) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
    setErrorEnvio('')
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nuevosErrores: ErroresFormulario = {}

    if (datos.solicitante.trim().length < 5) {
      nuevosErrores.solicitante = 'Escribe al menos 5 caracteres.'
    }
    if (!/^\d{4}-\d{2}-\d{5}$/.test(datos.carne)) {
      nuevosErrores.carne = 'Usa el formato 0000-00-00000.'
    } else if (
      prestamos.some(
        (prestamo) =>
          !prestamo.devuelto &&
          normalizarCarne(prestamo.carne) === normalizarCarne(datos.carne),
      )
    ) {
      nuevosErrores.carne = 'Este carné ya tiene un préstamo activo.'
    }
    if (!datos.fechaLimite) {
      nuevosErrores.fechaLimite = 'Selecciona una fecha límite.'
    } else if (datos.fechaLimite < hoy || datos.fechaLimite > fechaMaxima) {
      nuevosErrores.fechaLimite = 'La fecha debe estar entre hoy y los próximos 3 días.'
    }

    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setErrorEnvio('')
    try {
      await onGuardar({
        solicitante: datos.solicitante.trim(),
        carne: datos.carne,
        fechaLimite: datos.fechaLimite,
      })
    } catch (error) {
      setErrorEnvio(
        error instanceof Error ? error.message : 'No se pudo registrar el préstamo.',
      )
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !enviando) onClose()
      }}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <div className="modal-card__header">
          <div>
            <span className="section-kicker">NUEVO REGISTRO</span>
            <h2 id="form-title">Registrar préstamo</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Cerrar formulario"
            onClick={onClose}
            disabled={enviando}
          >
            ×
          </button>
        </div>
        <div className="selected-equipment">
          <span className="selected-equipment__icon" aria-hidden="true">▣</span>
          <span>
            <strong>{equipo.nombre}</strong>
            <small>{equipo.categoria}</small>
          </span>
        </div>
        <form className="loan-form" onSubmit={enviarFormulario} noValidate>
          <label className="form-field" htmlFor="solicitante">
            <span>Nombre del solicitante</span>
            <input
              id="solicitante"
              autoFocus
              value={datos.solicitante}
              onChange={(event) => cambiarCampo('solicitante', event.target.value)}
              placeholder="Nombre y apellido"
              aria-invalid={Boolean(errores.solicitante)}
              aria-describedby={errores.solicitante ? 'solicitante-error' : undefined}
            />
            {errores.solicitante && (
              <small className="field-error" id="solicitante-error">{errores.solicitante}</small>
            )}
          </label>
          <label className="form-field" htmlFor="carne">
            <span>Carné</span>
            <input
              id="carne"
              value={datos.carne}
              onChange={(event) => cambiarCampo('carne', event.target.value)}
              placeholder="0000-00-00000"
              inputMode="numeric"
              aria-invalid={Boolean(errores.carne)}
              aria-describedby={errores.carne ? 'carne-error' : undefined}
            />
            {errores.carne && (
              <small className="field-error" id="carne-error">{errores.carne}</small>
            )}
          </label>
          <label className="form-field" htmlFor="fechaLimite">
            <span>Fecha límite de devolución</span>
            <input
              id="fechaLimite"
              type="date"
              min={hoy}
              max={fechaMaxima}
              value={datos.fechaLimite}
              onChange={(event) => cambiarCampo('fechaLimite', event.target.value)}
              aria-invalid={Boolean(errores.fechaLimite)}
              aria-describedby={errores.fechaLimite ? 'fecha-error' : undefined}
            />
            {errores.fechaLimite && (
              <small className="field-error" id="fecha-error">{errores.fechaLimite}</small>
            )}
            <small className="field-hint">Máximo de préstamo: 3 días.</small>
          </label>
          {errorEnvio && <p className="form-submit-error" role="alert">{errorEnvio}</p>}
          <div className="form-actions">
            <button className="button button--quiet" type="button" onClick={onClose} disabled={enviando}>
              Cancelar
            </button>
            <button className="button button--primary" type="submit" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Confirmar préstamo'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
