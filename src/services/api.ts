import type { Equipo, NuevoPrestamo, Prestamo } from '../types'

function obtenerUrlApi(): string {
  const url = import.meta.env.VITE_API_URL?.trim()
  if (!url) {
    throw new Error('Falta configurar VITE_API_URL en el archivo .env.')
  }
  return url.replace(/\/+$/, '')
}

async function solicitar<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const url = `${obtenerUrlApi()}${ruta}`
  let respuesta: Response

  try {
    respuesta = await fetch(url, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...opciones?.headers,
      },
    })
  } catch (error) {
    const detalle = error instanceof Error ? `: ${error.message}` : ''
    throw new Error(`No se pudo conectar con la API en ${url}${detalle}`)
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(
      `La API respondió con el estado ${respuesta.status}${detalle ? `: ${detalle}` : '.'}`,
    )
  }

  return respuesta.json() as Promise<T>
}

export function obtenerEquipos(): Promise<Equipo[]> {
  return solicitar<Equipo[]>('/equipos')
}

export function obtenerPrestamosActivos(): Promise<Prestamo[]> {
  return solicitar<Prestamo[]>('/prestamos?devuelto=false')
}

export function crearPrestamo(prestamo: NuevoPrestamo): Promise<Prestamo> {
  return solicitar<Prestamo>('/prestamos', {
    method: 'POST',
    body: JSON.stringify(prestamo),
  })
}

export function actualizarEquipo(
  id: number,
  cambios: Partial<Pick<Equipo, 'disponible'>>,
): Promise<Equipo> {
  return solicitar<Equipo>(`/equipos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  })
}

export function actualizarPrestamo(
  id: number,
  cambios: Partial<Pick<Prestamo, 'devuelto'>>,
): Promise<Prestamo> {
  return solicitar<Prestamo>(`/prestamos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  })
}

export async function registrarPrestamoConEquipo(
  equipoId: number,
  prestamo: NuevoPrestamo,
): Promise<Prestamo> {
  await actualizarEquipo(equipoId, { disponible: false })
  try {
    return await crearPrestamo(prestamo)
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido.'
    try {
      await actualizarEquipo(equipoId, { disponible: true })
    } catch (errorReversion) {
      const detalleReversion =
        errorReversion instanceof Error ? errorReversion.message : 'Error desconocido.'
      throw new Error(
        `No se pudo crear el préstamo (${detalle}) y tampoco se pudo restaurar la disponibilidad del equipo (${detalleReversion}).`,
      )
    }
    throw new Error(
      `No se pudo crear el préstamo; se restauró la disponibilidad del equipo. ${detalle}`,
    )
  }
}

export async function devolverPrestamoConEquipo(
  prestamoId: number,
  equipoId: number,
): Promise<Prestamo> {
  await actualizarEquipo(equipoId, { disponible: true })
  try {
    return await actualizarPrestamo(prestamoId, { devuelto: true })
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido.'
    try {
      await actualizarEquipo(equipoId, { disponible: false })
    } catch (errorReversion) {
      const detalleReversion =
        errorReversion instanceof Error ? errorReversion.message : 'Error desconocido.'
      throw new Error(
        `No se pudo marcar la devolución (${detalle}) y tampoco se pudo restaurar el estado del equipo (${detalleReversion}).`,
      )
    }
    throw new Error(
      `No se pudo marcar la devolución; se restauró el equipo como prestado. ${detalle}`,
    )
  }
}
