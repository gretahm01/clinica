// ===========================
// src/App.tsx
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
import ListaTareasPaciente  from "./pages/paciente/ListaTareasPaciente" // <--- NUEVA IMPORTACIÓN
import PerfilPacientePage   from "./pages/paciente/PerfilPacientePage"
import CalendarioPaciente   from "./pages/paciente/CalendarioPaciente"

// ===== PÁGINAS DE LA SECRETARIA =====
import DashboardSecretaria  from "./pages/secretaria/DashboardSecretaria"
import PacientesSecretaria  from "./pages/secretaria/PacienteSecretaria"
import CalendarioSecretaria from "./pages/secretaria/CalendarioSecretaria"

// ===== PÁGINAS DEL ADMIN =====
import AdminDashboard     from "./pages/admin/AdminDashboard"
import AdminPatientsPage  from "./pages/admin/AdminPatientsPage"
import AdminStaffPage     from "./pages/admin/AdminStaffPage"
import AdminSettingsPage from "./pages/admin/AdminSettingsPage"

// ===========================
// RUTA PROTEGIDA
// ===========================
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

// ===========================
// RUTAS DE LA APP
// ===========================
export default function App() {
  const { usuario, isAuthenticated } = useAuth()

  return (
    <Routes>

      {/* ===== PÁGINAS PÚBLICAS ===== */}
      <Route path="/"        element={<Landing />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/login"
        element={
          isAuthenticated && usuario
            ? <Navigate to={`/${usuario.rol}/dashboard`} replace />
            : <Login />
        }
      />

      {/* ===== RUTAS DEL PSICÓLOGO ===== */}
      <Route path="/psicologo/dashboard"
        element={<RutaProtegida rolesPermitidos={["psicologo"]}><Dashboard /></RutaProtegida>}
      />
      <Route path="/psicologo/pacientes"
        element={<RutaProtegida rolesPermitidos={["psicologo"]}><Pacientes /></RutaProtegida>}
      />
      <Route path="/psicologo/pacientes/:pacienteId"
        element={<RutaProtegida rolesPermitidos={["psicologo"]}><PerfilPaciente /></RutaProtegida>}
      />
      <Route path="/psicologo/expedientes/:pacienteId"
        element={<RutaProtegida rolesPermitidos={["psicologo"]}><Expedientes /></RutaProtegida>}
      />
      <Route path="/psicologo/perfil"
        element={<RutaProtegida rolesPermitidos={["psicologo"]}><PerfilPsicologo /></RutaProtegida>}
      />
      <Route path="/psicologo/pacientes/:pacienteId/tareas/:tareaId"
        element={<RutaProtegida rolesPermitidos={["psicologo"]}><DetalleTarea /></RutaProtegida>}
      />

      {/* ===== RUTAS DE LA SECRETARIA ===== */}
      <Route path="/secretaria/dashboard"
        element={<RutaProtegida rolesPermitidos={["secretaria"]}><DashboardSecretaria /></RutaProtegida>}
      />
      <Route path="/secretaria/pacientes"
        element={<RutaProtegida rolesPermitidos={["secretaria"]}><PacientesSecretaria /></RutaProtegida>}
      />
      <Route path="/secretaria/calendario"
        element={<RutaProtegida rolesPermitidos={["secretaria"]}><CalendarioSecretaria /></RutaProtegida>}
      />

      {/* ===== RUTAS DEL PACIENTE ===== */}
      <Route path="/paciente/dashboard"
        element={<RutaProtegida rolesPermitidos={["paciente"]}><DashboardPaciente /></RutaProtegida>}
      />
      <Route path="/paciente/citas/:citaId"
        element={<RutaProtegida rolesPermitidos={["paciente"]}><DetalleCita /></RutaProtegida>}
      />
      
      {/* ---> NUEVA RUTA: LISTA DE TAREAS <--- */}
      <Route path="/paciente/tareas"
        element={<RutaProtegida rolesPermitidos={["paciente"]}><ListaTareasPaciente /></RutaProtegida>}
      />
      
      <Route path="/paciente/tareas/:tareaId"
        element={<RutaProtegida rolesPermitidos={["paciente"]}><DetalleTareaPaciente /></RutaProtegida>}
      />
      <Route path="/paciente/perfil"
        element={<RutaProtegida rolesPermitidos={["paciente"]}><PerfilPacientePage /></RutaProtegida>}
      />
      <Route path="/paciente/calendario"
        element={<RutaProtegida rolesPermitidos={["paciente"]}><CalendarioPaciente /></RutaProtegida>}
      />

      {/* ===== RUTAS DEL ADMIN ===== */}
      <Route path="/admin/dashboard"
        element={<RutaProtegida rolesPermitidos={["admin"]}><AdminDashboard /></RutaProtegida>}
      />
      <Route path="/admin/pacientes"
        element={<RutaProtegida rolesPermitidos={["admin"]}><AdminPatientsPage /></RutaProtegida>}
      />
      <Route path="/admin/staff"
        element={<RutaProtegida rolesPermitidos={["admin"]}><AdminStaffPage /></RutaProtegida>}
      />

      // En la sección de {/* ===== RUTAS DEL ADMIN ===== */}
<Route path="/admin/configuracion"
  element={<RutaProtegida rolesPermitidos={["admin"]}><AdminSettingsPage /></RutaProtegida>}
/>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}