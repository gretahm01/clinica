import { useState, useRef } from "react"

// Forma de los datos que produce este modal al guardar
export interface DatosTarea {
  titulo: string
  contenido: string
  fechaLimite: string
  paraProximaCita: boolean
  archivo: File | null
}

interface ModalNuevaTareaProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosTarea) => void
  nombrePaciente: string
  proximaCitaFecha?: string
}

export default function ModalNuevaTarea({
  abierto,
  onCerrar,
  onGuardar,
  nombrePaciente,
  proximaCitaFecha,
}: ModalNuevaTareaProps) {

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
    if (!titulo.trim()) return setError("El título es requerido")
    if (!contenido.trim()) return setError("La descripción es requerida")
    if (!paraProximaCita && !fechaLimite) {
      return setError("Selecciona una fecha límite o marca 'Para la próxima cita'")
    }

    // 2. Ejecutar la función onGuardar enviando los datos
    // Usamos la prop "onGuardar" directamente.
    onGuardar({
      titulo,
      contenido,
      fechaLimite: paraProximaCita ? (proximaCitaFecha || "") : fechaLimite,
      paraProximaCita,
      archivo
    })

    // 3. Limpiar y cerrar
    setTitulo("")
    setContenido("")
    setFechaLimite("")
    setParaProximaCita(false)
    setArchivo(null)
    setError("")
  }

  function handleCerrar() {
    setError("")
    onCerrar()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto py-6"
      onClick={handleCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-dark">Nueva Tarea</h2>
          <button
            onClick={handleCerrar}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* A quién se asigna */}
        <p className="text-sm text-slate-400 mb-5">
          Asignando a <span className="text-primary font-medium">{nombrePaciente}</span>
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Título de la tarea
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Diario de emociones"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Descripción / Instrucciones
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe qué debe hacer el paciente..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Fecha límite de entrega
            </label>

            {proximaCitaFecha && (
              <button
                onClick={() => {
                  setParaProximaCita(!paraProximaCita)
                  if (!paraProximaCita) setFechaLimite("")
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm mb-2 transition-colors ${
                  paraProximaCita
                    ? "border-primary bg-primary bg-opacity-10 text-dark"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Para la próxima cita</p>
                    <p className="text-xs text-slate-400">{proximaCitaFecha}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          {/* Archivo adjunto */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Archivo adjunto <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <div
              onClick={() => inputArchivoRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {archivo ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark truncate">{archivo.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setArchivo(null)
                    }}
                    className="text-slate-400 hover:text-red-500 text-xs ml-2"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Haz clic para adjuntar un archivo</p>
              )}
            </div>
            <input
              ref={inputArchivoRef}
              type="file"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCerrar}
            className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg transition-colors font-medium"
          >
            Asignar tarea
          </button>
        </div>

      </div>
    </div>
  )
}