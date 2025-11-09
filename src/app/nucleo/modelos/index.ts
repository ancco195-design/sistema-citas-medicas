/**
 * Archivo de barril (barrel) para exportar todos los modelos
 * Permite importar múltiples modelos desde un solo lugar
 * 
 * Ejemplo de uso:
 * import { Usuario, Cita, Doctor } from '@nucleo/modelos';
 */

// Exportar modelos de Usuario
export * from './usuario.model';

// Exportar modelos de Doctor
export * from './doctor.model';

// Exportar modelos de Cita
export * from './cita.model';

// Exportar modelos de Especialidad
export * from './especialidad.model';