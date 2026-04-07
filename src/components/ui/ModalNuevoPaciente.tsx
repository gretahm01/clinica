// ===========================
// src/components/ui/ModalNuevoPaciente.tsx
// ===========================
// Formulario modal para registrar un paciente nuevo.
// Se abre desde la pantalla de Pacientes.
//
// Estructura de BD que llena este formulario:
//   - tabla user: nombre, apellido, email, teléfono, fecha nacimiento
//   - tabla emergency_contact: nombre, teléfono, parentesco
//   - tabla user_access: PHP genera usuario + contraseña temporal
//
// Nuevo campo: notificarPaciente
//   - true  → PHP manda correo al paciente con sus credenciales
//   - false → el psicólogo da las credenciales en persona
// ===========================

import { useState } from "react"

export interface DatosPaciente {
  // Datos para tabla user
  nombre: string
  apellido: string
  segundoApellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  // Datos para tabla emergency_contact (opcionales)
  contactoNombre: string
  contactoTelefono: string
  contactoParentesco: string
  // Controla si PHP debe enviar correo con credenciales al paciente
  notificarPaciente: boolean
}

interface ModalNuevoPacienteProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (datos: DatosPaciente) => void
  guardando?: boolean
}

export default function ModalNuevoPaciente({
  abierto,
  onCerrar,
  onGuardar,
  guardando = false,
}: ModalNuevoPacienteProps) {

  const [nombre, setNombre]                   = useState("")
  const [apellido, setApellido]               = useState("")
  const [segundoApellido, setSegundoApellido] = useState("")
  const [email, setEmail]                     = useState("")
  const [telefono, setTelefono]               = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")

  const [contactoNombre, setContactoNombre]           = useState("")
  const [contactoTelefono, setContactoTelefono]       = useState("")
  const [contactoParentesco, setContactoParentesco]   = useState("")

  // true = PHP enviará correo al paciente con usuario y contraseña temporal
  // Viene marcado por defecto porque es lo más conveniente
  const [notificarPaciente, setNotificarPaciente] = useState(true)

  const [error, setError] = useState("")

  if (!abierto) return null

  function handleGuardar() {
    if (!nombre.trim())         return setError("El nombre es requerido")
    if (!apellido.trim())       return setError("El apellido es requerido")
    if (!email.trim())          return setError("El correo es requerido")
    if (!telefono.trim())       return setError("El teléfono es requerido")
    if (!fechaNacimiento)       return setError("La fecha de nacimiento es requerida")

    onGuardar({
      nombre,
      apellido,
      segundoApellido,
      email,
      telefono,
      fechaNacimiento,
      contactoNombre,
      contactoTelefono,
      contactoParentesco,
      notificarPaciente,
    })

    // Limpia todos los campos al guardar
    setNombre("")
    setApellido("")
    setSegundoApellido("")
    setEmail("")
    setTelefono("")
    setFechaNacimiento("")
    setContactoNombre("")
    setContactoTelefono("")
    setContactoParentesco("")
    setNotificarPaciente(true)
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark">Nuevo Paciente</h2>
          <button
            onClick={handleCerrar}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Apellido paterno
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Pérez"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Apellido materno
              </label>
              <input
                type="text"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                placeholder="García"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Teléfono y fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="833 123 4567"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-dark mb-3">
              Contacto de emergencia
              <span className="text-slate-400 font-normal ml-1">(opcional)</span>
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-dark mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={contactoNombre}
                onChange={(e) => setContactoNombre(e.target.value)}
                placeholder="María García"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={contactoTelefono}
                  onChange={(e) => setContactoTelefono(e.target.value)}
                  placeholder="833 123 4567"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={contactoParentesco}
                  onChange={(e) => setContactoParentesco(e.target.value)}
                  placeholder="Madre, Padre..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* ===========================
              NOTIFICACIÓN POR CORREO
              Controla si PHP manda las credenciales al paciente.
              Viene marcado por defecto — el psicólogo puede desmarcarlo
              si prefiere entregar las credenciales en persona.
              =========================== */}
          <div className="border-t border-slate-100 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              {/* Checkbox estilizado con accent-primary para que use el color del sistema */}
              <input
                type="checkbox"
                checked={notificarPaciente}
                onChange={(e) => setNotificarPaciente(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-primary cursor-pointer flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-dark">
                  Enviar credenciales de acceso por correo
                </p>
                {/* Descripción dinámica según el estado del checkbox */}
                <p className="text-xs text-slate-400 mt-0.5">
                  {notificarPaciente
                    ? `Se enviará un correo a ${email || "su correo"} con usuario y contraseña temporal para que pueda iniciar sesión.`
                    : "Las credenciales no se enviarán. Puedes dárselas al paciente en persona más tarde."
                  }
                </p>
              </div>
            </label>
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
            disabled={guardando}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg transition-colors font-medium disabled:opacity-60"
          >
            {guardando ? "Registrando..." : "Registrar paciente"}
          </button>
        </div>

      </div>
    </div>
  )
}