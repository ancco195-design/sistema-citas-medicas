/**
 * Modelo de Doctor
 * Información extendida sobre los doctores del sistema
 */

export interface Doctor {
  uid: string;                       // ID del doctor (mismo que en usuarios)
  especialidad: string;              // Especialidad médica
  consultorio: string;               // Número o nombre del consultorio
  biografia: string;                 // Descripción profesional del doctor
  añosExperiencia: number;           // Años de experiencia
  horarioDisponible: HorarioDisponible[];  // Horarios de atención
  foto?: string;                     // URL de la foto del doctor
  calificacion?: number;             // Calificación promedio (1-5)
  numeroCitas?: number;              // Total de citas atendidas
}

/**
 * Horario disponible del doctor
 */
export interface HorarioDisponible {
  dia: DiaSemana;                    // Día de la semana
  horaInicio: string;                // Hora de inicio (formato: "09:00")
  horaFin: string;                   // Hora de fin (formato: "17:00")
  activo: boolean;                   // Si el horario está activo
}

/**
 * Días de la semana
 */
export type DiaSemana = 
  | 'lunes' 
  | 'martes' 
  | 'miercoles' 
  | 'jueves' 
  | 'viernes' 
  | 'sabado' 
  | 'domingo';

/**
 * Interfaz para crear/actualizar doctor
 */
export interface CrearDoctor {
  uid: string;
  especialidad: string;
  consultorio: string;
  biografia: string;
  añosExperiencia: number;
  horarioDisponible: HorarioDisponible[];
}

/**
 * Interfaz para búsqueda de doctores
 */
export interface FiltroDoctor {
  especialidad?: string;
  nombre?: string;
  disponible?: boolean;
}