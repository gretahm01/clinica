// ===========================
// src/App.tsx
// ===========================
// Archivo principal de rutas de la aplicación.
// Aquí se define a qué componente lleva cada URL.
//
// RutaProtegida verifica que el usuario esté logueado
// y que tenga el rol correcto antes de mostrar la página.
// Si no está logueado → manda al login
// Si tiene rol incorrecto → manda a su propio dashboard
// ===========================

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import type { Rol } from "./types"

// ===== PÁGINAS PÚBLICAS =====
import Landing  from "./pages/Landing"
import Login    from "./pages/Login"
import Registro from "./pages/Registro"

// ===== PÁGINAS DEL PSICÓLOGO =====
import Dashboard       from "./pages/psicologo/Dashboard"
import Pacientes       from "./pages/psicologo/Paciente"
import Expedientes     from "./pages/psicologo/Expedientes"
import PerfilPaciente  from "./pages/psicologo/PerfilPaciente"
import PerfilPsicologo from "./pages/psicologo/PerfilPsicologo"
import DetalleTarea    from "./pages/psicologo/DetalleTarea"

// ===== PÁGINAS DEL PACIENTE =====
import DashboardPaciente    from "./pages/paciente/DashboardPaciente"
import DetalleCita          from "./pages/paciente/DetalleCita"
import DetalleTareaPaciente from "./pages/paciente/Detalletareapaciente"
import PerfilPacientePage from "./pages/paciente/PerfilPacientePage"
import CalendarioPaciente from "./pages/paciente/CalendarioPaciente"

// ===========================
// RUTA PROTEGIDA
// Componente que envuelve páginas que requieren autenticación.
// rolesPermitidos define qué roles pueden ver esa página.
// ===========================
interface RutaProtegidaProps {
  children: React.ReactNode
  rolesPermitidos: Rol[]
}

function RutaProtegida({ children, rolesPermitidos }: RutaProtegidaProps) {
  const { usuario, isAuthenticated } = useAuth()

  // Si no está logueado → manda al login
  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />
  }

  // Si su rol no está permitido → manda a su propio dashboard
  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to={`/${usuario.rol}/dashboard`} replace />
  }

  return <>{children}</>
}


// ===========================
// RUTAS DE LA APP
// ===========================
export default function App() {
  const { usuario, isAuthenticated } = useAuth()

  return (
    <Routes>

      {/* ===== PÁGINAS PÚBLICAS — sin login ===== */}
      <Route path="/"         element={<Landing />} />
      <Route path="/registro" element={<Registro />} />

      {/* Login — si ya estás logueado te manda a tu dashboard */}
      <Route
        path="/login"
        element={
          isAuthenticated && usuario
            ? <Navigate to={`/${usuario.rol}/dashboard`} replace />
            : <Login />
        }
      />

      {/* ===== RUTAS DEL PSICÓLOGO ===== */}

      {/* Dashboard principal con calendario */}
      <Route
        path="/psicologo/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <Dashboard />
          </RutaProtegida>
        }
      />

      {/* Lista de pacientes */}
      <Route
        path="/psicologo/pacientes"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <Pacientes />
          </RutaProtegida>
        }
      />

      {/* Perfil completo de un paciente específico */}
      <Route
        path="/psicologo/pacientes/:pacienteId"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <PerfilPaciente />
          </RutaProtegida>
        }
      />

      {/* Expediente clínico de un paciente */}
      <Route
        path="/psicologo/expedientes/:pacienteId"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <Expedientes />
          </RutaProtegida>
        }
      />

      {/* Perfil del psicólogo logueado */}
      <Route
        path="/psicologo/perfil"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <PerfilPsicologo />
          </RutaProtegida>
        }
      />

      {/* Detalle de una tarea específica de un paciente — vista del psicólogo */}
      <Route
        path="/psicologo/pacientes/:pacienteId/tareas/:tareaId"
        element={
          <RutaProtegida rolesPermitidos={["psicologo"]}>
            <DetalleTarea />
          </RutaProtegida>
        }
      />

      {/* ===== RUTAS DE LA SECRETARIA ===== */}
      {/* Por construir — placeholder por ahora */}
      <Route
        path="/secretaria/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["secretaria"]}>
            <div className="p-8 text-dark font-medium">Dashboard Secretaria (próximamente)</div>
          </RutaProtegida>
        }
      />

      {/* ===== RUTAS DEL PACIENTE ===== */}

      {/* Dashboard principal del paciente */}
      <Route
        path="/paciente/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["paciente"]}>
            <DashboardPaciente />
          </RutaProtegida>
        }
      />

      {/* Detalle de una cita específica — vista del paciente
          Permite ver feedback, cancelar y reagendar */}
      <Route
        path="/paciente/citas/:citaId"
        element={
          <RutaProtegida rolesPermitidos={["paciente"]}>
            <DetalleCita />
          </RutaProtegida>
        }
      />

      {/* Detalle de una tarea específica — vista del paciente
          Permite ver instrucciones, entregar con texto y archivo adjunto */}
      <Route
        path="/paciente/tareas/:tareaId"
        element={
          <RutaProtegida rolesPermitidos={["paciente"]}>
            <DetalleTareaPaciente />
          </RutaProtegida>
        }
      />

      <Route
  path="/paciente/perfil"
  element={
    <RutaProtegida rolesPermitidos={["paciente"]}>
      <PerfilPacientePage />
    </RutaProtegida>
  }
/>



<Route
  path="/paciente/calendario"
  element={
    <RutaProtegida rolesPermitidos={["paciente"]}>
      <CalendarioPaciente />
    </RutaProtegida>
  }
/>

      {/* Cualquier URL que no exista → Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}