import { useEffect, useMemo, useState } from 'react'
import { Encabezado } from './components/Encabezado'
import { FormularioPrestamo } from './components/FormularioPrestamo'
import { ListaEquipos } from './components/ListaEquipos'
import { TablaPrestamos } from './components/TablaPrestamos'
import { useEquipos } from './hooks/useEquipos'
import {
  devolverPrestamoConEquipo,
  obtenerPrestamosActivos,
  registrarPrestamoConEquipo,
} from './services/api'
import type { Equipo, NuevoPrestamo, Prestamo } from './types'

const TITULO_APLICACION = 'Préstamos Lab — 0902-23-2280'

type Vista = 'inventario' | 'prestamos'

function App() {
  const {
    equipos,
    cargando: cargandoEquipos,
    error: errorEquipos,
    reintentar: reintentarEquipos,
    actualizarDisponibilidad,
  } = useEquipos()
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [cargandoPrestamos, setCargandoPrestamos] = useState(true)
  const [errorPrestamos, setErrorPrestamos] = useState<string | null>(null)
  const [intentoPrestamos, setIntentoPrestamos] = useState(0)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [vista, setVista] = useState<Vista>('inventario')
  const [categoria, setCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [devolviendoId, setDevolviendoId] = useState<number | null>(null)

  useEffect(() => {
    document.title = TITULO_APLICACION
  }, [])

  useEffect(() => {
    let activo = true
    obtenerPrestamosActivos()
      .then((datos) => {
        if (activo) setPrestamos(datos)
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorPrestamos(
            error instanceof Error ? error.message : 'No se pudieron cargar los préstamos.',
          )
        }
      })
      .finally(() => {
        if (activo) setCargandoPrestamos(false)
      })

    return () => {
      activo = false
    }
  }, [intentoPrestamos])

  const categorias = useMemo(
    () => [...new Set(equipos.map((equipo) => equipo.categoria))].sort(),
    [equipos],
  )
  const equiposFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase()
    return equipos.filter((equipo) => {
      const coincideCategoria = categoria === 'Todas' || equipo.categoria === categoria
      const coincideNombre = equipo.nombre.toLocaleLowerCase().includes(termino)
      return coincideCategoria && coincideNombre
    })
  }, [busqueda, categoria, equipos])
  const prestamosActivos = useMemo(
    () => prestamos.filter((prestamo) => !prestamo.devuelto),
    [prestamos],
  )

  function abrirFormulario(id: number) {
    const equipo = equipos.find((item) => item.id === id)
    if (equipo?.disponible) setEquipoSeleccionado(equipo)
  }

  async function guardarPrestamo(datos: {
    solicitante: string
    carne: string
    fechaLimite: string
  }) {
    if (!equipoSeleccionado) return
    setGuardando(true)
    setErrorAccion(null)
    try {
      const nuevoPrestamo: NuevoPrestamo = {
        equipoId: equipoSeleccionado.id,
        solicitante: datos.solicitante,
        carne: datos.carne,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(`${datos.fechaLimite}T23:59:59`).toISOString(),
        devuelto: false,
      }
      const prestamoGuardado = await registrarPrestamoConEquipo(
        equipoSeleccionado.id,
        nuevoPrestamo,
      )
      setPrestamos((actuales) => [...actuales, prestamoGuardado])
      actualizarDisponibilidad(equipoSeleccionado.id, false)
      setEquipoSeleccionado(null)
    } finally {
      setGuardando(false)
    }
  }

  async function devolverPrestamo(prestamo: Prestamo) {
    setDevolviendoId(prestamo.id)
    setErrorAccion(null)
    try {
      const prestamoDevuelto = await devolverPrestamoConEquipo(
        prestamo.id,
        prestamo.equipoId,
      )
      setPrestamos((actuales) =>
        actuales.map((item) => item.id === prestamo.id ? prestamoDevuelto : item),
      )
      actualizarDisponibilidad(prestamo.equipoId, true)
    } catch (error) {
      setErrorAccion(
        error instanceof Error ? error.message : 'No se pudo registrar la devolución.',
      )
    } finally {
      setDevolviendoId(null)
    }
  }

  const errorVista = errorEquipos ?? (vista === 'prestamos' ? errorPrestamos : null)
  const cargandoVista = cargandoEquipos || (vista === 'prestamos' && cargandoPrestamos)

  return (
    <div className="app-shell">
      <Encabezado equipos={equipos} />
      <main className="page-content">
        <div className="page-heading">
          <div>
            <span className="section-kicker">CENTRO UNIVERSITARIO · LABORATORIO</span>
            <h1>{vista === 'inventario' ? 'Inventario' : 'Préstamos activos'}</h1>
            <p className="page-heading__description">
              {vista === 'inventario'
                ? 'Encuentra y administra los equipos del laboratorio.'
                : 'Consulta las fechas de devolución y registra el equipo devuelto.'}
            </p>
          </div>
          <span className="date-chip">
            <span aria-hidden="true">◷</span>
            Préstamo máximo · 3 días
          </span>
        </div>

        <nav className="view-tabs" aria-label="Vistas del inventario">
          <button
            type="button"
            className={vista === 'inventario' ? 'view-tab view-tab--active' : 'view-tab'}
            aria-current={vista === 'inventario' ? 'page' : undefined}
            onClick={() => setVista('inventario')}
          >
            Inventario <span className="tab-count">{equipos.length}</span>
          </button>
          <button
            type="button"
            className={vista === 'prestamos' ? 'view-tab view-tab--active' : 'view-tab'}
            aria-current={vista === 'prestamos' ? 'page' : undefined}
            onClick={() => setVista('prestamos')}
          >
            Préstamos activos <span className="tab-count">{prestamosActivos.length}</span>
          </button>
        </nav>

        {cargandoVista ? (
          <div className="loading-panel" role="status">
            <span className="loading-spinner" />
            Cargando información del laboratorio…
          </div>
        ) : errorVista ? (
          <div className="error-panel" role="alert">
            <span className="error-panel__icon" aria-hidden="true">!</span>
            <div>
              <h2>No se pudo cargar la información</h2>
              <p>{errorVista}</p>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  if (errorEquipos) reintentarEquipos()
                  if (vista === 'prestamos' && errorPrestamos) {
                    setCargandoPrestamos(true)
                    setErrorPrestamos(null)
                    setIntentoPrestamos((actual) => actual + 1)
                  }
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : vista === 'inventario' ? (
          <section aria-label="Inventario de equipos">
            <div className="inventory-toolbar">
              <label className="search-box" htmlFor="buscar-equipo">
                <span aria-hidden="true">⌕</span>
                <input
                  id="buscar-equipo"
                  type="search"
                  placeholder="Buscar un equipo..."
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                />
                <kbd>⌘ K</kbd>
              </label>
              <label className="category-select" htmlFor="filtrar-categoria">
                <span className="filter-icon" aria-hidden="true">☷</span>
                <select
                  id="filtrar-categoria"
                  value={categoria}
                  onChange={(event) => setCategoria(event.target.value)}
                >
                  <option value="Todas">Todas las categorías</option>
                  {categorias.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <span aria-hidden="true">⌄</span>
              </label>
            </div>
            <div className="results-heading">
              <h2>Equipos del laboratorio</h2>
              <span>{equiposFiltrados.length} resultados</span>
            </div>
            <ListaEquipos equipos={equiposFiltrados} onPrestar={abrirFormulario} />
          </section>
        ) : (
          <section aria-label="Préstamos activos">
            <div className="results-heading results-heading--loans">
              <div>
                <h2>Registro de préstamos</h2>
                <p>El equipo vuelve al inventario al confirmar la devolución.</p>
              </div>
              <span>{prestamosActivos.length} préstamos activos</span>
            </div>
            {errorAccion && <p className="action-error" role="alert">{errorAccion}</p>}
            <TablaPrestamos
              prestamos={prestamosActivos}
              equipos={equipos}
              devolviendoId={devolviendoId}
              onDevolver={devolverPrestamo}
            />
          </section>
        )}
      </main>
      <footer className="app-footer">
        <span>LAB<span>FLOW</span> · Control de equipo</span>
        <span>Laboratorio universitario</span>
      </footer>
      {equipoSeleccionado && (
        <FormularioPrestamo
          equipo={equipoSeleccionado}
          prestamos={prestamosActivos}
          enviando={guardando}
          onClose={() => setEquipoSeleccionado(null)}
          onGuardar={guardarPrestamo}
        />
      )}
    </div>
  )
}

export default App
