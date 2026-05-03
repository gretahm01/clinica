// ===========================
// src/components/ui/ModalSolicitarCita.tsx
// ===========================

import { useState, useEffect } from "react"

export interface DatosSolicitudCita {
  fecha: string
  hora: string
  motivo?: string
}

interface ModalSolicitarCitaProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosSolicitudCita) => void
  guardando?: boolean
}

export default function ModalSolicitarCita({ abierto, onCerrar, onGuardar, guardando = false }: ModalSolicitarCitaProps) {
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [motivo, setMotivo] = useState("")

  useEffect(() => {
    if (abierto) {
      setFecha("")
      setHora("")
      setMotivo("")
    }
  }, [abierto])

  if (!abierto) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fecha || !hora) {
      alert("Por favor, selecciona fecha y hora.")
      return
    }
    onGuardar({ fecha, hora, motivo })
  }

  const hoyStr = new Date().toISOString().split("T")[0]

  // Generar opciones de hora en intervalos de 30 minutos (08:00 a 20:30)
  const opcionesHoras = (() => {
    const horas = [];
    for (let h = 8; h <= 20; h++) {
      const horaPad = h.toString().padStart(2, '0');
      horas.push(`${horaPad}:00`);
      if (h < 20) horas.push(`${horaPad}:30`);
    }
    return horas;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCerrar}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-dark">Solicitar nueva cita</h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Fecha</label>
              <input
                type="date"
                required
                min={hoyStr}
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Hora</label>
              <select
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary font-medium bg-slate-50"
              >
                <option value="">Selecciona hora...</option>
                {opcionesHoras.map(h => (
                  <option key={h} value={h}>{h} hrs</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-dark mb-1.5">
              Motivo <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="¿De qué te gustaría hablar en esta sesión?"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-slate-50"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2">
            <p className="text-xs text-blue-700 font-medium">
              Tu solicitud será revisada por tu psicólogo. Recibirás una confirmación si el horario está disponible.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
            >
              {guardando ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}