// ===========================
// src/types/index.ts
// ===========================
// "Diccionario" del proyecto. Cada interface aquí refleja
// EXACTAMENTE la estructura de las tablas en la base de datos.
// Si la BD cambia, este archivo debe cambiar también.
// ===========================


// ===========================
// ROLES
// ===========================
// Coinciden exactamente con role_name de la tabla `role`
export type Rol = "psicologo" | "secretaria" | "paciente"


// ===========================
// USUARIO LOGUEADO
// ===========================
// Lo que PHP devuelve al hacer login.
// Combina datos de: user + user_access + role
export interface Usuario {
  userId: number
  nombre: string        // user.first_name
  apellido: string      // user.last_name
  apellidoMaterno?: string  // user.middle_name (opcional en BD)
  email: string
  rol: Rol
  token: string         // token que PHP genera al autenticar
}


// ===========================
// PACIENTE
// ===========================
// Combina datos de las tablas: user + patient
export interface Paciente {
  id: number            // patient.patient_id
  userId: number        // patient.user_id
  nombre: string        // user.first_name
  apellido: string      // user.last_name
  apellidoMaterno?: string  // user.middle_name
  email: string         // user.email
  telefono: string      // user.phone
  fechaNacimiento: string   // user.birth_date
  fechaRegistro: string     // patient.registration_date
  totalCitas?: number   // calculado en frontend
}


// ===========================
// CONTACTO DE EMERGENCIA
// ===========================
// Tabla: emergency_contact
export interface ContactoEmergencia {
  id: number            // emergency_contact_id
  pacienteId: number    // patient_id
  nombreCompleto: string    // full_name
  telefono: string      // phone
  parentesco?: string   // relationship (opcional en BD)
}


// ===========================
// CITA
// ===========================
// Tabla: appointment
// Estados exactos del ENUM en la BD: pendiente, confirmada, cancelada
export type EstadoCita = "pendiente" | "confirmada" | "cancelada"

export interface Cita {
  id: number            // appointment_id
  pacienteId: number    // patient_id
  profesionalId: number // professional_id
  fecha: string         // appointment_date — "2026-03-13"
  hora: string          // appointment_time — "10:00"
  estado: EstadoCita    // status
  feedback?: string     // feedback (opcional en BD)
}


// ===========================
// EXPEDIENTE CLÍNICO
// ===========================
// Tabla: medical_record
export interface ExpedienteClinico {
  id: number                     // medical_record_id
  pacienteId: number             // patient_id
  profesionalId: number          // professional_id
  fechaCreacion: string          // creation_date
  motivoConsulta?: string        // consultation_reason
  condicionActual?: string       // current_condition
  infanciaAdolescencia?: string  // childhood_adolescence
  eventosSignificativos?: string // significant_events
  historialAbuso?: string        // abuse_history
  metasTerapeuticas?: string     // therapeutic_goals
}


// ===========================
// DIAGNÓSTICO
// ===========================
// Tabla: diagnosis
export interface Diagnostico {
  id: number    // diagnosis_id
  nombre: string // diagnosis_name
}


// ===========================
// TAREA
// ===========================
// Tabla: task
// Estados exactos del ENUM en BD: pendiente, entregada, revisada
// - pendiente  → el paciente aún no la entrega
// - entregada  → el paciente ya la completó y entregó
// - revisada   → el psicólogo ya la revisó
export type EstadoTarea = "pendiente" | "entregada" | "revisada"

export interface Tarea {
  id: number                    // task_id
  pacienteId: number            // patient_id
  profesionalId: number         // professional_id
  titulo: string                // title
  contenido?: string            // content
  fechaLimite?: string          // due_date
  estado: EstadoTarea           // status
  imagePath?: string            // image_path (archivo adjunto)
  comentarioTerapeuta?: string  // therapist_comment
  fechaCreacion: string         // created_at
  fechaEntrega?: string         // delivered_at
}


// ===========================
// NOTA DE SESIÓN
// ===========================
// Esta tabla aún no existe en la BD (marzo 2026).
// Se trabaja con datos mock por ahora.
// Cuando PHP la cree, solo hay que conectar api.ts.
export interface NotaSesion {
  id: number
  citaId: number        // appointment_id al que pertenece
  profesionalId: number
  contenido: string
  fechaCita: string
  horaCita: string
}


// ===========================
// ESPECIALIDAD
// ===========================
// Tabla: specialty
export interface Especialidad {
  id: number    // specialty_id
  nombre: string // specialty_name
}


// ===========================
// RESPUESTA ESTÁNDAR DE PHP
// ===========================
// PHP siempre responde con esta estructura.
// <T> es un comodín: puede ser Paciente, Cita, Tarea, etc.
// Ejemplos: ApiResponse<Paciente>, ApiResponse<Cita[]>
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}