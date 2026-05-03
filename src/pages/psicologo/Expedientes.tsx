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
    condicionActual:       exp.condicionActual       ?? "",
    infanciaAdolescencia:  exp.infanciaAdolescencia  ?? "",
    eventosSignificativos: exp.eventosSignificativos ?? "",
    historialAbuso:        exp.historialAbuso        ?? "",
    metasTerapeuticas:     exp.metasTerapeuticas     ?? "",
  }
}

export default function Expedientes() {
  const { pacienteId } = useParams()
  const navigate = useNavigate()

  const [paciente, setPaciente]              = useState<Paciente | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expediente, setExpediente]          = useState<any | null>(null)
  const [cargando, setCargando]              = useState(true)
  const [error, setError]                    = useState("")
  
  // Estados de Greta (Modo Edición)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (exp.diagnosticos) setSelectedDx(new Set(exp.diagnosticos.map((d: Diagnostico) => d.id)))
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
    setGuardando(true)
    setExito(false)
    try {
      const res = await actualizarExpediente(expediente.id, {
        ...form,
        diagnosticosIds: Array.from(selectedDx),
      } as any)
      
      if (res.success) {
        setExpediente((prev: any) => prev ? { ...prev, ...form } : prev)
        setExito(true)
        setEditando(false)
        setTimeout(() => setExito(false), 3000)
      } else {
        alert(res.message ?? "Error al guardar")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // AQUÍ ESTÁ EL ATRAPA ERRORES NUEVO
      const mensajeBackend = err.response?.data?.message || "Error de conexión al guardar";
      alert(mensajeBackend);
      console.error("Detalle del error:", err.response?.data);
    } finally {
      setGuardando(false)
    }
  }

  function handleCancelar() {
    if (!expediente) return
    setForm(formDesde(expediente))
    if (expediente.diagnosticos) setSelectedDx(new Set(expediente.diagnosticos.map((d: Diagnostico) => d.id)))
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
          className="text-sm text-slate-400 hover:text-dark transition-colors mb-4 flex items-center gap-1 font-medium"
        >
          ← Volver al perfil del paciente
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl uppercase">
                {paciente ? `${paciente.nombre[0]}${paciente.apellido[0]}` : "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark">Expediente Clínico</h1>
                {paciente && (
                  <p className="text-slate-500 text-sm font-medium capitalize mt-0.5">
                    {paciente.nombre} {paciente.apellido}
                    {paciente.apellidoMaterno && ` ${paciente.apellidoMaterno}`}
                  </p>
                )}
                {expediente.fechaCreacion && (
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
                    Apertura: {new Date(expediente.fechaCreacion + "T12:00:00").toLocaleDateString("es-MX")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {exito && (
                <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  ¡Cambios guardados!
                </span>
              )}
              {editando ? (
                <>
                  <button
                    onClick={handleCancelar}
                    className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditando(true)}
                  className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar Expediente
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda — diagnósticos */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h3 className="font-bold text-dark mb-1">Diagnósticos</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                {editando ? "Selecciona los aplicables" : "Diagnósticos asignados"}
              </p>
              
              {catalogo.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No hay diagnósticos en el sistema</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {catalogo.map(dx => (
                    <label
                      key={dx.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        editando ? "cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-100" : "cursor-default"
                      } ${!editando && !selectedDx.has(dx.id) ? "hidden" : ""}`} 
                    >
                      <input
                        type="checkbox"
                        checked={selectedDx.has(dx.id)}
                        onChange={() => editando && toggleDx(dx.id)}
                        disabled={!editando}
                        className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
                      />
                      <span className={`text-sm leading-snug ${
                        selectedDx.has(dx.id) ? "text-dark font-bold" : "text-slate-500 font-medium"
                      }`}>
                        {dx.nombre}
                      </span>
                    </label>
                  ))}
                  {!editando && selectedDx.size === 0 && (
                    <p className="text-sm text-slate-400 italic mt-2">Ningún diagnóstico asignado</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha — campos clínicos y NOTAS DE SESIÓN */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* Secciones Clínicas */}
            {CAMPOS.map(({ key, label }) => (
              <div key={key} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                <h3 className="font-bold text-dark mb-3">{label}</h3>
                {editando ? (
                  <textarea
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={4}
                    placeholder={`Escribe aquí sobre ${label.toLowerCase()}...`}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm bg-slate-50/50"
                  />
                ) : form[key] ? (
                  <p className="text-sm text-dark whitespace-pre-wrap leading-relaxed">{form[key]}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sin información registrada en esta sección.</p>
                )}
              </div>
            ))}

            {/* NOTAS DE SESIÓN */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mt-2">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-dark">Historial de Notas de Sesión</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    {expediente.notasSesion?.length || 0} sesiones con notas
                  </p>
                </div>
              </div>

              {(!expediente.notasSesion || expediente.notasSesion.length === 0) ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400 italic">No hay notas clínicas privadas registradas en las citas de este paciente.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {expediente.notasSesion.map((nota: any) => (
                    <div
                      key={nota.id}
                      className="border-l-4 border-blue-500 bg-blue-50/30 rounded-r-xl pl-4 pr-3 py-4"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(nota.fechaCita + "T12:00:00").toLocaleDateString("es-MX", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric"
                        })} · {nota.horaCita.slice(0, 5)} hrs
                      </p>
                      <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap italic">
                        "{nota.contenido}"
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