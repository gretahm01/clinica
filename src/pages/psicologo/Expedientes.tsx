import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import type { Paciente, ExpedienteClinico, Diagnostico } from "../../types"
import { getPaciente, getExpediente, actualizarExpediente } from "../../services/api"

type CampoTexto = keyof Pick<
  ExpedienteClinico,
  "motivoConsulta" | "condicionActual" | "infanciaAdolescencia" | "eventosSignificativos" | "historialAbuso" | "metasTerapeuticas"
>

type FormData = Record<CampoTexto, string>

const CAMPOS: { key: CampoTexto; label: string }[] = [
  { key: "motivoConsulta",        label: "Motivo de consulta" },
  { key: "condicionActual",       label: "Condición actual" },
  { key: "infanciaAdolescencia",  label: "Infancia y adolescencia" },
  { key: "eventosSignificativos", label: "Eventos significativos" },
  { key: "historialAbuso",        label: "Historial de abuso" },
  { key: "metasTerapeuticas",     label: "Metas terapéuticas" },
]

function formDesde(exp: ExpedienteClinico): FormData {
  return {
    motivoConsulta:        exp.motivoConsulta        ?? "",
    condicionActual:       exp.condicionActual        ?? "",
    infanciaAdolescencia:  exp.infanciaAdolescencia   ?? "",
    eventosSignificativos: exp.eventosSignificativos  ?? "",
    historialAbuso:        exp.historialAbuso         ?? "",
    metasTerapeuticas:     exp.metasTerapeuticas      ?? "",
  }
}

export default function Expedientes() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  const [paciente, setPaciente]              = useState<Paciente | null>(null)
  const [expediente, setExpediente]          = useState<ExpedienteClinico | null>(null)
  const [cargando, setCargando]              = useState(true)
  const [error, setError]                    = useState("")
  const [editando, setEditando]              = useState(false)
  const [guardando, setGuardando]            = useState(false)
  const [exito, setExito]                    = useState(false)
  const [form, setForm]                      = useState<FormData>({
    motivoConsulta: "", condicionActual: "", infanciaAdolescencia: "",
    eventosSignificativos: "", historialAbuso: "", metasTerapeuticas: "",
  })
  const [catalogo, setCatalogo]              = useState<Diagnostico[]>([])
  const [selectedDx, setSelectedDx]          = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!pacienteId) return
    cargar()
  }, [pacienteId])

  async function cargar() {
    try {
      setCargando(true)
      setError("")
      const [resPac, resExp] = await Promise.all([
        getPaciente(Number(pacienteId)),
        getExpediente(Number(pacienteId)),
      ])

      if (resPac.success) setPaciente(resPac.data)

      if (resExp.success) {
        const exp = resExp.data
        setExpediente(exp)
        setForm(formDesde(exp))
        if (exp.diagnosticosDisponibles) setCatalogo(exp.diagnosticosDisponibles)
        if (exp.diagnosticos) setSelectedDx(new Set(exp.diagnosticos.map(d => d.id)))
      } else {
        setError(resExp.message ?? "No se pudo cargar el expediente")
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  function toggleDx(id: number) {
    setSelectedDx(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleGuardar() {
    if (!expediente) return
    console.log("expediente.id:", expediente.id)
    setGuardando(true)
    setExito(false)
    try {
      const res = await actualizarExpediente(expediente.id, {
        ...form,
        diagnosticosIds: Array.from(selectedDx),
      })
      if (res.success) {
        setExpediente(prev => prev ? { ...prev, ...form } : prev)
        setExito(true)
        setEditando(false)
        setTimeout(() => setExito(false), 3000)
      } else {
        alert(res.message ?? "Error al guardar")
      }
    } catch {
      alert("Error de conexión al guardar")
    } finally {
      setGuardando(false)
    }
  }

  function handleCancelar() {
    if (!expediente) return
    setForm(formDesde(expediente))
    if (expediente.diagnosticos) setSelectedDx(new Set(expediente.diagnosticos.map(d => d.id)))
    setEditando(false)
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

  if (error || !expediente) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-red-500 font-medium">{error || "Expediente no encontrado"}</p>
          <button
            onClick={() => navigate(`/psicologo/pacientes/${pacienteId}`)}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Volver al perfil del paciente
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
          onClick={() => navigate(`/psicologo/pacientes/${pacienteId}`)}
          className="text-sm text-slate-400 hover:text-dark transition-colors mb-4 flex items-center gap-1"
        >
          ← Volver al perfil del paciente
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {paciente ? `${paciente.nombre[0]}${paciente.apellido[0]}` : "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark">Expediente clínico</h1>
                {paciente && (
                  <p className="text-slate-500 text-sm">
                    {paciente.nombre} {paciente.apellido}
                    {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">
                  Creado el{" "}
                  {new Date(expediente.fechaCreacion + "T12:00:00").toLocaleDateString("es-MX")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {exito && (
                <span className="text-sm text-green-600 font-medium">Cambios guardados</span>
              )}
              {editando ? (
                <>
                  <button
                    onClick={handleCancelar}
                    className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditando(true)}
                  className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Editar expediente
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda — diagnósticos */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-dark mb-1">Diagnósticos</h3>
              <p className="text-xs text-slate-400 mb-4">
                {editando ? "Selecciona todos los que apliquen" : "Diagnósticos asignados"}
              </p>
              {catalogo.length === 0 ? (
                <p className="text-sm text-slate-400">Sin datos</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {catalogo.map(dx => (
                    <label
                      key={dx.id}
                      className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${
                        editando ? "cursor-pointer hover:bg-background" : "cursor-default"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDx.has(dx.id)}
                        onChange={() => editando && toggleDx(dx.id)}
                        disabled={!editando}
                        className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
                      />
                      <span className={`text-sm leading-snug ${
                        selectedDx.has(dx.id) ? "text-dark font-medium" : "text-slate-500"
                      }`}>
                        {dx.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha — campos clínicos */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {CAMPOS.map(({ key, label }) => (
              <div key={key} className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-semibold text-dark mb-3">{label}</h3>
                {editando ? (
                  <textarea
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={4}
                    placeholder={`Escribe sobre ${label.toLowerCase()}...`}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  />
                ) : form[key] ? (
                  <p className="text-sm text-dark whitespace-pre-wrap leading-relaxed">{form[key]}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sin información registrada</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
