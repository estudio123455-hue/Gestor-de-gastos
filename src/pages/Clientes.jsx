import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getClientes, crearCliente, actualizarCliente, eliminarCliente } from '../lib/clientes'

const Clientes = () => {
  const { user } = useAuth()

  // Estado de datos y UI
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado del modal de formulario (crear/editar)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null) // null = crear, objeto = editando
  const [formData, setFormData] = useState({ nombre: '', contacto: '', nota: '' })
  const [guardando, setGuardando] = useState(false)

  // Estado del diálogo de confirmación de eliminación
  const [eliminando, setEliminando] = useState(null)

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getClientes(user.id)
      setClientes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal para crear un nuevo cliente
  const abrirCrear = () => {
    setEditando(null)
    setFormData({ nombre: '', contacto: '', nota: '' })
    setModalOpen(true)
  }

  // Abrir modal para editar un cliente existente
  const abrirEditar = (cliente) => {
    setEditando(cliente)
    setFormData({
      nombre: cliente.nombre,
      contacto: cliente.contacto || '',
      nota: cliente.nota || '',
    })
    setModalOpen(true)
  }

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Guardar (crear o actualizar)
  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) return

    setGuardando(true)
    setError(null)
    try {
      if (editando) {
        // Actualizar cliente existente
        const actualizado = await actualizarCliente(editando.id, formData)
        setClientes(clientes.map((c) => (c.id === actualizado.id ? actualizado : c)))
      } else {
        // Crear nuevo cliente
        const nuevo = await crearCliente(user.id, formData)
        setClientes([nuevo, ...clientes])
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar cliente (después de confirmación)
  const handleEliminar = async () => {
    if (!eliminando) return

    setError(null)
    try {
      await eliminarCliente(eliminando.id)
      setClientes(clientes.filter((c) => c.id !== eliminando.id))
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
        <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
        <div className="bg-white rounded-lg shadow p-6 text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Nuevo Cliente
        </button>
      </div>

      {/* Banner de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Estado: Vacío */}
      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-lg mt-4">Aún no tienes clientes</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer cliente para empezar a gestionar tus cobros.</p>
          <button
            onClick={abrirCrear}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Crear Cliente
          </button>
        </div>
      ) : (
        // Lista de clientes
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{cliente.nombre}</h3>
                {cliente.contacto && (
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Contacto:</span> {cliente.contacto}
                  </p>
                )}
                {cliente.nota && (
                  <p className="text-gray-500 text-sm mb-1 line-clamp-2">
                    <span className="font-medium">Nota:</span> {cliente.nota}
                  </p>
                )}
                {!cliente.contacto && !cliente.nota && (
                  <p className="text-gray-400 text-sm italic">Sin información adicional</p>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => abrirEditar(cliente)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setEliminando(cliente)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de crear/editar cliente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editando ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <input
                  type="text"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  placeholder="Teléfono, email, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <textarea
                  name="nota"
                  value={formData.nota}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Información adicional..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>
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
                  disabled={guardando || !formData.nombre.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Cliente</h3>
            <p className="text-gray-600 text-sm mb-6">
              ¿Estás seguro de que deseas eliminar a <strong>{eliminando.nombre}</strong>? Esta acción no se puede deshacer.
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

export default Clientes
