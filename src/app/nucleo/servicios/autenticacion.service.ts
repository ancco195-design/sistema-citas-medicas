import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { RegistroUsuario, LoginUsuario } from '../modelos/usuario.model';

/**
 * Servicio de Autenticación
 * Maneja el registro, login y logout de usuarios con Firebase Authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private auth = inject(Auth);
  
  // Observable del estado de autenticación
  usuarioActual$: Observable<User | null> = authState(this.auth);

  constructor() { }

  /**
   * Registrar un nuevo usuario
   * @param datos Datos del usuario a registrar
   * @returns Promise con el resultado
   */
  async registrarUsuario(datos: RegistroUsuario): Promise<any> {
    try {
      const credencial = await createUserWithEmailAndPassword(
        this.auth, 
        datos.email, 
        datos.password
      );
      return {
        exito: true,
        uid: credencial.user.uid,
        usuario: credencial.user
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: this.obtenerMensajeError(error.code)
      };
    }
  }

  /**
   * Iniciar sesión
   * @param datos Credenciales del usuario
   * @returns Promise con el resultado
   */
  async iniciarSesion(datos: LoginUsuario): Promise<any> {
    try {
      const credencial = await signInWithEmailAndPassword(
        this.auth,
        datos.email,
        datos.password
      );
      return {
        exito: true,
        uid: credencial.user.uid,
        usuario: credencial.user
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: this.obtenerMensajeError(error.code)
      };
    }
  }

  /**
   * Cerrar sesión
   * @returns Promise con el resultado
   */
  async cerrarSesion(): Promise<any> {
    try {
      await signOut(this.auth);
      return {
        exito: true,
        mensaje: 'Sesión cerrada exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al cerrar sesión'
      };
    }
  }

  /**
   * Obtener el usuario actual
   * @returns Usuario actual o null
   */
  obtenerUsuarioActual(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Verificar si hay un usuario autenticado
   * @returns true si hay usuario autenticado
   */
  estaAutenticado(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Obtener el UID del usuario actual
   * @returns UID del usuario o null
   */
  obtenerUid(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  /**
   * Obtener mensaje de error en español
   * @param codigo Código de error de Firebase
   * @returns Mensaje de error traducido
   */
  private obtenerMensajeError(codigo: string): string {
    const mensajes: { [key: string]: string } = {
      'auth/email-already-in-use': 'El correo electrónico ya está registrado',
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };
    
    return mensajes[codigo] || 'Error desconocido. Intenta nuevamente';
  }
}