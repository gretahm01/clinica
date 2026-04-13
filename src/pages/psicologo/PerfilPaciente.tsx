// ===========================
// src/pages/psicologo/PerfilPaciente.tsx
// ===========================

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Paciente, Cita, Tarea, EstadoCita } from "../../types"
import ModalNuevaTarea, { type DatosTarea } from "../../components/ui/ModalNuevaTarea"
import { getPaciente, getCitasPorPaciente, cancelarCita, confirmarCita } from "../../services/api"

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

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [citas, setCitas] = useState<Cita[]>([])
  const tareas: Tarea[] = []

  const [modalTareaAbierto, setModalTareaAbierto] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [textoFeedback, setTextoFeedback] = useState("")
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [exitoFeedback, setExitoFeedback] = useState(false)

  // Estados para cancelar cita
  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null)
  const [loadingCancelar, setLoadingCancelar] = useState(false)

  // Estados para confirmar cita
  const [citaAConfirmar, setCitaAConfirmar] = useState<Cita | null>(null)
const [loadingConfirmar, setLoadingConfirmar] = useState(false)

  const proximaCita = citas.find(c => c.estado === "confirmada")

  useEffect(() => {
    if (!pacienteId) return
    cargarPaciente()
    cargarCitas()
  }, [pacienteId])

  async function cargarCitas() {
    try {
      const respuesta = await getCitasPorPaciente(Number(pacienteId))
      if (respuesta.success) {
        setCitas(respuesta.data)
      }
    } catch {
      console.error("Error al cargar citas")
    }
  }

  async function cargarPaciente() {
    try {
      setCargando(true)
      setError("")
      const respuesta = await getPaciente(Number(pacienteId))
      if (respuesta.success) {
        setPaciente(respuesta.data)
      } else {
        setError("No se pudo cargar el perfil del paciente")
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  async function handleCancelarCita() {
    if (!citaACancelar) return
    setLoadingCancelar(true)
    try {
      const respuesta = await cancelarCita(citaACancelar.id)
      if (respuesta.success) {
        setCitas(prev => prev.map(c =>
          c.id === citaACancelar.id ? { ...c, estado: "cancelada" as EstadoCita } : c
        ))
        setCitaACancelar(null)
      } else {
        alert(respuesta.message ?? "Error al cancelar la cita")
      }
    } catch {
      alert("Error de conexión al cancelar la cita")
    } finally {
      setLoadingCancelar(false)
    }
  }

  async function handleConfirmarCita() {
  if (!citaAConfirmar) return
  setLoadingConfirmar(true)
  try {
    const respuesta = await confirmarCita(citaAConfirmar.id)
    if (respuesta.success) {
      setCitas(prev => prev.map(c =>
        c.id === citaAConfirmar.id ? { ...c, estado: "confirmada" as EstadoCita } : c
      ))
      setCitaAConfirmar(null)
    } else {
      alert(respuesta.message ?? "Error al confirmar la cita")
    }
  } catch {
    alert("Error de conexión al confirmar la cita")
  } finally {
    setLoadingConfirmar(false)
  }
}

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

  async function handleGuardarFeedback() {
    if (!textoFeedback.trim() || !citaSeleccionada) return
    setLoadingFeedback(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setCitas(prev => prev.map(c =>
        c.id === citaSeleccionada.id ? { ...c, feedback: textoFeedback } : c
      ))
      setExitoFeedback(true)
    } catch {
      alert("Error al guardar. Intenta de nuevo.")
    } finally {
      setLoadingFeedback(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-red-500 font-medium">{error || "Paciente no encontrado"}</p>
          <button onClick={() => navigate("/psicologo/pacientes")} className="mt-3 text-sm text-primary hover:underline">
            Volver a pacientes
          </button>
        </div>
      </div>
    )
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
                  Registrado el {new Date(paciente.fechaRegistro + "T12:00:00").toLocaleDateString("es-MX")}
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
                  <p className="text-dark">
                    {new Date(paciente.fechaNacimiento + "T12:00:00").toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-4">Contacto de emergencia</h3>
              <p className="text-xs text-slate-400">Por conectar con PHP</p>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* CITAS */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Citas</h3>
                <span className="text-xs text-slate-400">{citas.length} en total</span>
              </div>
              {citas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay citas registradas</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {citas.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between p-3 bg-background rounded-xl"
                    >
                      {/* Info — al picar abre feedback */}
                      <button
                        onClick={() => abrirModalFeedback(cita)}
                        className="flex-1 text-left hover:opacity-80 transition-opacity"
                      >
                        <p className="text-sm font-medium text-dark">
                          {new Date(cita.fecha + "T12:00:00").toLocaleDateString("es-MX", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric"
                          })}
                        </p>
                        <p className="text-xs text-slate-400">{cita.hora} hrs</p>
                        {cita.feedback && (
                          <p className="text-xs text-primary mt-1 truncate max-w-xs">💬 {cita.feedback}</p>
                        )}
                      </button>

                      {/* Badge + botón cancelar */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoCita(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      
                      {cita.estado === "pendiente" && (
                        <button
                          onClick={() => setCitaAConfirmar(cita)}
                          className="text-xs text-green-500 hover:text-green-700 font-medium px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      {cita.estado !== "cancelada" && (
                        <button
                          onClick={() => setCitaACancelar(cita)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TAREAS */}
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
              {tareas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay tareas asignadas</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tareas.map((tarea) => (
                    <button
                      key={tarea.id}
                      onClick={() => navigate(`/psicologo/pacientes/${pacienteId}/tareas/${tarea.id}`)}
                      className="flex items-center justify-between p-3 bg-background rounded-xl hover:bg-slate-100 transition-colors text-left w-full"
                    >
                      <div>
                        <p className="text-sm font-medium text-dark">{tarea.titulo}</p>
                        {tarea.fechaLimite && (
                          <p className="text-xs text-slate-400">
                            Entrega: {new Date(tarea.fechaLimite + "T12:00:00").toLocaleDateString("es-MX")}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colorEstadoTarea(tarea.estado)}`}>
                        {tarea.estado}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <ModalNuevaTarea
        abierto={modalTareaAbierto}
        onCerrar={() => setModalTareaAbierto(false)}
        onGuardar={(datos: DatosTarea) => {
          console.log("Guardar tarea:", datos)
          setModalTareaAbierto(false)
        }}
        nombrePaciente={paciente ? `${paciente.nombre} ${paciente.apellido}` : ""}
        proximaCitaFecha={proximaCita?.fecha}
      />

      {/* MODAL RETROALIMENTACIÓN */}
      {citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={cerrarModalFeedback}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Retroalimentación</h2>
              <button onClick={cerrarModalFeedback} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <div className="bg-background rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-medium text-dark">
                {new Date(citaSeleccionada.fecha + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </p>
              <p className="text-xs text-slate-400 mt-1">{citaSeleccionada.hora} hrs</p>
            </div>
            {exitoFeedback ? (
              <div className="text-center py-4">
                <p className="font-semibold text-dark mb-1">¡Retroalimentación guardada!</p>
                <button onClick={cerrarModalFeedback} className="mt-4 w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors">
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={textoFeedback}
                  onChange={e => setTextoFeedback(e.target.value)}
                  placeholder="Escribe observaciones para el paciente..."
                  rows={5}
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={cerrarModalFeedback} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarFeedback}
                    disabled={loadingFeedback || !textoFeedback.trim()}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                  >
                    {loadingFeedback ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CANCELAR CITA */}
      {citaACancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark text-center mb-1">¿Cancelar esta cita?</h3>
            <p className="text-slate-500 text-sm text-center mb-1">
              {new Date(citaACancelar.fecha + "T12:00:00").toLocaleDateString("es-MX", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </p>
            <p className="text-slate-400 text-xs text-center mb-6">{citaACancelar.hora} hrs</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCitaACancelar(null)}
                disabled={loadingCancelar}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                No cancelar
              </button>
              <button
                onClick={handleCancelarCita}
                disabled={loadingCancelar}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
              >
                {loadingCancelar ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* MODAL CONFIRMAR CONFIRMAR CITA */}
        {citaAConfirmar && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-dark text-center mb-1">¿Confirmar esta cita?</h3>
      <p className="text-slate-500 text-sm text-center mb-1">
        {new Date(citaAConfirmar.fecha + "T12:00:00").toLocaleDateString("es-MX", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        })}
      </p>
      <p className="text-slate-400 text-xs text-center mb-6">{citaAConfirmar.hora} hrs</p>
      <div className="flex gap-3">
        <button
          onClick={() => setCitaAConfirmar(null)}
          disabled={loadingConfirmar}
          className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmarCita}
          disabled={loadingConfirmar}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
        >
          {loadingConfirmar ? "Confirmando..." : "Sí, confirmar"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}