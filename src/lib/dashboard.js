import { supabase } from './supabaseClient'

// Obtener todos los cobros pendientes con nombre del cliente
// Se usa tanto para el total como para la lista "Quién te debe"
export const getPendientesConCliente = async (userId) => {
  const { data, error } = await supabase
    .from('cobros')
    .select('id, monto, cliente_id, clientes(nombre)')
    .eq('user_id', userId)
    .eq('estado', 'pendiente')

  if (error) throw error
  return data
}

// Obtener la suma de cobros pagados en un mes específico
export const getTotalPagadoEnMes = async (userId, year, month) => {
  const primerDia = `${year}-${String(month).padStart(2, '0')}-01`
  // Último día del mes
  const ultimoDia = new Date(year, month, 0).getDate()
  const ultimoDiaStr = `${year}-${String(month).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('cobros')
    .select('monto')
    .eq('user_id', userId)
    .eq('estado', 'pagado')
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDiaStr)

  if (error) throw error
  return data
}
