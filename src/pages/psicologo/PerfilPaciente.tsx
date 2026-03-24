// ===========================
// src/pages/psicologo/PerfilPaciente.tsx
// ===========================
// Mejoras:
//   - Al picar una cita → modal de retroalimentación
//   - Al picar una tarea → navega a DetalleTarea
//   - La retroalimentación guardada se refleja en la tarjeta

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Paciente, Cita, Tarea, EstadoCita } from "../../types"
import ModalNuevaTarea, { type DatosTarea } from "../../components/ui/ModalNuevaTarea"

const PACIENTE_EJEMPLO: Paciente = {
  id: 1,
  userId: 3,
  nombre: "Carlos",
  apellido: "López",
  apellidoMaterno: "Hernández",
  email: "paciente@medtrack.com",
  telefono: "5599887766",
  fechaNacimiento: "2000-11-05",
  fechaRegistro: "2026-03-10",
  totalCitas: 2,
}

const CITAS_EJEMPLO: Cita[] = [
  { id: 1, pacienteId: 1, profesionalId: 1, fecha: "2026-03-13", hora: "10:00", estado: "cancelada", feedback: "" },
  { id: 2, pacienteId: 1, profesionalId: 1, fecha: "2026-03-20", hora: "10:00", estado: "confirmada" },
]

const TAREAS_EJEMPLO: Tarea[] = [
  {
    id: 1,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Diario de emociones",
    contenido: "Escribe cada noche cómo te sentiste durante el día.",
    fechaLimite: "2026-03-17",
    estado: "pendiente",
    fechaCreacion: "2026-03-10",
  },
  {
    id: 2,
    pacienteId: 1,
    profesionalId: 1,
    titulo: "Técnicas de respiración",
    contenido: "Practica la respiración diafragmática 10 minutos al día.",
    fechaLimite: "2026-03-20",
    estado: "entregada",
    fechaCreacion: "2026-03-10",
  },
]

function calcularEdad(fechaNacimiento: string) {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

function colorEstadoCita(estado: EstadoCita) {
  switch (estado) {
    case "confirmada": return "bg-green-50 text-green-600"
    case "cancelada":  return "bg-red-50 text-red-500"
    case "pendiente":  return "bg-yellow-50 text-yellow-600"
  }
}

function colorEstadoTarea(estado: string) {
  switch (estado) {
    case "revisada":  return "bg-green-50 text-green-600"
    case "entregada": return "bg-blue-50 text-blue-600"
    default:          return "bg-yellow-50 text-yellow-600"
  }
}

export default function PerfilPaciente() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  const [modalTareaAbierto, setModalTareaAbierto] = useState(false)

  const paciente = PACIENTE_EJEMPLO
  const [citas, setCitas] = useState<Cita[]>(CITAS_EJEMPLO)
  const tareas = TAREAS_EJEMPLO

  const proximaCita = citas.find(c => c.estado === "confirmada")

  // ===========================
  // ESTADO DEL MODAL RETROALIMENTACIÓN
  // ===========================
  // citaSeleccionada guarda la cita sobre la que se está escribiendo feedback
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)

  // Texto del feedback que está escribiendo el psicólogo
  const [textoFeedback, setTextoFeedback] = useState("")
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [exitoFeedback, setExitoFeedback] = useState(false)

  // Abre el modal con la cita seleccionada y carga el feedback previo si existe
  function abrirModalFeedback(cita: Cita) {
    setCitaSeleccionada(cita)
    setTextoFeedback(cita.feedback ?? "")
    setExitoFeedback(false)
  }

  function cerrarModalFeedback() {
    setCitaSeleccionada(null)
    setTextoFeedback("")
    setExitoFeedback(false)
  }

  // Guarda el feedback y actualiza la cita en el estado local
  // TODO: llamar a actualizarCita(id, { feedback }) cuando PHP esté listo
  async function handleGuardarFeedback() {
    if (!textoFeedback.trim() || !citaSeleccionada) return
    setLoadingFeedback(true)

    try {
      // Simula la petición a PHP
      await new Promise(resolve => setTimeout(resolve, 800))

      // Actualiza el feedback de la cita en el estado local
      // Esto simula lo que PHP haría: guardar en BD y notificar al paciente
      setCitas(prev => prev.map(c =>
        c.id === citaSeleccionada.id
          ? { ...c, feedback: textoFeedback }
          : c
      ))

      setExitoFeedback(true)
      // TODO: PHP también debe crear una notificación para el paciente
      // POST /notificaciones { pacienteId, mensaje: "Tu psicólogo dejó retroalimentación" }
    } catch {
      alert("Error al guardar. Intenta de nuevo.")
    } finally {
      setLoadingFeedback(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">

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
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {paciente.nombre[0]}{paciente.apellido[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark">
                  {paciente.nombre} {paciente.apellido}
                  {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
                </h1>
                <p className="text-slate-500 text-sm">
                  {calcularEdad(paciente.fechaNacimiento)} años · Paciente #{pacienteId}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registrado el {new Date(paciente.fechaRegistro).toLocaleDateString("es-MX")}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/psicologo/expedientes/${pacienteId}`)}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Ver expediente clínico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="flex flex-col gap-4">
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
                  <p className="text-dark">{new Date(paciente.fechaNacimiento).toLocaleDateString("es-MX")}</p>
                </div>
              </div>
            </div>

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

          {/* Columna derecha */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* CITAS — al picar una abre el modal de retroalimentación */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Citas</h3>
                <span className="text-xs text-slate-400">{citas.length} en total</span>
              </div>
              <div className="flex flex-col gap-3">
                {citas.map((cita) => (
                  <button
                    key={cita.id}
                    onClick={() => abrirModalFeedback(cita)}
                    className="flex items-center justify-between p-3 bg-background rounded-xl hover:bg-slate-100 transition-colors text-left w-full group"
                  >
                    <div>
                      <p className="text-sm font-medium text-dark">
                        {new Date(cita.fecha).toLocaleDateString("es-MX", {
                          weekday: "long", year: "numeric",
                          month: "long", day: "numeric"
                        })}
                      </p>
                      <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                      {/* Muestra un preview del feedback si ya existe */}
                      {cita.feedback && (
                        <p className="text-xs text-primary mt-1 truncate max-w-xs">
                          💬 {cita.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoCita(cita.estado)}`}>
                        {cita.estado}
                      </span>
                      {/* Ícono de editar — aparece al hacer hover */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* TAREAS — al picar navega a DetalleTarea */}
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
                    <button
                      key={tarea.id}
                      onClick={() => navigate(`/psicologo/pacientes/${pacienteId}/tareas/${tarea.id}`)}
                      className="flex items-center justify-between p-3 bg-background rounded-xl hover:bg-slate-100 transition-colors text-left w-full group"
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">{tarea.titulo}</p>
                        {tarea.fechaLimite && (
                          <p className="text-xs text-slate-400">
                            Entrega: {new Date(tarea.fechaLimite).toLocaleDateString("es-MX")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoTarea(tarea.estado)}`}>
                          {tarea.estado}
                        </span>
                        {/* Flecha — aparece al hacer hover */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL NUEVA TAREA */}
      <ModalNuevaTarea
        abierto={modalTareaAbierto}
        onCerrar={() => setModalTareaAbierto(false)}
        onGuardar={(datos: DatosTarea) => {
          console.log("Guardar tarea:", datos)
          setModalTareaAbierto(false)
        }}
        nombrePaciente={`${paciente.nombre} ${paciente.apellido}`}
        proximaCitaFecha={proximaCita?.fecha}
      />

      {/* ===========================
          MODAL RETROALIMENTACIÓN
          Se abre al picar una cita.
          El psicólogo escribe su retroalimentación y al guardar:
            1. Se actualiza en la tarjeta de la cita
            2. PHP notifica al paciente (badge + banner en su dashboard)
          =========================== */}
      {citaSeleccionada && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={cerrarModalFeedback}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Retroalimentación</h2>
              <button onClick={cerrarModalFeedback} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {/* Info de la cita */}
            <div className="bg-background rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-medium text-dark">
                {new Date(citaSeleccionada.fecha).toLocaleDateString("es-MX", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-400">{citaSeleccionada.hora} hrs</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colorEstadoCita(citaSeleccionada.estado)}`}>
                  {citaSeleccionada.estado}
                </span>
              </div>
            </div>

            {/* Pantalla de éxito */}
            {exitoFeedback ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-dark mb-1">¡Retroalimentación guardada!</p>
                <p className="text-sm text-slate-400 mb-2">
                  El paciente será notificado con un aviso en su panel.
                </p>
                {/* Muestra un preview de la notificación que recibirá el paciente */}
                <div className="bg-background rounded-xl p-3 text-left mb-5">
                  <p className="text-xs text-slate-400 mb-1">Vista previa de la notificación:</p>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-dark">Nueva retroalimentación</p>
                      <p className="text-xs text-slate-500">Tu psicólogo dejó comentarios sobre tu cita del {new Date(citaSeleccionada.fecha).toLocaleDateString("es-MX")}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={cerrarModalFeedback}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Escribe tu retroalimentación
                    <span className="text-slate-400 font-normal ml-1 text-xs">— visible para el paciente</span>
                  </label>
                  <textarea
                    value={textoFeedback}
                    onChange={e => setTextoFeedback(e.target.value)}
                    placeholder="Escribe observaciones, indicaciones o comentarios para el paciente sobre esta sesión..."
                    rows={5}
                    autoFocus
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Al guardar, el paciente recibirá una notificación en su panel.
                  </p>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={cerrarModalFeedback}
                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarFeedback}
                    disabled={loadingFeedback || !textoFeedback.trim()}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                  >
                    {loadingFeedback ? "Guardando..." : "Guardar y notificar"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}