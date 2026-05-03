// ===========================
// src/components/ui/ModalNuevaTarea.tsx
// ===========================

import { useState, useRef } from "react"

// Forma de los datos que produce este modal al guardar
export interface DatosTarea {
  titulo: string
  contenido: string
  fechaLimite: string
  paraProximaCita: boolean
  archivo: File | null
  pacienteId?: number // NUEVO: Para saber a quién se le asigna desde la vista general
}

interface ModalNuevaTareaProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosTarea) => void
  nombrePaciente?: string // AHORA ES OPCIONAL
  proximaCitaFecha?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pacientes?: any[] // NUEVO: Lista de pacientes para el dropdown
  guardando?: boolean // NUEVO: Estado de carga
}

export default function ModalNuevaTarea({
  abierto,
  onCerrar,
  onGuardar,
  nombrePaciente,
  proximaCitaFecha,
  pacientes,
  guardando = false
}: ModalNuevaTareaProps) {

  const [pacienteId, setPacienteId] = useState("") // NUEVO: Estado para el dropdown
  const [titulo, setTitulo] = useState("")
  const [contenido, setContenido] = useState("")
  const [fechaLimite, setFechaLimite] = useState("")
  const [paraProximaCita, setParaProximaCita] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState("")

  const inputArchivoRef = useRef<HTMLInputElement>(null)

  if (!abierto) return null

  function handleGuardar() {
    // 1. Validaciones
    if (pacientes && pacientes.length > 0 && !pacienteId) return setError("Por favor, selecciona un paciente")
    if (!titulo.trim()) return setError("El título es requerido")
    if (!contenido.trim()) return setError("Las instrucciones son requeridas")
    if (!paraProximaCita && !fechaLimite) {
      return setError("Selecciona una fecha límite o marca 'Para la próxima cita'")
    }

    // 2. Ejecutar la función onGuardar enviando los datos
    onGuardar({
      titulo,
      contenido,
      fechaLimite: paraProximaCita ? (proximaCitaFecha || "") : fechaLimite,
      paraProximaCita,
      archivo,
      pacienteId: pacienteId ? Number(pacienteId) : undefined
    })

    // 3. Limpiar
    setPacienteId("")
    setTitulo("")
    setContenido("")
    setFechaLimite("")
    setParaProximaCita(false)
    setArchivo(null)
    setError("")
  }

  function handleCerrar() {
    setPacienteId("")
    setError("")
    onCerrar()
  }

  // Obtenemos la fecha de hoy para bloquear fechas pasadas en el calendario
  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-6 p-4"
      onClick={handleCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-dark flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Nueva Tarea
          </h2>
          <button
            onClick={handleCerrar}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Lógica dinámica para la asignación */}
        {pacientes && pacientes.length > 0 ? (
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Asignar a Paciente
            </label>
            <select
              value={pacienteId}
              onChange={(e) => { setPacienteId(e.target.value); setError(""); }}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-shadow bg-slate-50/50 font-medium"
            >
              <option value="">Selecciona un paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
            Asignando a <span className="text-primary">{nombrePaciente}</span>
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Título de la tarea
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Diario de emociones"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow bg-slate-50/50"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Instrucciones
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe qué debe hacer el paciente..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-shadow bg-slate-50/50"
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Fecha límite de entrega
            </label>

            {proximaCitaFecha && (
              <button
                onClick={() => {
                  setParaProximaCita(!paraProximaCita)
                  if (!paraProximaCita) setFechaLimite("")
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm mb-3 transition-all ${
                  paraProximaCita
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Para la próxima cita</p>
                    <p className={`text-xs mt-0.5 ${paraProximaCita ? "text-primary/70" : "text-slate-400"}`}>
                      {new Date(proximaCitaFecha + "T12:00:00").toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paraProximaCita ? "border-primary bg-primary" : "border-slate-300"
                  }`}>
                    {paraProximaCita && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
              </button>
            )}

            {!paraProximaCita && (
              <input
                type="date"
                value={fechaLimite}
                min={hoy}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-shadow bg-white"
              />
            )}
          </div>

          {/* Archivo adjunto */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Material de apoyo <span className="font-normal normal-case">(opcional)</span>
            </label>
            <div
              onClick={() => inputArchivoRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-5 text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors"
            >
              {archivo ? (
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    <span className="text-sm font-bold text-dark truncate">{archivo.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setArchivo(null)
                    }}
                    className="text-slate-400 hover:text-red-500 text-xs font-bold bg-slate-100 hover:bg-red-50 px-2 py-1 rounded transition-colors ml-2"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500">Haz clic para adjuntar un archivo (PDF, DOC, JPG...)</p>
                </div>
              )}
            </div>
            <input
              ref={inputArchivoRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleCerrar}
            className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-xl transition-colors font-bold text-sm shadow-sm"
          >
            {guardando ? "Guardando..." : "Asignar Tarea"}
          </button>
        </div>

      </div>
    </div>
  )
}