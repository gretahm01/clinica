// ===========================
// src/services/api.ts
// ===========================
// Este archivo es el ÚNICO punto de contacto entre React y PHP.
// Todas las peticiones al servidor pasan por aquí.
//
// ¿Por qué centralizarlo aquí?
// Si Greta/Coque cambian una URL o la estructura del JSON,
// solo editas ESTE archivo — no tienes que buscar en 20 componentes.
//
// CÓMO USAR CUANDO PHP ESTÉ LISTO:
// Cada función tiene un comentario "TODO: conectar cuando PHP esté listo".
// Solo busca ese comentario, quita el mock y descomenta la llamada real.
//
// ESTRUCTURA DE URLs que usaremos:
//   /auth/login                          → iniciar sesión
//   /pacientes                           → lista de pacientes
//   /pacientes/:id                       → un paciente específico
//   /citas                               → todas las citas del psicólogo
//   /citas/paciente/:id                  → citas de un paciente específico
//   /tareas/paciente/:id                 → tareas de un paciente específico
//   /tareas/:id                          → una tarea específica
//   /expediente/paciente/:id             → expediente clínico
//   /profesional/perfil                  → perfil del psicólogo logueado
// ===========================

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
// axios.create() crea una instancia de axios con configuración predeterminada.
// Esto significa que TODAS las funciones de este archivo ya tienen:
//   - La URL base del servidor PHP
//   - El header Content-Type automáticamente
//
// PRODUCCIÓN: Cuando suban el proyecto a un servidor real,
// solo cambian la baseURL aquí y todo funciona.
const api = axios.create({
  baseURL: "http://localhost/MedTrack/clinica/backend",
  headers: {
    "Content-Type": "application/json", // le decimos a PHP que mandamos y esperamos JSON
  },
})


// ===========================
// INTERCEPTOR DE TOKEN
// ===========================
// Un interceptor es código que se ejecuta AUTOMÁTICAMENTE antes de cada petición.
// Este lee el token guardado en localStorage y lo agrega al header Authorization.
//
// ¿Por qué es necesario?
// PHP verifica ese token para saber quién eres y si tienes permiso
// de acceder a los datos que pides. Sin el token, PHP devuelve error 401.
//
// Sin este interceptor tendrías que escribir:
//   headers: { Authorization: `Bearer ${usuario.token}` }
// en CADA función del archivo — muy repetitivo y fácil de olvidar.
api.interceptors.request.use((config) => {
  const usuarioGuardado = localStorage.getItem("usuario")

  if (usuarioGuardado) {
    const usuario: Usuario = JSON.parse(usuarioGuardado)
    // PHP leerá este header en cada petición para verificar identidad
    config.headers.Authorization = `Bearer ${usuario.token}`
  }

  return config
})


// ===========================
// AUTENTICACIÓN
// ===========================

// Manda email y password a PHP.
// PHP verifica en user_access, genera un token JWT y regresa los datos del usuario.
// Si las credenciales son incorrectas, PHP responde con success: false.
//
// Se usa en: Login.tsx → handleSubmit()
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

// Trae la lista completa de pacientes del psicólogo logueado.
// PHP hace un JOIN entre patient + user para armar el objeto Paciente completo.
// También calcula totalCitas contando los appointments de cada paciente.
//
// Se usa en: Paciente.tsx → al cargar la pantalla
export async function getPacientes() {
  const response = await api.get<ApiResponse<Paciente[]>>("/pacientes")
  return response.data
}

// Trae los datos completos de UN paciente específico.
// PHP hace JOIN entre patient + user para armar el objeto.
//
// Se usa en: PerfilPaciente.tsx → al cargar la pantalla con el pacienteId del URL
export async function getPaciente(id: number) {
  const response = await api.get<ApiResponse<Paciente>>(`/pacientes/${id}`)
  return response.data
}

// Crea un paciente nuevo en la BD.
// PHP inserta en tabla user y tabla patient, y puede mandar correo con credenciales.
// "Omit<Paciente, 'id'>" = todos los campos de Paciente EXCEPTO el id
//   (el id lo genera la BD automáticamente con AUTO_INCREMENT)
//
// Se usa en: ModalNuevoPaciente.tsx → handleGuardar()
export async function crearPaciente(datos: Omit<Paciente, "id">) {
  const response = await api.post<ApiResponse<Paciente>>("/pacientes", datos)
  return response.data
}

// Actualiza los datos personales de un paciente.
// "Partial<Paciente>" = puedes mandar solo los campos que cambiaron, no todos.
//
// Se usa en: futuro formulario de edición de paciente
export async function actualizarPaciente(id: number, datos: Partial<Paciente>) {
  const response = await api.put<ApiResponse<Paciente>>(`/pacientes/${id}`, datos)
  return response.data
}


// ===========================
// CONTACTO DE EMERGENCIA
// ===========================

// Trae el contacto de emergencia de un paciente específico.
// PHP busca en emergency_contact por patient_id.
//
// Se usa en: PerfilPaciente.tsx → sección "Contacto de emergencia"
export async function getContactoEmergencia(pacienteId: number) {
  const response = await api.get<ApiResponse<ContactoEmergencia>>(
    `/pacientes/${pacienteId}/contacto-emergencia`
  )
  return response.data
}


// ===========================
// CITAS
// ===========================

// Trae TODAS las citas del psicólogo logueado.
// PHP filtra por professional_id del token.
// Se usan para mostrar el calendario en el Dashboard.
//
// Se usa en: Dashboard.tsx → para llenar el calendario con FullCalendar
export async function getCitas() {
  const response = await api.get<ApiResponse<Cita[]>>("/citas")
  return response.data
}

// Trae las citas de UN paciente específico.
// PHP filtra appointment por patient_id.
//
// Se usa en: PerfilPaciente.tsx → sección "Citas"
export async function getCitasPorPaciente(pacienteId: number) {
  const response = await api.get<ApiResponse<Cita[]>>(
    `/citas/paciente/${pacienteId}`
  )
  return response.data
}

// Crea una cita nueva en la BD.
// PHP inserta en tabla appointment.
//
// Se usa en: ModalNuevaCita.tsx → handleGuardar()
export async function crearCita(datos: Omit<Cita, "id">) {
  const response = await api.post<ApiResponse<Cita>>("/citas", datos)
  return response.data
}

// Actualiza campos de una cita (estado, feedback, hora, etc.).
// "Partial<Cita>" = solo mandas los campos que cambian.
//
// Se usa en: cuando el psicólogo cambia el estado de una cita
export async function actualizarCita(id: number, datos: Partial<Cita>) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}`, datos)
  return response.data
}

// Cancela una cita cambiando su estado a "cancelada".
// Atajo para no tener que escribir actualizarCita(id, { estado: "cancelada" }).
//
// Se usa en: cuando el psicólogo cancela una cita
export async function cancelarCita(id: number) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/cancelar`, {})
  return response.data
}

// Guarda el feedback/retroalimentación del psicólogo en una cita.
// PHP actualiza appointment.feedback por appointment_id.
//
// Se usa en: PerfilPaciente.tsx → modal de retroalimentación de cita
export async function guardarFeedbackCita(id: number, feedback: string) {
  const response = await api.put<ApiResponse<Cita>>(`/citas/${id}/feedback`, {
    feedback,
  })
  return response.data
}


// ===========================
// TAREAS
// ===========================

// Trae las tareas de UN paciente específico.
// PHP filtra task por patient_id.
//
// Se usa en: PerfilPaciente.tsx → sección "Tareas asignadas"
export async function getTareasPorPaciente(pacienteId: number) {
  const response = await api.get<ApiResponse<Tarea[]>>(
    `/tareas/paciente/${pacienteId}`
  )
  return response.data
}

// Trae los datos completos de UNA tarea específica.
// PHP busca en task por task_id.
//
// Se usa en: DetalleTarea.tsx → al cargar la pantalla con tareaId del URL
export async function getTarea(id: number) {
  const response = await api.get<ApiResponse<Tarea>>(`/tareas/${id}`)
  return response.data
}

// Crea una tarea nueva y la asigna a un paciente.
// PHP inserta en tabla task.
//
// Se usa en: ModalNuevaTarea.tsx → handleGuardar()
export async function crearTarea(datos: Omit<Tarea, "id" | "fechaCreacion" | "fechaEntrega">) {
  const response = await api.post<ApiResponse<Tarea>>("/tareas", datos)
  return response.data
}

// Actualiza campos de una tarea (estado, comentario del terapeuta, etc.).
// "Partial<Tarea>" = solo mandas los campos que cambian.
//
// Se usa en: DetalleTarea.tsx → handleMarcarRevisada() y handleGuardarComentario()
export async function actualizarTarea(id: number, datos: Partial<Tarea>) {
  const response = await api.put<ApiResponse<Tarea>>(`/tareas/${id}`, datos)
  return response.data
}


// ===========================
// EXPEDIENTE CLÍNICO
// ===========================

// Trae el expediente clínico de un paciente.
// PHP hace JOIN entre medical_record + medical_record_diagnosis + diagnosis
// para incluir también la lista de diagnósticos del paciente.
//
// Se usa en: Expedientes.tsx → al cargar la pantalla con pacienteId del URL
export async function getExpediente(pacienteId: number) {
  const response = await api.get<ApiResponse<ExpedienteClinico>>(
    `/expediente/paciente/${pacienteId}`
  )
  return response.data
}

// Guarda los cambios del expediente clínico.
// PHP actualiza medical_record y sincroniza medical_record_diagnosis.
//
// Se usa en: Expedientes.tsx → botón "Guardar cambios"
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

// Trae el perfil completo del psicólogo logueado.
// PHP usa el token para saber qué profesional es y hace JOIN con user + specialty.
//
// Se usa en: PerfilPsicologo.tsx → al cargar la pantalla
export async function getPerfilPsicologo() {
  const response = await api.get<ApiResponse<Profesional>>("/profesional/perfil")
  return response.data
}

// Actualiza los datos del perfil del psicólogo logueado.
// "Partial<Profesional>" = solo mandas los campos que cambiaron.
//
// Se usa en: PerfilPsicologo.tsx → handleGuardarEdicion()
export async function actualizarPerfilPsicologo(datos: Partial<Profesional>) {
  const response = await api.put<ApiResponse<Profesional>>(
    "/profesional/perfil",
    datos
  )
  return response.data
}

// Cambia la contraseña del usuario logueado.
// PHP verifica que contrasenaActual sea correcta antes de actualizar.
//
// Se usa en: PerfilPsicologo.tsx → modal de cambiar contraseña
export async function cambiarContrasena(
  contrasenaActual: string,
  contrasenaNueva: string
) {
  const response = await api.put<ApiResponse<{ mensaje: string }>>(
    "/auth/cambiar-contrasena",
    { contrasenaActual, contrasenaNueva }
  )
  return response.data
}


// ===========================
// ESPECIALIDADES
// ===========================

// Trae la lista de especialidades disponibles.
// Se usa para llenar el selector de especialidad en formularios.
//
// Se usa en: futuro formulario de registro de profesional
export async function getEspecialidades() {
  const response = await api.get<ApiResponse<Especialidad[]>>("/especialidades")
  return response.data
}


// ===========================
// SOLICITUDES DE REGISTRO
// ===========================

// Datos que manda el formulario de Registro.tsx (landing page)
export interface DatosSolicitudRegistro {
  nombreClinica: string
  nombreContacto: string
  email: string
  telefono: string
  plan: string
  mensaje: string
}

// Envía la solicitud de prueba gratis desde la landing page.
// PHP se encarga de:
//   1. Guardar la solicitud
//   2. Crear la cuenta admin de la clínica
//   3. Mandar correo con credenciales al contacto
//
// Se usa en: Registro.tsx → handleEnviar()
export async function solicitarAcceso(datos: DatosSolicitudRegistro) {
  const response = await api.post<ApiResponse<{ mensaje: string }>>(
    "/registro/solicitar",
    datos
  )
  return response.data
}