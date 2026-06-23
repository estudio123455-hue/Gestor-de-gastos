import { supabase } from './supabaseClient'

// Obtener todos los clientes del usuario autenticado
export const getClientes = async (userId) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Crear un nuevo cliente
export const crearCliente = async (userId, { nombre, contacto, nota }) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ user_id: userId, nombre, contacto, nota }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualizar un cliente existente
export const actualizarCliente = async (id, { nombre, contacto, nota }) => {
  const { data, error } = await supabase
    .from('clientes')
    .update({ nombre, contacto, nota })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Eliminar un cliente
export const eliminarCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
