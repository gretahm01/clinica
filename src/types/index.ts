// ===========================
// src/types/index.ts
// ===========================
// Este archivo es el "diccionario" de todo el proyecto.
// Aquí defines la FORMA de todos los datos que maneja la app.
//
// ¿Por qué es importante?
// TypeScript usa estas interfaces para avisarte si en algún
// componente estás usando un campo que no existe, o si le
// estás pasando el tipo de dato equivocado a una función.
//
// REGLA: Si la base de datos cambia, este archivo cambia también.
// Así todo el proyecto se mantiene sincronizado con la BD.
//
// ESTRUCTURA DE LA BD (tablas que usamos):
//   user              → datos personales de cualquier usuario
//   user_access       → credenciales de login (username, password, rol)
//   role              → catálogo de roles: psicologo, secretaria, paciente
//   patient           → pacientes registrados (referencia a user)
//   professional      → psicólogos/profesionales (referencia a user)
//   specialty         → especialidades médicas
//   appointment       → citas entre paciente y profesional
//   task              → tareas que el psicólogo asigna al paciente
//   medical_record    → expediente clínico del paciente
//   medical_record_diagnosis → diagnósticos del expediente
//   diagnosis         → catálogo de diagnósticos disponibles
//   emergency_contact → contacto de emergencia del paciente
// ===========================


// ===========================
// ROLES
// ===========================
// Tipo que representa los 3 roles posibles en el sistema.
// Deben coincidir EXACTAMENTE con role_name en la tabla `role` de la BD:
//   role_id=1 → "psicologo"
//   role_id=2 → "secretaria"
//   role_id=3 → "paciente"
// Se usa para proteger rutas en App.tsx y redirigir al dashboard correcto.
export type Rol = "psicologo" | "secretaria" | "paciente"


// ===========================
// USUARIO LOGUEADO
// ===========================
// Lo que PHP devuelve cuando el login es exitoso.
// No representa una sola tabla — combina datos de:
//   user (nombre, apellido, email)
//   user_access (rol)
//   PHP genera el token al autenticar
//
// Se guarda en localStorage para mantener la sesión activa.
// AuthContext.tsx lo lee al iniciar la app para saber si ya hay sesión.
export interface Usuario {
  userId: number            // user.user_id
  nombre: string            // user.first_name
  apellido: string          // user.last_name
  apellidoMaterno?: string  // user.middle_name — opcional (puede ser null en BD)
  email: string             // user.email
  rol: Rol                  // role.role_name → "psicologo" | "secretaria" | "paciente"
  token: string             // JWT que genera PHP al hacer login — se manda en cada petición
}


// ===========================
// PACIENTE
// ===========================
// Combina datos de DOS tablas: user + patient
//   user    → datos personales (nombre, email, teléfono...)
//   patient → datos de registro (fecha de registro, qué profesional lo atiende)
//
// Se usa en: Paciente.tsx (lista), PerfilPaciente.tsx (detalle)
export interface Paciente {
  id: number                // patient.patient_id — el ID del paciente en la BD
  userId: number            // patient.user_id — referencia a la tabla user
  profesionalId?: number    // patient.professional_id — psicólogo asignado (nuevo campo en BD)
  nombre: string            // user.first_name
  apellido: string          // user.last_name
  apellidoMaterno?: string  // user.middle_name — opcional
  email: string             // user.email
  telefono: string          // user.phone
  fechaNacimiento: string   // user.birth_date → formato "2000-11-05"
  fechaRegistro: string     // patient.registration_date → formato "2026-03-10"
  totalCitas?: number       // PHP lo calcula contando sus appointments — opcional
}


// ===========================
// CONTACTO DE EMERGENCIA
// ===========================
// Tabla: emergency_contact
// Un paciente puede tener uno o más contactos de emergencia.
// Se muestra en el perfil del paciente (PerfilPaciente.tsx).
export interface ContactoEmergencia {
  id: number              // emergency_contact.emergency_contact_id
  pacienteId: number      // emergency_contact.patient_id
  nombreCompleto: string  // emergency_contact.full_name
  telefono: string        // emergency_contact.phone
  parentesco?: string     // emergency_contact.relationship — opcional en BD
}


// ===========================
// CITA
// ===========================
// Tabla: appointment
//
// Estados posibles (ENUM en la BD):
//   "pendiente"   → recién creada, sin confirmar
//   "confirmada"  → confirmada por el psicólogo
//   "cancelada"   → cancelada por cualquiera
//   "completada"  → la cita ya ocurrió y terminó (campo nuevo en BD actualizada)
//
// Se usa en: Dashboard.tsx (calendario), PerfilPaciente.tsx (historial de citas)
export type EstadoCita = "pendiente" | "confirmada" | "cancelada" | "completada" | "reagendada"

export interface Cita {
  id: number            // appointment.appointment_id
  pacienteId: number    // appointment.patient_id
  profesionalId: number // appointment.professional_id
  fecha: string         // appointment.appointment_date → "2026-03-13"
  hora: string          // appointment.appointment_time → "10:00"
  estado: EstadoCita    // appointment.status
  feedback?: string     // appointment.feedback — comentario del psicólogo (opcional)
  motivo?: string //
}


// ===========================
// EXPEDIENTE CLÍNICO
// ===========================
// Tabla principal: medical_record
// Los diagnósticos vienen de una tabla separada: medical_record_diagnosis + diagnosis
//
// Cada paciente tiene UN expediente (relación 1 a 1 en BD).
// Se usa en: Expedientes.tsx
export interface ExpedienteClinico {
  id: number                      // medical_record.medical_record_id
  pacienteId: number              // medical_record.patient_id
  profesionalId: number           // medical_record.professional_id
  fechaCreacion: string           // medical_record.creation_date → "2026-03-10"
  motivoConsulta?: string         // medical_record.consultation_reason
  condicionActual?: string        // medical_record.current_condition
  infanciaAdolescencia?: string   // medical_record.childhood_adolescence
  eventosSignificativos?: string  // medical_record.significant_events
  historialAbuso?: string         // medical_record.abuse_history
  metasTerapeuticas?: string      // medical_record.therapeutic_goals
  diagnosticos?: Diagnostico[]    // JOIN con medical_record_diagnosis + diagnosis
}


// ===========================
// DIAGNÓSTICO
// ===========================
// Tabla: diagnosis
// Catálogo fijo de 12 diagnósticos disponibles en la BD.
// Se usa en Expedientes.tsx para mostrar los checkboxes de diagnósticos.
export interface Diagnostico {
  id: number      // diagnosis.diagnosis_id
  nombre: string  // diagnosis.diagnosis_name
}


// ===========================
// TAREA
// ===========================
// Tabla: task
// El psicólogo crea tareas y las asigna a un paciente.
// El paciente las puede entregar desde su interfaz (con o sin archivo adjunto).
//
// Estados posibles (ENUM en la BD):
//   "pendiente"  → recién asignada, el paciente aún no la entrega
//   "entregada"  → el paciente ya la entregó, el psicólogo aún no la revisa
//   "revisada"   → el psicólogo ya la revisó y dejó comentario
//
// Se usa en: PerfilPaciente.tsx (lista), DetalleTarea.tsx (detalle completo)
export type EstadoTarea = "pendiente" | "entregada" | "revisada"

export interface Tarea {
  id: number                    // task.task_id
  pacienteId: number            // task.patient_id
  profesionalId: number         // task.professional_id
  titulo: string                // task.title
  contenido?: string            // task.content — instrucciones de la tarea
  fechaLimite?: string          // task.due_date → "2026-03-17"
  estado: EstadoTarea           // task.status
  imagePath?: string            // task.image_path — archivo que sube el paciente al entregar
  comentarioTerapeuta?: string  // task.therapist_comment — retroalimentación del psicólogo
  fechaCreacion: string         // task.created_at → "2026-03-10T19:41:41"
  fechaEntrega?: string         // task.delivered_at — cuando el paciente entregó
}


// ===========================
// NOTA DE SESIÓN
// ===========================
// ⚠️ IMPORTANTE: Esta tabla AÚN NO EXISTE en la BD (marzo 2026).
// Greta/Coque la crearán más adelante.
// Por ahora todos los componentes que la usan trabajan con datos mock.
// Cuando PHP la cree, solo hay que conectar getNotasSesion() en api.ts.
//
// Se usa en: Expedientes.tsx (historial de sesiones)
export interface NotaSesion {
  id: number
  citaId: number        // appointment_id al que pertenece esta nota
  profesionalId: number // professional_id de quien escribió la nota
  contenido: string     // texto de la nota de sesión
  fechaCita: string     // "2026-03-13"
  horaCita: string      // "10:00"
}


// ===========================
// ESPECIALIDAD
// ===========================
// Tabla: specialty
// Catálogo de especialidades médicas disponibles.
// Se usa en el perfil del psicólogo para mostrar su especialidad.
export interface Especialidad {
  id: number      // specialty.specialty_id
  nombre: string  // specialty.specialty_name
}


// ===========================
// PROFESIONAL (PSICÓLOGO)
// ===========================
// Combina datos de TRES tablas: user + professional + specialty
//   user        → datos personales
//   professional → número de licencia, especialidad
//   specialty   → nombre de la especialidad (JOIN)
//
// Se usa en: PerfilPsicologo.tsx
export interface Profesional {
  id: number               // professional.professional_id
  userId: number           // professional.user_id
  nombre: string           // user.first_name
  apellido: string         // user.last_name
  apellidoMaterno?: string // user.middle_name — opcional
  email: string            // user.email
  telefono?: string        // user.phone — opcional
  fechaNacimiento?: string // user.birth_date → "1985-03-15"
  numeroLicencia: string   // professional.license_number → "PSI-2024-001"
  especialidadId: number   // professional.specialty_id
  especialidad?: string    // specialty.specialty_name → viene del JOIN (opcional)
  rol: string              // role.role_name → "psicologo"
}


// ===========================
// RESPUESTA ESTÁNDAR DE PHP
// ===========================
// TODOS los endpoints de PHP responden con esta misma estructura.
// El <T> es un "genérico" — un comodín que se reemplaza según lo que esperas recibir.
//
// Ejemplos de uso:
//   ApiResponse<Paciente>              → para un solo paciente
//   ApiResponse<Paciente[]>            → para una lista de pacientes
//   ApiResponse<Cita>                  → para una sola cita
//   ApiResponse<{ mensaje: string }>   → para respuestas simples de éxito/error
//
// PHP siempre manda:
//   success: true/false   → si la operación funcionó
//   data: los datos       → lo que pediste
//   message: texto        → mensaje de éxito o error (opcional)
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}