import { useMemo, useState } from 'react'
import { Encabezado } from './components/Encabezado'
import { FormularioPrestamo } from './components/FormularioPrestamo'
import { ListaEquipos } from './components/ListaEquipos'
import { TablaPrestamos } from './components/TablaPrestamos'
import type { Equipo, Prestamo } from './types'

const equiposIniciales: Equipo[] = [
  { id: 101, nombre: 'Laptop Dell Latitude', categoria: 'Laptop', disponible: false },
  { id: 102, nombre: 'Laptop Lenovo ThinkPad', categoria: 'Laptop', disponible: true },
  { id: 103, nombre: 'Laptop HP ProBook', categoria: 'Laptop', disponible: true },
  { id: 201, nombre: 'Proyector Epson', categoria: 'Proyector', disponible: true },
  { id: 202, nombre: 'Proyector BenQ', categoria: 'Proyector', disponible: true },
  { id: 203, nombre: 'Proyector ViewSonic', categoria: 'Proyector', disponible: true },
  { id: 301, nombre: 'Router TP-Link Archer', categoria: 'Router', disponible: true },
  { id: 302, nombre: 'Router MikroTik hAP', categoria: 'Router', disponible: true },
  { id: 303, nombre: 'Router Cisco RV', categoria: 'Router', disponible: true },
]

const prestamosIniciales: Prestamo[] = [
  {
    id: 1,
    equipoId: 101,
    solicitante: 'Usuario de demostración',
    carne: '1111-11-11111',
    fechaPrestamo: '2026-10-18T16:00:00.000Z',
    fechaLimite: '2026-10-20T23:59:59.000Z',
    devuelto: false,
  },
]

type Vista = 'inventario' | 'prestamos'

function App() {
  const [equipos, setEquipos] = useState(equiposIniciales)
  const [prestamos, setPrestamos] = useState(prestamosIniciales)
  const [vista, setVista] = useState<Vista>('inventario')
  const [categoria, setCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [devolviendoId, setDevolviendoId] = useState<number | null>(null)

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
  const prestamosActivos = prestamos.filter((prestamo) => !prestamo.devuelto)

  function abrirFormulario(id: number) {
    const equipo = equipos.find((item) => item.id === id)
    if (equipo) setEquipoSeleccionado(equipo)
  }

  async function guardarPrestamo(datos: {
    solicitante: string
    carne: string
    fechaLimite: string
  }) {
    if (!equipoSeleccionado) return
    setGuardando(true)
    try {
      const nuevoPrestamo: Prestamo = {
        id: Math.max(0, ...prestamos.map((prestamo) => prestamo.id)) + 1,
        equipoId: equipoSeleccionado.id,
        solicitante: datos.solicitante,
        carne: datos.carne,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(`${datos.fechaLimite}T23:59:59`).toISOString(),
        devuelto: false,
      }
      setPrestamos((actuales) => [...actuales, nuevoPrestamo])
      setEquipos((actuales) =>
        actuales.map((equipo) =>
          equipo.id === equipoSeleccionado.id ? { ...equipo, disponible: false } : equipo,
        ),
      )
      setEquipoSeleccionado(null)
    } finally {
      setGuardando(false)
    }
  }

  function devolverPrestamo(prestamo: Prestamo) {
    setDevolviendoId(prestamo.id)
    setPrestamos((actuales) =>
      actuales.map((item) =>
        item.id === prestamo.id ? { ...item, devuelto: true } : item,
      ),
    )
    setEquipos((actuales) =>
      actuales.map((equipo) =>
        equipo.id === prestamo.equipoId ? { ...equipo, disponible: true } : equipo,
      ),
    )
    setDevolviendoId(null)
  }

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

        {vista === 'inventario' ? (
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
