// ===========================
// src/services/api.ts
// ===========================
// Este archivo es el ÚNICO punto de contacto entre tu app
// y el servidor PHP. Todas las peticiones pasan por aquí.
//
// Ventaja: si tu compañero cambia la URL del servidor o
// la estructura de la API, solo editas ESTE archivo,
// no tienes que buscar en 20 componentes diferentes.
// ===========================

import axios from "axios"
import type { ApiResponse, Usuario, Paciente, Cita } from "../types"

// ---------------------
// CONFIGURACIÓN BASE
// ---------------------
// Aquí defines la URL donde está corriendo PHP.
// Cuando el proyecto pase a producción (servidor real),
// solo cambias esta línea y todo funciona.
const api = axios.create({
  baseURL: "http://localhost/MedTrack/medtrack/backend",  // URL de tu compañero de PHP
headers: {
    "Content-Type": "application/json"       // le decimos a PHP que mandamos JSON
}
})

// ---------------------
// INTERCEPTOR DE TOKEN
// ---------------------
// Un interceptor es código que se ejecuta ANTES de cada
// petición automáticamente. Este agrega el token del usuario
// a cada petición para que PHP sepa quién eres.
//
// Sin esto tendrías que agregar el token manualmente
// en cada función — muy repetitivo y fácil de olvidar.
api.interceptors.request.use((config) => {
const usuarioGuardado = localStorage.getItem("usuario")

if (usuarioGuardado) {
    const usuario: Usuario = JSON.parse(usuarioGuardado)
    // PHP leerá este header para verificar que estás autenticado
    config.headers.Authorization = `Bearer ${usuario.token}`
}

return config
})

// ===========================
// AUTENTICACIÓN
// ===========================

// Envía email y password a PHP, recibe los datos del usuario
// con su rol. El Login.tsx llama esta función.
export async function loginRequest(email: string, password: string) {
const response = await api.post<ApiResponse<Usuario>>("/auth/login", {
    email,
    password
})
return response.data
}

// ===========================
// PACIENTES
// ===========================

// Obtiene la lista de todos los pacientes.
// El psicólogo y la secretaria usan esta función.
//NOTA DE GRETA: aquí te cambié el getPacientes para ver la lista de pacientes
export async function getPacientes() {
    const response = await api.get<ApiResponse<Paciente[]>>("/pacientes")
    return response.data
}

// Obtiene un paciente específico por su ID.
// Se usa al abrir el expediente de un paciente.
export async function getPaciente(id: number) {
const response = await api.get<ApiResponse<Paciente>>(`/pacientes/${id}`)
return response.data
}

// Crea un paciente nuevo en la base de datos.
// "Omit<Paciente, 'id'>" significa todos los campos de Paciente
// EXCEPTO el id, porque ese lo genera la BD automáticamente.
export async function crearPaciente(datos: Omit<Paciente, "id">) {
const response = await api.post<ApiResponse<Paciente>>("/pacientes", datos)
return response.data
}

// ===========================
// CITAS
// ===========================

export async function getCitas() {
const response = await api.get<ApiResponse<Cita[]>>("/citas")
return response.data
}

export async function getCitasPorPaciente(pacienteId: number) {
const response = await api.get<ApiResponse<Cita[]>>(`/citas/paciente/${pacienteId}`)
return response.data
}

export async function crearCita(datos: Omit<Cita, "id">) {
const response = await api.post<ApiResponse<Cita>>("/citas", datos)
return response.data
}

export async function actualizarCita(id: number, datos: Partial<Cita>) {
  // Partial<Cita> significa que puedes mandar solo ALGUNOS campos
  // de Cita, no todos. Útil para actualizar solo el estado por ejemplo.
const response = await api.put<ApiResponse<Cita>>(`/citas/${id}`, datos)
return response.data
}

export async function cancelarCita(id: number) {
const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/cancelar`, {})
return response.data
}

// ===========================
// SOLICITUDES DE REGISTRO
// ===========================

// Datos que manda el formulario de Registro.tsx
export interface DatosSolicitudRegistro {
  nombreClinica: string
  nombreContacto: string
  email: string
  telefono: string
  plan: string
  mensaje: string
}

// Envía la solicitud de prueba gratis al servidor PHP.
// PHP se encarga de:
//   1. Guardar la solicitud en BD
//   2. Crear la cuenta admin de la clínica
//   3. Mandar el correo con credenciales
export async function solicitarAcceso(datos: DatosSolicitudRegistro) {
  const response = await api.post<ApiResponse<{ mensaje: string }>>(
    "/registro/solicitar",
    datos
  )
  return response.data
}