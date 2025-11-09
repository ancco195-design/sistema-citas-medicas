/**
 * Modelo de Usuario
 * Representa a todos los usuarios del sistema: pacientes, doctores y administradores
 */

export interface Usuario {
  uid: string;                    // ID único de Firebase Auth
  email: string;                  // Correo electrónico
  nombre: string;                 // Nombre del usuario
  apellido: string;               // Apellido del usuario
  telefono: string;               // Teléfono de contacto
  rol: TipoRol;                   // Rol del usuario en el sistema
  especialidad?: string;          // Solo para doctores
  foto?: string;                  // URL de la foto de perfil (opcional)
  fechaRegistro: Date;            // Fecha de registro en el sistema
  activo: boolean;                // Estado del usuario (activo/inactivo)
}

/**
 * Tipos de roles en el sistema
 */
export type TipoRol = 'paciente' | 'doctor' | 'admin';

/**
 * Interfaz para el registro de nuevos usuarios
 */
export interface RegistroUsuario {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: TipoRol;
  especialidad?: string;  // Requerido si rol es 'doctor'
}

/**
 * Interfaz para el login
 */
export interface LoginUsuario {
  email: string;
  password: string;
}