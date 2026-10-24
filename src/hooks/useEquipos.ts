import { useCallback, useEffect, useState } from 'react'
import type { Equipo } from '../types'
import { obtenerEquipos } from '../services/api'

interface EstadoEquipos {
  equipos: Equipo[]
  cargando: boolean
  error: string | null
  reintentar: () => void
  actualizarDisponibilidad: (id: number, disponible: boolean) => void
}

export function useEquipos(): EstadoEquipos {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)

    obtenerEquipos()
      .then((datos) => {
        if (activo) setEquipos(datos)
      })
      .catch((error: unknown) => {
        if (activo) {
          setError(
            error instanceof Error ? error.message : 'No se pudo cargar el inventario.',
          )
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento])

  const reintentar = useCallback(() => {
    setIntento((actual) => actual + 1)
  }, [])

  const actualizarDisponibilidad = useCallback((id: number, disponible: boolean) => {
    setEquipos((actuales) =>
      actuales.map((equipo) =>
        equipo.id === id ? { ...equipo, disponible } : equipo,
      ),
    )
  }, [])

  return { equipos, cargando, error, reintentar, actualizarDisponibilidad }
}
