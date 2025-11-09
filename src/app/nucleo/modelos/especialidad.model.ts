/**
 * Modelo de Especialidad Médica
 * Catálogo de especialidades médicas disponibles
 */

export interface Especialidad {
  id?: string;                       // ID de la especialidad
  nombre: string;                    // Nombre de la especialidad
  descripcion: string;               // Descripción breve
  icono: string;                     // Nombre del ícono o emoji
  activa: boolean;                   // Si está activa en el sistema
  numerodoctores?: number;          // Cantidad de doctores con esta especialidad
}

/**
 * Especialidades predefinidas más comunes
 */
export const ESPECIALIDADES_COMUNES: Especialidad[] = [
  {
    nombre: 'Medicina General',
    descripcion: 'Atención médica integral y diagnóstico general',
    icono: '🩺',
    activa: true
  },
  {
    nombre: 'Cardiología',
    descripcion: 'Especialista en el corazón y sistema cardiovascular',
    icono: '❤️',
    activa: true
  },
  {
    nombre: 'Pediatría',
    descripcion: 'Atención médica para bebés, niños y adolescentes',
    icono: '👶',
    activa: true
  },
  {
    nombre: 'Dermatología',
    descripcion: 'Especialista en piel, cabello y uñas',
    icono: '🧴',
    activa: true
  },
  {
    nombre: 'Traumatología',
    descripcion: 'Especialista en huesos, articulaciones y músculos',
    icono: '🦴',
    activa: true
  },
  {
    nombre: 'Oftalmología',
    descripcion: 'Especialista en ojos y visión',
    icono: '👁️',
    activa: true
  },
  {
    nombre: 'Ginecología',
    descripcion: 'Salud reproductiva y atención femenina',
    icono: '🌸',
    activa: true
  },
  {
    nombre: 'Neurología',
    descripcion: 'Especialista en sistema nervioso y cerebro',
    icono: '🧠',
    activa: true
  },
  {
    nombre: 'Psiquiatría',
    descripcion: 'Salud mental y trastornos psicológicos',
    icono: '🧘',
    activa: true
  },
  {
    nombre: 'Odontología',
    descripcion: 'Salud dental y bucal',
    icono: '🦷',
    activa: true
  }
];