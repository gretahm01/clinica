// ===========================
// src/components/ui/ModalSolicitarCita.tsx
// ===========================
import { useState } from "react"

export interface DatosSolicitudCita {
  fecha: string
  hora: string
  motivo: string
}

interface ModalSolicitarCitaProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosSolicitudCita) => void
}

export default function ModalSolicitarCita({ abierto, onCerrar, onGuardar }: ModalSolicitarCitaProps) {
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [motivo, setMotivo] = useState("")
  const [error, setError] = useState("")
  const [enviado, setEnviado] = useState(false)

  // Generamos las "Horas Cerradas" (de 8:00 AM a 8:00 PM cada 30 min)
  const generarHorarios = () => {
    const horas = [];
    for (let h = 8; h <= 20; h++) {
      const horaPad = h.toString().padStart(2, '0');
      horas.push(`${horaPad}:00`);
      if (h < 20) horas.push(`${horaPad}:30`);
    }
    return horas;
  };

  const opcionesHoras = generarHorarios();
  const hoy = new Date().toISOString().split("T")[0];

  if (!abierto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) return setError("Selecciona una fecha");
    if (!hora)  return setError("Selecciona una hora");

    onGuardar({ fecha, hora, motivo });
    setEnviado(true);
  }

  function handleCerrar() {
    setFecha(""); setHora(""); setMotivo(""); setError(""); setEnviado(false);
    onCerrar();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleCerrar}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        
        {enviado ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">¡Solicitud enviada!</h3>
            <p className="text-sm text-slate-500 mb-6">Tu psicólogo la revisará pronto.</p>
            <button onClick={handleCerrar} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors">
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Solicitar cita</h2>
              <button type="button" onClick={handleCerrar} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <p className="text-sm text-slate-400 mb-5">Indica tu fecha y hora preferidas.</p>

            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    min={hoy}
                    onChange={(e) => { setFecha(e.target.value); setError(""); }}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Hora</label>
                  {/* CAMBIO: De input type="time" a select */}
                  <select
                    required
                    value={hora}
                    onChange={(e) => { setHora(e.target.value); setError(""); }}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {opcionesHoras.map((h) => (
                      <option key={h} value={h}>{h} hrs</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Motivo (opcional)</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="¿Qué quieres tratar?"
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={handleCerrar} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium text-sm">Cancelar</button>
              <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium text-sm">Enviar solicitud</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}