# Gestor de Clientes

Aplicación web para gestionar clientes y cobros con autenticación.

## Tecnologías

- React + Vite
- Tailwind CSS
- React Router DOM
- Supabase (Auth + Database)

## Características

- Autenticación con email y contraseña
- Gestión de clientes
- Gestión de cobros
- Dashboard con estadísticas
- Row Level Security (RLS) en Supabase

## Instalación

```bash
npm install
```

## Configuración

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el SQL del archivo `supabase-schema.sql` en el SQL Editor de Supabase
3. Crea un archivo `.env` con las variables de entorno:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Ejecutar

```bash
npm run dev
```

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React (AuthContext)
├── lib/            # Utilidades (supabaseClient)
├── pages/          # Páginas de la aplicación
└── App.jsx         # Configuración de rutas
```
