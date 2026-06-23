import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPendientesConCliente, getTotalPagadoEnMes } from '../lib/dashboard'

const formatearMonto = (monto) =>
  Number(monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

const Dashboard = () => {
  const { user } = useAuth()

  const [totalPendiente, setTotalPendiente] = useState(0)
  const [totalCobradoMes, setTotalCobradoMes] = useState(0)
  const [quienTeDebe, setQuienTeDebe] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    try {
      const ahora = new Date()
      const anio = ahora.getFullYear()
      const mes = ahora.getMonth() + 1 // getMonth() es 0-indexed

      // Ejecutar ambas consultas en paralelo
      const [pendientes, pagadosMes] = await Promise.all([
        getPendientesConCliente(user.id),
        getTotalPagadoEnMes(user.id, anio, mes),
      ])

      // Total pendiente: suma simple
      const totalPend = pendientes.reduce((acc, c) => acc + Number(c.monto), 0)
      setTotalPendiente(totalPend)

      // Total cobrado este mes: suma simple
      const totalPag = pagadosMes.reduce((acc, c) => acc + Number(c.monto), 0)
      setTotalCobradoMes(totalPag)

      // "Quién te debe": agrupar pendientes por cliente
      const deudasMap = {}
      pendientes.forEach((c) => {
        const id = c.cliente_id
        if (!deudasMap[id]) {
          deudasMap[id] = {
            cliente_id: id,
            nombre: c.clientes?.nombre || 'Desconocido',
            total: 0,
            cantidad: 0,
          }
        }
        deudasMap[id].total += Number(c.monto)
        deudasMap[id].cantidad += 1
      })

      // Ordenar de mayor a menor deuda
      const deudas = Object.values(deudasMap).sort((a, b) => b.total - a.total)
      setQuienTeDebe(deudas)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Renderizado ---

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

      {/* Banner de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Pendiente */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Total Pendiente
          </h3>
          <p className="text-3xl font-bold text-yellow-600">{formatearMonto(totalPendiente)}</p>
          <p className="text-xs text-gray-400 mt-1">Cobros por cobrar</p>
        </div>

        {/* Cobrado este mes */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Cobrado este Mes
          </h3>
          <p className="text-3xl font-bold text-green-600">{formatearMonto(totalCobradoMes)}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Clientes con deuda */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Clientes que Deben
          </h3>
          <p className="text-3xl font-bold text-blue-600">{quienTeDebe.length}</p>
          <p className="text-xs text-gray-400 mt-1">Con cobros pendientes</p>
        </div>
      </div>

      {/* Quién te debe */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Quién te debe?</h3>
        {quienTeDebe.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 mt-2">¡Todos al día! No hay deudas pendientes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobros Pendientes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Adeudado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quienTeDebe.map((item) => (
                  <tr key={item.cliente_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {item.cantidad} {item.cantidad === 1 ? 'cobro' : 'cobros'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-medium text-red-600">
                      {formatearMonto(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
