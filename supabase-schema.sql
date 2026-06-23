-- Crear tabla clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  contacto TEXT,
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla cobros
CREATE TABLE cobros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pagado', 'pendiente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) en ambas tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para la tabla clientes

-- Política: Los usuarios autenticados pueden ver solo sus propios clientes
CREATE POLICY "Los usuarios pueden ver sus propios clientes"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden insertar solo sus propios clientes
CREATE POLICY "Los usuarios pueden insertar sus propios clientes"
  ON clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden actualizar solo sus propios clientes
CREATE POLICY "Los usuarios pueden actualizar sus propios clientes"
  ON clientes FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden eliminar solo sus propios clientes
CREATE POLICY "Los usuarios pueden eliminar sus propios clientes"
  ON clientes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para la tabla cobros

-- Política: Los usuarios autenticados pueden ver solo sus propios cobros
CREATE POLICY "Los usuarios pueden ver sus propios cobros"
  ON cobros FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden insertar solo sus propios cobros
CREATE POLICY "Los usuarios pueden insertar sus propios cobros"
  ON cobros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden actualizar solo sus propios cobros
CREATE POLICY "Los usuarios pueden actualizar sus propios cobros"
  ON cobros FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden eliminar solo sus propios cobros
CREATE POLICY "Los usuarios pueden eliminar sus propios cobros"
  ON cobros FOR DELETE
  USING (auth.uid() = user_id);
