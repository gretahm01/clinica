// ===========================
// src/services/api.ts
// ===========================
// Este archivo es el ÚNICO punto de contacto entre React y PHP.
// Todas las peticiones al servidor pasan por aquí.

import axios from "axios"
import type {
  ApiResponse,
  Usuario,
  Paciente,
  Cita,
  Tarea,
  ExpedienteClinico,
  ContactoEmergencia,
  Profesional,
  Especialidad,
} from "../types"


// ===========================
// CONFIGURACIÓN BASE DE AXIOS
// ===========================
const api = axios.create({
  baseURL: "http://localhost/clinica/backend",
  headers: {
    "Content-Type": "application/json", 
  },
})

// ===========================
// INTERCEPTOR DE TOKEN
// ===========================
api.interceptors.request.use((config) => {
  const usuarioGuardado = localStorage.getItem("usuario")

  if (usuarioGuardado) {
    const usuario: Usuario = JSON.parse(usuarioGuardado)
    config.headers.Authorization = `Bearer ${usuario.token}`
  }

  return config
})


// ===========================
// AUTENTICACIÓN
// ===========================
export async function loginRequest(email: string, password: string) {
  const response = await api.post<ApiResponse<Usuario>>("/auth/login", {
    email,
    password,
  })
  return response.data
}


// ===========================
// PACIENTES
// ===========================
export async function getPacientes() {
  const response = await api.get<ApiResponse<Paciente[]>>("/pacientes")
  return response.data
}

export async function getPaciente(id: number) {
  const response = await api.get<ApiResponse<Paciente>>(`/pacientes/${id}`)
  return response.data
}

export async function crearPaciente(datos: Omit<Paciente, "id">) {
  const response = await api.post<ApiResponse<Paciente>>("/pacientes", datos)
  return response.data
}

export async function actualizarPaciente(id: number, datos: Partial<Paciente>) {
  const response = await api.put<ApiResponse<Paciente>>(`/pacientes/${id}`, datos)
  return response.data
}


// ===========================
// CONTACTO DE EMERGENCIA
// ===========================
export async function getContactoEmergencia(pacienteId: number) {
  const response = await api.get<ApiResponse<ContactoEmergencia>>(
    `/pacientes/${pacienteId}/contacto-emergencia`
  )
  return response.data
}

export async function guardarContactoEmergencia(pacienteId: number, datos: {nombre: string, telefono: string, parentesco: string}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await api.post<ApiResponse<any>>(`/pacientes/${pacienteId}/contacto-emergencia`, datos);
  return response.data;
}


// ===========================
// CITAS
// ===========================
export async function getCitas() {
  const response = await api.get<ApiResponse<Cita[]>>("/citas")
  return response.data
}

export async function getCitasPorPaciente(pacienteId: number) {
  const response = await api.get<ApiResponse<Cita[]>>(
    `/citas/paciente/${pacienteId}`
  )
  return response.data
}

export async function getCitasHoy() {
  const response = await api.get<ApiResponse<{
    id: number
    hora: string
    estado: string
    nombre: string
    apellido: string
    motivo?: string
  }[]>>("/citas/hoy")
  return response.data
}

export async function crearCita(datos: Omit<Cita, "id">) {
  const response = await api.post<ApiResponse<Cita>>("/citas", datos)
  return response.data
}

export async function actualizarCita(id: number, datos: Partial<Cita>) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}`, datos)
  return response.data
}

export async function cancelarCita(id: number) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/cancelar`, {})
  return response.data
}

export async function confirmarCita(id: number) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/confirmar`, {})
  return response.data
}

export const completarCita = async (id: number) => {
  const res = await api.put(`/citas/${id}/completar`);
  return res.data;
};

export async function reagendarCita(id: number, fecha: string, hora: string, motivo: string, estado: string = 'reagendada') {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/reagendar`, {
    fecha,
    hora,
    motivo,
    estado
  })
  return response.data
}

export async function guardarFeedbackCita(id: number, feedback: string) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/feedback`, {
    feedback,
  })
  return response.data
}

// Respaldo de la función de Greta por si se usa en otro componente
export async function guardarFeedback(citaId: number, feedback: string) {
  const response = await api.put<ApiResponse<null>>(`/citas/${citaId}/feedback`, { feedback })
  return response.data
}

export async function guardarNotasCita(id: number, notes: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await api.put<ApiResponse<any>>(`/citas/${id}/notes`, { 
    notes 
  })
  return response.data
}


// ===========================
// TAREAS
// ===========================
export async function getTareasPorPaciente(pacienteId: number) {
  const response = await api.get<ApiResponse<Tarea[]>>(
    `/tareas/paciente/${pacienteId}`
  )
  return response.data
}

export async function getTarea(id: number) {
  const response = await api.get<ApiResponse<Tarea>>(`/tareas/${id}`)
  return response.data
}

export async function crearTarea(datos: Omit<Tarea, "id" | "fechaCreacion" | "fechaEntrega">) {
  const response = await api.post<ApiResponse<Tarea>>("/tareas", datos)
  return response.data
}

export async function actualizarTarea(id: number, datos: Partial<Tarea>) {
  const response = await api.put<ApiResponse<Tarea>>(`/tareas/${id}`, datos)
  return response.data
}

export async function getTareasPaciente(pacienteId: number) {
  const response = await api.get<ApiResponse<Tarea[]>>(`/tareas/paciente/${pacienteId}`)
  return response.data
}

export async function eliminarTarea(id: number) {
  const response = await api.delete<ApiResponse<null>>(`/tareas/${id}`)
  return response.data
}


// ===========================
// EXPEDIENTE CLÍNICO
// ===========================
export async function getExpediente(pacienteId: number) {
  const response = await api.get<ApiResponse<ExpedienteClinico>>(
    `/expediente/paciente/${pacienteId}`
  )
  return response.data
}

export async function actualizarExpediente(
  id: number,
  datos: Partial<ExpedienteClinico>
) {
  const response = await api.put<ApiResponse<ExpedienteClinico>>(
    `/expediente/${id}`,
    datos
  )
  return response.data
}


// ===========================
// PERFIL DEL PSICÓLOGO
// ===========================
export async function getPerfilPsicologo() {
  const response = await api.get<ApiResponse<Profesional>>("/profesional/perfil")
  return response.data
}

export async function actualizarPerfilPsicologo(datos: Partial<Profesional>) {
  const response = await api.put<ApiResponse<Profesional>>(
    "/profesional/perfil",
    datos
  )
  return response.data
}

export async function cambiarContrasena(contrasenaActual: string, contrasenaNueva: string) {
  const response = await api.patch<ApiResponse<{ mensaje: string }>>(
    "/profesional/cambiar-contrasena",
    { contrasenaActual, contrasenaNueva }
  )
  return response.data
}


// ===========================
// ESPECIALIDADES
// ===========================
export async function getEspecialidades() {
  const response = await api.get<ApiResponse<Especialidad[]>>("/especialidades")
  return response.data
}


// ===========================
// SOLICITUDES DE REGISTRO
// ===========================
export interface DatosSolicitudRegistro {
  nombreClinica: string
  nombreContacto: string
  email: string
  telefono: string
  plan: string
  mensaje: string
}

export async function solicitarAcceso(datos: DatosSolicitudRegistro) {
  const response = await api.post<ApiResponse<{ mensaje: string }>>(
    "/registro/solicitar",
    datos
  )
  return response.data
}

// ===========================
// NOTIFICACIONES
// ===========================
export const getNotificaciones = async () => {
  const res = await api.get('/notificaciones');
  return res.data;
};

export const marcarNotificacionesLeidas = async () => {
  const res = await api.put('/notificaciones');
  return res.data;
};