// ===========================
// src/main.tsx
// ===========================
// Este es el PUNTO DE ENTRADA de toda la app.
// React arranca aquí y monta todo en el HTML.
//
// Aquí es donde conectamos todos los "proveedores" que
// envuelven la app — AuthProvider para el usuario logueado
// y QueryClientProvider para el manejo de datos de la API.
// ===========================

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./context/AuthContext"
import "./index.css"
import App from "./App"

// QueryClient es la configuración de React Query.
// Maneja automáticamente el caché, loading y errores
// de todas las peticiones a PHP.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,           // si falla una petición, reintenta 1 vez
      staleTime: 1000 * 60 * 5,  // los datos se consideran frescos por 5 minutos
    }
  }
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* BrowserRouter habilita la navegación entre páginas */}
    <BrowserRouter>
      {/* QueryClientProvider da acceso a React Query en toda la app */}
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider da acceso al usuario logueado en toda la app */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
