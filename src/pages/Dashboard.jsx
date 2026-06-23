const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Clientes</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Cobros Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">$0.00</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Cobros Pagados</h3>
          <p className="text-3xl font-bold text-green-600">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Bienvenido</h3>
        <p className="text-gray-600">
          Comienza gestionando tus clientes y cobros desde el menú de navegación.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
