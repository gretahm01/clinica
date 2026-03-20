// ===========================
// src/App.tsx
// ===========================

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import type { Rol } from "./types"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Registro from "./pages/Registro"
import Dashboard from "./pages/psicologo/Dashboard"
import Pacientes from "./pages/psicologo/Paciente"
import Expedientes from "./pages/psicologo/Expedientes"
import PerfilPaciente from "./pages/psicologo/PerfilPaciente"
import PerfilPsicologo from "./pages/psicologo/PerfilPsicologo"

interface RutaProtegidaProps {
  children: React.ReactNode
  rolesPermitidos: Rol[]
}

function RutaProtegida({ children, rolesPermitidos }: RutaProtegidaProps) {
  const { usuario, isAuthenticated } = useAuth()

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to={`/${usuario.rol}/dashboard`} replace />
  }

  return <>{children}</>
}

export default function App() {
  const { usuario, isAuthenticated } = useAuth()

  return (
    <Routes>

      {/* Páginas públicas — accesibles sin login */}
      <Route path="/" element={<Landing />} />
      <Route path="/registro" element={<Registro />} />

      {/* Login — si ya estás logueado, te manda a tu dashboard */}
      <Route
        path="/login"
        element={
          isAuthenticated && usuario
            ? <Navigate to={`/${usuario.rol}/dashboard`} replace />
            : <Login />
        }
      />

      {/* ===== RUTAS DEL PSICÓLOGO ===== */}
      <Route
        path="/psicologo/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/psicologo/pacientes"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <Pacientes />
          </RutaProtegida>
        }
      />
      <Route
        path="/psicologo/pacientes/:pacienteId"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <PerfilPaciente />
          </RutaProtegida>
        }
      />
      <Route
        path="/psicologo/expedientes/:pacienteId"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <Expedientes />
          </RutaProtegida>
        }
      />
      <Route
  path="/psicologo/perfil"
  element={
    <RutaProtegida rolesPermitidos={["psicologo"]}>
      <PerfilPsicologo />
    </RutaProtegida>
  }
/>

      {/* ===== RUTAS DE LA SECRETARIA ===== */}
      <Route
        path="/secretaria/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["secretaria"]}>
            <div className="p-8 text-dark font-medium">Dashboard Secretaria (próximamente)</div>
          </RutaProtegida>
        }
      />

      {/* ===== RUTAS DEL PACIENTE ===== */}
      <Route
        path="/paciente/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["paciente"]}>
            <div className="p-8 text-dark font-medium">Dashboard Paciente (próximamente)</div>
          </RutaProtegida>
        }
      />

      {/* Cualquier URL inexistente → Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
