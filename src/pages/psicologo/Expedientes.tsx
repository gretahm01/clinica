// ===========================
// src/pages/psicologo/Expedientes.tsx
// ===========================
// Pantalla donde el psicólogo ve y llena el expediente
// clínico de un paciente específico.
//
// Recibe el pacienteId desde la URL:
//   /psicologo/expedientes/1 → expediente del paciente 1
//
// Estructura de BD que usa:
//   - medical_record: datos clínicos del paciente
//   - medical_record_diagnosis: diagnósticos asociados
//   - diagnosis: catálogo de diagnósticos
//   - session_note: notas por sesión (una por cita)
// ===========================

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { NotaSesion } from "../../types"

interface Diagnostico {
  id: number
  nombre: string
}

interface Expediente {
  id: number
  pacienteNombre: string
  pacienteApellido: string
  motivoConsulta: string
  condicionActual: string
  infanciaAdolescencia: string
  eventosSignificativos: string
  historialAbuso: string
  metasTerapeuticas: string
  diagnosticos: Diagnostico[]
}

const DIAGNOSTICOS_DISPONIBLES: Diagnostico[] = [
  { id: 1, nombre: "Ansiedad generalizada" },
  { id: 2, nombre: "Trastorno de depresión mayor" },
  { id: 3, nombre: "Trastorno de Conducta Alimentaria (TCA)" },
  { id: 4, nombre: "Trastorno Obsesivo Compulsivo (TOC)" },
  { id: 5, nombre: "Trastorno de Estrés Postraumático (TEPT)" },
  { id: 6, nombre: "Trastorno bipolar" },
  { id: 7, nombre: "Fobia específica" },
  { id: 8, nombre: "Trastorno de pánico" },
  { id: 9, nombre: "Trastorno de ansiedad social" },
  { id: 10, nombre: "Trastorno límite de la personalidad (TLP)" },
  { id: 11, nombre: "TDAH" },
  { id: 12, nombre: "Otro" },
]

// Notas de sesión de ejemplo — vendrán de getNotasSesion(pacienteId)
const NOTAS_EJEMPLO: NotaSesion[] = [
  {
    id: 1,
    citaId: 1,
    profesionalId: 1,
    contenido: "Paciente llegó puntual. Se trabajaron técnicas de respiración diafragmática. Reporta dificultad para dormir los últimos días. Se asignó tarea de diario de emociones.",
    fechaCita: "2026-03-13",
    horaCita: "09:00",
  },
]

export default function Expedientes() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  const [expediente, setExpediente] = useState<Expediente>({
    id: 1,
    pacienteNombre: "Juan",
    pacienteApellido: "Pérez",
    motivoConsulta: "Episodios de ansiedad recurrentes, dificultad para dormir y concentrarse en el trabajo.",
    condicionActual: "Paciente presenta ansiedad moderada, refiere mejoría parcial con técnicas de respiración.",
    infanciaAdolescencia: "Crianza estable, sin eventos traumáticos reportados. Buen rendimiento escolar.",
    eventosSignificativos: "Pérdida de empleo hace 8 meses, inicio de síntomas coincide con este evento.",
    historialAbuso: "Niega historial de abuso físico, emocional o sexual.",
    metasTerapeuticas: "Desarrollar técnicas de manejo de ansiedad. Mejorar calidad de sueño. Retomar actividades sociales.",
    diagnosticos: [
      { id: 1, nombre: "Ansiedad generalizada" },
    ],
  })

  // Lista de notas de sesión del paciente
  const [notas, setNotas] = useState<NotaSesion[]>(NOTAS_EJEMPLO)

  // Controla qué sección del expediente está expandida
  const [seccionActiva, setSeccionActiva] = useState<string>("motivo")

  // Controla si el formulario de nueva nota está visible
  const [agregandoNota, setAgregandoNota] = useState(false)

  // Texto de la nueva nota que se está escribiendo
  const [nuevaNota, setNuevaNota] = useState("")

  function toggleDiagnostico(diag: Diagnostico) {
    const yaSeleccionado = expediente.diagnosticos.find(d => d.id === diag.id)
    if (yaSeleccionado) {
      setExpediente(prev => ({
        ...prev,
        diagnosticos: prev.diagnosticos.filter(d => d.id !== diag.id)
      }))
    } else {
      setExpediente(prev => ({
        ...prev,
        diagnosticos: [...prev.diagnosticos, diag]
      }))
    }
  }

  function actualizarCampo(campo: keyof Expediente, valor: string) {
    setExpediente(prev => ({ ...prev, [campo]: valor }))
  }

  // Guarda la nueva nota de sesión
  // Cuando PHP esté listo, aquí irá crearNotaSesion(datos)
  function handleGuardarNota() {
    if (!nuevaNota.trim()) return

    const nota: NotaSesion = {
      id: notas.length + 1,
      citaId: 0,       // cuando PHP esté listo vendrá de la cita actual
      profesionalId: 1,
      contenido: nuevaNota,
      fechaCita: new Date().toISOString().split("T")[0], // fecha de hoy
      horaCita: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }

    // Agrega la nota al inicio de la lista — más reciente primero
    setNotas(prev => [nota, ...prev])
    setNuevaNota("")
    setAgregandoNota(false)
  }

  const secciones = [
    { id: "motivo", titulo: "Motivo de consulta", campo: "motivoConsulta" as keyof Expediente },
    { id: "condicion", titulo: "Condición actual", campo: "condicionActual" as keyof Expediente },
    { id: "infancia", titulo: "Infancia y adolescencia", campo: "infanciaAdolescencia" as keyof Expediente },
    { id: "eventos", titulo: "Eventos significativos", campo: "eventosSignificativos" as keyof Expediente },
    { id: "abuso", titulo: "Historial de abuso", campo: "historialAbuso" as keyof Expediente },
    { id: "metas", titulo: "Metas terapéuticas", campo: "metasTerapeuticas" as keyof Expediente },
  ]

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(`/psicologo/pacientes/${pacienteId}`)}
              className="text-sm text-slate-400 hover:text-dark transition-colors mb-1 flex items-center gap-1"
            >
              ← Volver al perfil
            </button>
            <h1 className="text-2xl font-bold text-dark">Expediente Clínico</h1>
            <p className="text-slate-500 text-sm mt-1">
              {expediente.pacienteNombre} {expediente.pacienteApellido}
            </p>
          </div>
          <button
            onClick={() => console.log("Guardar expediente:", expediente)}
            className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Guardar cambios
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda — diagnósticos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-dark mb-3">Diagnósticos</h3>
              <p className="text-xs text-slate-400 mb-3">
                Selecciona todos los que apliquen
              </p>
              <div className="flex flex-col gap-2">
                {DIAGNOSTICOS_DISPONIBLES.map((diag) => {
                  const seleccionado = expediente.diagnosticos.find(d => d.id === diag.id)
                  return (
                    <button
                      key={diag.id}
                      onClick={() => toggleDiagnostico(diag)}
                      className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                        seleccionado
                          ? "bg-primary text-white"
                          : "bg-background text-dark hover:bg-slate-200"
                      }`}
                    >
                      {diag.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Columna derecha — secciones + historial */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Secciones del expediente */}
            {secciones.map((seccion) => (
              <div key={seccion.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setSeccionActiva(
                    seccionActiva === seccion.id ? "" : seccion.id
                  )}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-dark">{seccion.titulo}</span>
                  <span className={`text-slate-400 transition-transform ${
                    seccionActiva === seccion.id ? "rotate-180" : ""
                  }`}>
                    ▼
                  </span>
                </button>

                {seccionActiva === seccion.id && (
                  <div className="px-5 pb-4">
                    <textarea
                      value={expediente[seccion.campo] as string}
                      onChange={(e) => actualizarCampo(seccion.campo, e.target.value)}
                      placeholder={`Escribe aquí sobre ${seccion.titulo.toLowerCase()}...`}
                      rows={5}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>
                )}
              </div>
            ))}

            {/* ===========================
                HISTORIAL DE SESIONES
                Cada nota está vinculada a una cita específica.
                Se ordenan de más reciente a más antigua.
                =========================== */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-dark">Notas de sesión</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {notas.length} sesiones registradas
                  </p>
                </div>
                <button
                  onClick={() => setAgregandoNota(!agregandoNota)}
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  {agregandoNota ? "Cancelar" : "+ Nueva nota"}
                </button>
              </div>

              {/* Formulario de nueva nota */}
              {agregandoNota && (
                <div className="mb-4 p-4 bg-background rounded-xl border border-primary border-opacity-30">
                  <p className="text-xs text-slate-400 mb-2">
                    {/* Muestra la fecha de hoy como referencia */}
                    Sesión del {new Date().toLocaleDateString("es-MX", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  <textarea
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Escribe las observaciones de esta sesión..."
                    rows={4}
                    autoFocus
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm mb-3"
                  />
                  <button
                    onClick={handleGuardarNota}
                    className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Guardar nota
                  </button>
                </div>
              )}

              {/* Lista de notas existentes */}
              {notas.length === 0 ? (
                <p className="text-sm text-slate-400">No hay notas de sesión registradas</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="border-l-4 border-primary pl-4 py-1"
                    >
                      {/* Fecha y hora de la cita */}
                      <p className="text-xs font-medium text-primary mb-1">
                        {new Date(nota.fechaCita).toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })} · {nota.horaCita} hrs
                      </p>
                      {/* Contenido de la nota */}
                      <p className="text-sm text-dark leading-relaxed">
                        {nota.contenido}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}