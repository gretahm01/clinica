// ===========================
// src/components/ui/ModalNuevaTarea.tsx
// ===========================
// Formulario modal para asignar una tarea a un paciente.
// Se abre desde el perfil del paciente.
//
// Campos de la tabla task en la BD:
//   - title: título de la tarea
//   - content: descripción detallada
//   - due_date: fecha límite
//   - image_path: archivo adjunto (tanto del psicólogo como del paciente)
// ===========================

import { useState, useRef } from "react"

// Forma de los datos que produce este modal al guardar
export interface DatosTarea {
  titulo: string
  contenido: string
  fechaLimite: string
  paraProximaCita: boolean
  archivo: File | null  // archivo que el psicólogo adjunta a la tarea
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

  // useRef apunta al input de tipo file que está oculto
  // Lo usamos para abrirlo al hacer clic en el área de drag-and-drop
  const inputArchivoRef = useRef<HTMLInputElement>(null)

  if (!abierto) return null

  function handleGuardar() {
    if (!titulo.trim()) return setError("El título es requerido")
    if (!contenido.trim()) return setError("La descripción es requerida")
    if (!paraProximaCita && !fechaLimite) return setError("Selecciona una fecha límite o marca 'Para la próxima cita'")

    onGuardar({
      titulo,
      contenido,
      fechaLimite: paraProximaCita ? (proximaCitaFecha || "") : fechaLimite,
      paraProximaCita,
      archivo,
    })

    // Limpia el formulario
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
              placeholder="Describe qué debe hacer el paciente, cómo y con qué frecuencia..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Fecha límite de entrega
            </label>

            {/* Opción: para la próxima cita */}
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

            {/* Fecha personalizada */}
            {!paraProximaCita && (
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            {paraProximaCita && (
              <button
                onClick={() => setParaProximaCita(false)}
                className="text-xs text-slate-400 hover:text-slate-600 mt-1"
              >
                Elegir otra fecha
              </button>
            )}
          </div>

          {/* Archivo adjunto del psicólogo */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Archivo adjunto <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            {/* Al hacer clic abre el input de archivo oculto */}
            <div
              onClick={() => inputArchivoRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {archivo ? (
                // Muestra el nombre del archivo seleccionado
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark truncate">{archivo.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // evita que abra el selector de archivo
                      setArchivo(null)
                    }}
                    className="text-slate-400 hover:text-red-500 text-xs ml-2 flex-shrink-0"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Haz clic para adjuntar un archivo
                </p>
              )}
            </div>
            {/* Input oculto — el div de arriba lo activa */}
            <input
              ref={inputArchivoRef}
              type="file"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </div>

          {/* Nota sobre archivos del paciente */}
          <div className="bg-background rounded-lg px-4 py-3 text-sm text-slate-500">
            📎 El paciente también podrá adjuntar archivos al entregar la tarea desde su interfaz.
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