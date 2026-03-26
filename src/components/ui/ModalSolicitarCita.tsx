// ===========================
// src/components/ui/ModalSolicitarCita.tsx
// ===========================
// Modal que usa el PACIENTE para solicitar una nueva cita.
// No agenda directamente — manda una solicitud al psicólogo/secretaria
// para que ellos confirmen o propongan otro horario.
//
// Campos:
//   - Fecha preferida
//   - Hora preferida
//   - Motivo / notas (opcional)
//
// Cuando PHP esté listo:
//   - Conectar con solicitarCita(datos) en api.ts
//   - PHP crea un appointment con estado "pendiente"
//   - El psicólogo/secretaria lo ve y lo confirma o cancela
// ===========================

import { useState } from "react"

// Forma de los datos que produce este modal al guardar
export interface DatosSolicitudCita {
  fechaPreferida: string
  horaPreferida: string
  motivo: string
}

interface ModalSolicitarCitaProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosSolicitudCita) => void
}

export default function ModalSolicitarCita({
  abierto,
  onCerrar,
  onGuardar,
}: ModalSolicitarCitaProps) {

  const [fechaPreferida, setFechaPreferida] = useState("")
  const [horaPreferida, setHoraPreferida]   = useState("")
  const [motivo, setMotivo]                 = useState("")
  const [error, setError]                   = useState("")
  const [enviado, setEnviado]               = useState(false)

  // Fecha mínima = hoy (no puede pedir cita en el pasado)
  const hoy = new Date().toISOString().split("T")[0]

  if (!abierto) return null

  function handleGuardar() {
    if (!fechaPreferida) return setError("Selecciona una fecha preferida")
    if (!horaPreferida)  return setError("Selecciona una hora preferida")

    onGuardar({ fechaPreferida, horaPreferida, motivo })

    // Muestra pantalla de confirmación antes de cerrar
    setEnviado(true)
  }

  function handleCerrar() {
    // Limpia todo al cerrar
    setFechaPreferida("")
    setHoraPreferida("")
    setMotivo("")
    setError("")
    setEnviado(false)
    onCerrar()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={handleCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ===========================
            PANTALLA DE ÉXITO
            Se muestra después de enviar la solicitud
            =========================== */}
        {enviado ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">¡Solicitud enviada!</h3>
            <p className="text-sm text-slate-500 mb-1">
              Tu solicitud de cita para el <span className="font-medium text-dark">
                {new Date(fechaPreferida + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long", day: "numeric", month: "long"
                })}
              </span> a las <span className="font-medium text-dark">{horaPreferida} hrs</span> fue enviada.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Tu psicólogo la revisará y recibirás confirmación pronto.
            </p>
            <button
              onClick={handleCerrar}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-dark">Solicitar cita</h2>
              <button
                onClick={handleCerrar}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Explicación */}
            <p className="text-sm text-slate-400 mb-5">
              Indica tu fecha y hora preferidas. Tu psicólogo confirmará o te propondrá otro horario.
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">

              {/* Fecha y hora en la misma fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Fecha preferida
                  </label>
                  <input
                    type="date"
                    value={fechaPreferida}
                    min={hoy}
                    onChange={(e) => {
                      setFechaPreferida(e.target.value)
                      setError("")
                    }}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Hora preferida
                  </label>
                  <input
                    type="time"
                    value={horaPreferida}
                    onChange={(e) => {
                      setHoraPreferida(e.target.value)
                      setError("")
                    }}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1">
                  Motivo <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="¿Hay algo específico que quieras tratar en esta sesión?"
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                />
              </div>

              {/* Nota informativa */}
              <div className="bg-background rounded-lg px-4 py-3 text-sm text-slate-500">
                📅 Tu solicitud quedará como <span className="font-medium text-dark">"Por confirmar"</span> hasta que tu psicólogo la revise.
              </div>

            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCerrar}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
              >
                Enviar solicitud
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
