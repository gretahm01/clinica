// ===========================
// src/pages/psicologo/Expedientes.tsx
// ===========================
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { NotaSesion } from "../../types"
import { getExpediente, actualizarExpediente } from "../../services/api"

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
  notasSesion: NotaSesion[]
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

export default function Expedientes() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  // 1. ESTADOS
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [expediente, setExpediente] = useState<Expediente | null>(null)
  const [seccionActiva, setSeccionActiva] = useState<string>("motivo")

  // 2. CARGAR DATOS DE PHP
  useEffect(() => {
    async function cargarDatos() {
      if (!pacienteId) return
      setCargando(true) // Aseguramos que inicie en cargando
      try {
        const res = await getExpediente(Number(pacienteId))
        if (res.success && res.data) {
          setExpediente(res.data)
        } else {
          console.error("Respuesta del servidor sin datos")
        }
      } catch (error) {
        console.error("Error de conexión al cargar expediente:", error)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [pacienteId])

  // 3. FUNCIONES DE ACCIÓN
  async function handleGuardarExpediente() {
    if (!expediente) return
    setGuardando(true)
    try {
      const res = await actualizarExpediente(expediente.id, expediente)
      if (res.success) {
        alert("¡Expediente guardado correctamente!")
      } else {
        alert("Ocurrió un problema al guardar.")
      }
    } catch (error) {
      alert("Error de conexión al guardar el expediente.")
    } finally {
      setGuardando(false)
    }
  }

  function toggleDiagnostico(diag: Diagnostico) {
    if (!expediente) return
    const yaSeleccionado = expediente.diagnosticos.find(d => d.id === diag.id)
    if (yaSeleccionado) {
      setExpediente({
        ...expediente,
        diagnosticos: expediente.diagnosticos.filter(d => d.id !== diag.id)
      })
    } else {
      setExpediente({
        ...expediente,
        diagnosticos: [...expediente.diagnosticos, diag]
      })
    }
  }

  function actualizarCampo(campo: keyof Expediente, valor: string) {
    if (!expediente) return
    setExpediente({ ...expediente, [campo]: valor })
  }

  const secciones = [
    { id: "motivo", titulo: "Motivo de consulta", campo: "motivoConsulta" as keyof Expediente },
    { id: "condicion", titulo: "Condición actual", campo: "condicionActual" as keyof Expediente },
    { id: "infancia", titulo: "Infancia y adolescencia", campo: "infanciaAdolescencia" as keyof Expediente },
    { id: "eventos", titulo: "Eventos significativos", campo: "eventosSignificativos" as keyof Expediente },
    { id: "abuso", titulo: "Historial de abuso", campo: "historialAbuso" as keyof Expediente },
    { id: "metas", titulo: "Metas terapéuticas", campo: "metasTerapeuticas" as keyof Expediente },
  ]

  // Pantallas de carga y error
  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-500 font-medium">Cargando expediente clínico...</p>
      </div>
    )
  }

  if (!expediente) return <div className="p-10 text-center">No se encontró el expediente.</div>

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
            onClick={handleGuardarExpediente}
            disabled={guardando}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda — diagnósticos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-dark mb-3">Diagnósticos</h3>
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
            {secciones.map((seccion) => (
              <div key={seccion.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setSeccionActiva(seccionActiva === seccion.id ? "" : seccion.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-dark">{seccion.titulo}</span>
                  <span className={`text-slate-400 transition-transform ${seccionActiva === seccion.id ? "rotate-180" : ""}`}>
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

            {/* NOTAS DE SESIÓN (Desde las citas) */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-dark">Notas de sesión</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {expediente.notasSesion?.length || 0} sesiones con notas registradas
                  </p>
                </div>
              </div>

              {(!expediente.notasSesion || expediente.notasSesion.length === 0) ? (
                <p className="text-sm text-slate-400">No hay notas clínicas registradas.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {expediente.notasSesion.map((nota) => (
                    <div
                      key={nota.id}
                      className="border-l-4 border-blue-500 bg-slate-50 rounded-r-lg pl-4 pr-3 py-3"
                    >
                      <p className="text-xs font-bold text-blue-600 mb-1">
                        {new Date(nota.fechaCita + "T12:00:00").toLocaleDateString("es-MX", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric"
                        })} · {nota.horaCita.slice(0, 5)} hrs
                      </p>
                      <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap">
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