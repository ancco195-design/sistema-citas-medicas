/**
 * Modelo de Cita Médica
 * Representa una cita entre un paciente y un doctor
 */

export interface Cita {
  id?: string;                       // ID de la cita en Firestore (auto-generado)
  pacienteId: string;                // UID del paciente
  pacienteNombre: string;            // Nombre completo del paciente (desnormalizado)
  pacienteTelefono?: string;         // Teléfono del paciente
  doctorId: string;                  // UID del doctor
  doctorNombre: string;              // Nombre completo del doctor (desnormalizado)
  especialidad: string;              // Especialidad de la cita
  fecha: Date;                       // Fecha de la cita
  hora: string;                      // Hora de la cita (formato: "09:00")
  estado: EstadoCita;                // Estado actual de la cita
  motivo: string;                    // Motivo de la consulta
  notas?: string;                    // Notas adicionales del doctor (opcional)
  consultorio?: string;              // Consultorio donde se realizará
  fechaCreacion: Date;               // Cuándo se creó la cita
  fechaActualizacion?: Date;         // Última actualización
}

/**
 * Estados posibles de una cita
 */
export type EstadoCita = 
  | 'pendiente'      // Cita creada, esperando confirmación
  | 'confirmada'     // Cita confirmada por el doctor
  | 'cancelada'      // Cita cancelada por paciente o doctor
  | 'completada'     // Cita realizada exitosamente
  | 'no-asistio';    // Paciente no asistió

/**
 * Interfaz para crear una nueva cita
 */
export interface CrearCita {
  pacienteId: string;
  doctorId: string;
  especialidad: string;
  fecha: Date;
  hora: string;
  motivo: string;
}

/**
 * Interfaz para actualizar una cita
 */
export interface ActualizarCita {
  estado?: EstadoCita;
  notas?: string;
  fecha?: Date;
  hora?: string;
}

/**
 * Interfaz para filtrar citas
 */
export interface FiltroCita {
  pacienteId?: string;
  doctorId?: string;
  especialidad?: string;
  fecha?: Date;
  estado?: EstadoCita;
  fechaInicio?: Date;
  fechaFin?: Date;
}

/**
 * Interfaz para validar disponibilidad
 */
export interface DisponibilidadCita {
  doctorId: string;
  fecha: Date;
  hora: string;
  disponible: boolean;
  mensaje?: string;
}