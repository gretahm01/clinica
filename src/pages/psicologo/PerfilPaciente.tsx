// ===========================
// src/pages/psicologo/PerfilPaciente.tsx
// ===========================
// Pantalla de perfil completo de un paciente específico.
// Se accede haciendo clic en una tarjeta de la lista de pacientes.
//
// Muestra:
//   - Información personal del paciente
//   - Contacto de emergencia
//   - Sus citas recientes
//   - Sus tareas asignadas
//   - Botón para entrar al expediente clínico
// ===========================

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Paciente, Cita, Tarea, EstadoCita } from "../../types"
import ModalNuevaTarea, { type DatosTarea } from "../../components/ui/ModalNuevaTarea"

// Datos de ejemplo — cuando PHP esté listo vendrán de getPaciente(pacienteId)
// Actualizados para coincidir con la nueva interface Paciente de types/index.ts
const PACIENTE_EJEMPLO: Paciente = {
  id: 1,
  userId: 3,                          // patient.user_id → referencia a user
  nombre: "Carlos",
  apellido: "López",
  apellidoMaterno: "Hernández",
  email: "paciente@medtrack.com",
  telefono: "5599887766",
  fechaNacimiento: "2000-11-05",
  fechaRegistro: "2026-03-10",
  totalCitas: 2,
}

// Citas de ejemplo — vendrán de getCitasPorPaciente(pacienteId)
// Estado solo puede ser: "pendiente" | "confirmada" | "cancelada"
const CITAS_EJEMPLO: Cita[] = [
  {
    id: 1,
    pacienteId: 1,
    profesionalId: 1,           // antes era psicologoId — ahora profesionalId
    fecha: "2026-03-13",
    hora: "10:00",
    estado: "cancelada",        // reemplaza "completada" que no existe en BD
    feedback: "Primera sesión completada"
  },
  {
    id: 2,
    pacienteId: 1,
    profesionalId: 1,
    fecha: "2026-03-20",
    hora: "10:00",
    estado: "confirmada",
  },
]

// Tareas de ejemplo — vendrán de getTareasPorPaciente(pacienteId)
// Estados reales de BD: "pendiente" | "entregada" | "revisada"
const TAREAS_EJEMPLO: Tarea[] = [
  {
    id: 1,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Diario de emociones",      // antes era "descripcion" — ahora "titulo"
    contenido: "Escribe cada noche cómo te sentiste durante el día.",
    fechaLimite: "2026-03-17",
    estado: "pendiente",
    fechaCreacion: "2026-03-10",
  },
]

export default function PerfilPaciente() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  const [modalTareaAbierto, setModalTareaAbierto] = useState(false)

  const paciente = PACIENTE_EJEMPLO
  const citas = CITAS_EJEMPLO
  const tareas = TAREAS_EJEMPLO

  // Busca la próxima cita confirmada para precargarla en el modal de tarea
  const proximaCita = citas.find(c => c.estado === "confirmada")

  // Calcula la edad a partir de la fecha de nacimiento
  function calcularEdad(fechaNacimiento: string) {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
    return edad
  }

  // Colores según el estado de la cita
  // Solo los 3 estados que existen en la BD: pendiente, confirmada, cancelada
  function colorEstadoCita(estado: EstadoCita) {
    switch (estado) {
      case "confirmada": return "bg-green-50 text-green-600"
      case "cancelada":  return "bg-red-50 text-red-500"
      case "pendiente":  return "bg-yellow-50 text-yellow-600"
    }
  }

  // Colores según el estado de la tarea
  // pendiente  = amarillo (aún no entregada)
  // entregada  = azul (el paciente ya entregó, el psicólogo aún no revisa)
  // revisada   = verde (el psicólogo ya revisó)
  function colorEstadoTarea(estado: string) {
    switch (estado) {
      case "revisada":  return "bg-green-50 text-green-600"
      case "entregada": return "bg-blue-50 text-blue-600"
      default:          return "bg-yellow-50 text-yellow-600"
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="max-w-5xl mx-auto p-6">

        {/* Botón volver */}
        <button
          onClick={() => navigate("/psicologo/pacientes")}
          className="text-sm text-slate-400 hover:text-dark transition-colors mb-4 flex items-center gap-1"
        >
          ← Volver a pacientes
        </button>

        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              {/* Avatar con iniciales */}
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {paciente.nombre[0]}{paciente.apellido[0]}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-dark">
                  {paciente.nombre} {paciente.apellido}
                  {/* Muestra apellido materno si existe */}
                  {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
                </h1>
                <p className="text-slate-500 text-sm">
                  {calcularEdad(paciente.fechaNacimiento)} años · Paciente #{pacienteId}
                </p>
                {/* Usamos fechaRegistro para mostrar desde cuándo es paciente */}
                <p className="text-xs text-slate-400 mt-0.5">
                  Registrado el {new Date(paciente.fechaRegistro).toLocaleDateString("es-MX")}
                </p>
              </div>
            </div>

            {/* Botón expediente */}
            <button
              onClick={() => navigate(`/psicologo/expedientes/${pacienteId}`)}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Ver expediente clínico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda — info personal */}
          <div className="flex flex-col gap-4">

            {/* Información de contacto */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-4">Información personal</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Correo electrónico</p>
                  <p className="text-dark">{paciente.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Teléfono</p>
                  <p className="text-dark">{paciente.telefono}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Fecha de nacimiento</p>
                  <p className="text-dark">
                    {new Date(paciente.fechaNacimiento).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contacto de emergencia */}
            {/* Por ahora hardcodeado — vendrá de getContactoEmergencia(pacienteId) */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-4">Contacto de emergencia</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Nombre</p>
                  <p className="text-dark">María Hernández</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Teléfono</p>
                  <p className="text-dark">5511223344</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Parentesco</p>
                  <p className="text-dark">Madre</p>
                </div>
              </div>
            </div>

          </div>

          {/* Columna derecha — citas y tareas */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Citas */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Citas</h3>
                <span className="text-xs text-slate-400">{citas.length} en total</span>
              </div>
              <div className="flex flex-col gap-3">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between p-3 bg-background rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-medium text-dark">
                        {new Date(cita.fecha).toLocaleDateString("es-MX", {
                          weekday: "long", year: "numeric",
                          month: "long", day: "numeric"
                        })}
                      </p>
                      <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoCita(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas asignadas */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Tareas asignadas</h3>
                <button
                  onClick={() => setModalTareaAbierto(true)}
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  + Nueva tarea
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {tareas.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay tareas asignadas</p>
                ) : (
                  tareas.map((tarea) => (
                    <div
                      key={tarea.id}
                      className="flex items-center justify-between p-3 bg-background rounded-xl"
                    >
                      <div>
                        {/* "titulo" en lugar de "descripcion" — así viene de la BD */}
                        <p className="text-sm font-medium text-dark">{tarea.titulo}</p>
                        {tarea.fechaLimite && (
                          <p className="text-xs text-slate-400">
                            Entrega: {new Date(tarea.fechaLimite).toLocaleDateString("es-MX")}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoTarea(tarea.estado)}`}>
                        {tarea.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de nueva tarea */}
      <ModalNuevaTarea
        abierto={modalTareaAbierto}
        onCerrar={() => setModalTareaAbierto(false)}
        onGuardar={(datos: DatosTarea) => {
          console.log("Guardar tarea:", datos)
          // TODO: llamar a crearTarea(datos) de src/services/api.ts
          setModalTareaAbierto(false)
        }}
        nombrePaciente={`${paciente.nombre} ${paciente.apellido}`}
        proximaCitaFecha={proximaCita?.fecha}
      />

    </div>
  )
}