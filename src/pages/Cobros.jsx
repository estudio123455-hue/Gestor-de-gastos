import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCobros, crearCobro, actualizarEstadoCobro, eliminarCobro } from '../lib/cobros'
import { getClientes } from '../lib/clientes'

// Formatear fecha a DD/MM/AAAA
const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

// Formatear monto como moneda
const formatearMonto = (monto) => {
  return Number(monto).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

// Obtener la fecha de hoy en formato YYYY-MM-DD para el input date
const hoy = () => new Date().toISOString().split('T')[0]

const Cobros = () => {
  const { user } = useAuth()

  const [cobros, setCobros] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado del modal de creación
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    cliente_id: '',
    monto: '',
    fecha: hoy(),
    estado: 'pendiente',
  })
  const [guardando, setGuardando] = useState(false)

  // Estado del diálogo de confirmación de eliminación
  const [eliminando, setEliminando] = useState(null)

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cobrosData, clientesData] = await Promise.all([
        getCobros(user.id),
        getClientes(user.id),
      ])
      setCobros(cobrosData)
      setClientes(clientesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal
  const abrirModal = () => {
    setFormData({ cliente_id: '', monto: '', fecha: hoy(), estado: 'pendiente' })
    setModalOpen(true)
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Guardar nuevo cobro
  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!formData.cliente_id || !formData.monto || !formData.fecha) return

    setGuardando(true)
    setError(null)
    try {
      const nuevo = await crearCobro(user.id, {
        ...formData,
        monto: parseFloat(formData.monto),
      })
      setCobros([nuevo, ...cobros])
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  // Cambiar estado a "pagado" con un clic
  const handleCambiarEstado = async (cobro) => {
    if (cobro.estado === 'pagado') return
    try {
      const actualizado = await actualizarEstadoCobro(cobro.id, 'pagado')
      setCobros(cobros.map((c) => (c.id === actualizado.id ? actualizado : c)))
    } catch (err) {
      setError(err.message)
    }
  }

  // Eliminar cobro
  const handleEliminar = async () => {
    if (!eliminando) return
    try {
      await eliminarCobro(eliminando.id)
      setCobros(cobros.filter((c) => c.id !== eliminando.id))
      setEliminando(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // --- Renderizado ---

  // Estado: Cargando
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Cobros</h2>
        <div className="bg-white rounded-lg shadow p-6 text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando cobros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Cobros</h2>
        <button
          onClick={abrirModal}
          disabled={clientes.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={clientes.length === 0 ? 'Debes crear un cliente primero' : ''}
        >
          Nuevo Cobro
        </button>
      </div>

      {/* Banner de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Estado: Sin clientes */}
      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mt-4">No hay clientes registrados</p>
          <p className="text-gray-400 text-sm mt-1">Crea un cliente primero para poder registrar cobros.</p>
        </div>
      ) : cobros.length === 0 ? (
        // Estado: Vacío (hay clientes pero no cobros)
        <div className="bg-white rounded-lg shadow p-6 text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg mt-4">Aún no tienes cobros registrados</p>
          <p className="text-gray-400 text-sm mt-1">Registra tu primer cobro para empezar a gestionarlos.</p>
          <button
            onClick={abrirModal}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Registrar Cobro
          </button>
        </div>
      ) : (
        // Lista de cobros
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cobros.map((cobro) => (
                  <tr key={cobro.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cobro.clientes?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatearMonto(cobro.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatearFecha(cobro.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer select-none ${
                          cobro.estado === 'pagado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        onClick={() => handleCambiarEstado(cobro)}
                        title={cobro.estado === 'pendiente' ? 'Haz clic para marcar como pagado' : ''}
                      >
                        {cobro.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setEliminando(cobro)}
                        className="text-red-600 hover:text-red-800 font-medium focus:outline-none transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de nuevo cobro */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuevo Cobro</h3>
            <form onSubmit={handleGuardar} className="space-y-4">
              {/* Seleccionar cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      {eliminando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Cobro</h3>
            <p className="text-gray-600 text-sm mb-6">
              ¿Estás seguro de que deseas eliminar este cobro de{' '}
              <strong>{eliminando.clientes?.nombre}</strong> por{' '}
              <strong>{formatearMonto(eliminando.monto)}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEliminando(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cobros
