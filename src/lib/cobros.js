import { supabase } from './supabaseClient'

// Obtener todos los cobros del usuario con el nombre del cliente
export const getCobros = async (userId) => {
  const { data, error } = await supabase
    .from('cobros')
    .select('*, clientes(nombre)')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

// Crear un nuevo cobro
export const crearCobro = async (userId, { cliente_id, monto, fecha, estado }) => {
  const { data, error } = await supabase
    .from('cobros')
    .insert([{ user_id: userId, cliente_id, monto, fecha, estado }])
    .select('*, clientes(nombre)')
    .single()

  if (error) throw error
  return data
}

// Actualizar solo el estado de un cobro
export const actualizarEstadoCobro = async (id, estado) => {
  const { data, error } = await supabase
    .from('cobros')
    .update({ estado })
    .eq('id', id)
    .select('*, clientes(nombre)')
    .single()

  if (error) throw error
  return data
}

// Eliminar un cobro
export const eliminarCobro = async (id) => {
  const { error } = await supabase
    .from('cobros')
    .delete()
    .eq('id', id)

  if (error) throw error
}
