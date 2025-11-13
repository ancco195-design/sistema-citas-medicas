import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Usuario, RegistroUsuario, TipoRol } from '../modelos/usuario.model';

/**
 * Servicio de Usuarios
 * Maneja las operaciones CRUD de usuarios en Firestore
 */
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private firestore = inject(Firestore);
  private usuariosCollection: CollectionReference<DocumentData>;

  constructor() {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
  }

  /**
   * Crear un nuevo usuario en Firestore
   * @param uid UID del usuario de Firebase Auth
   * @param datos Datos del registro del usuario
   * @returns Promise con el resultado
   */
  async crearUsuario(uid: string, datos: RegistroUsuario): Promise<any> {
    try {
      const nuevoUsuario: Usuario = {
        uid,
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        rol: datos.rol,
        ...(datos.especialidad && { especialidad: datos.especialidad }),  // ← CAMBIO AQUÍ
        fechaRegistro: new Date(),
        activo: true
      };

      await setDoc(doc(this.usuariosCollection, uid), nuevoUsuario);
      
      return {
        exito: true,
        mensaje: 'Usuario creado exitosamente',
        usuario: nuevoUsuario
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al crear usuario: ' + error.message
      };
    }
  }

  /**
   * Obtener un usuario por su UID
   * @param uid UID del usuario
   * @returns Observable con el usuario
   */
  obtenerUsuarioPorId(uid: string): Observable<Usuario | null> {
    return from(getDoc(doc(this.usuariosCollection, uid))).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as Usuario;
        }
        return null;
      })
    );
  }

  /**
   * Obtener un usuario por su UID (Promise)
   * @param uid UID del usuario
   * @returns Promise con el usuario
   */
  async obtenerUsuario(uid: string): Promise<Usuario | null> {
    try {
      const docSnap = await getDoc(doc(this.usuariosCollection, uid));
      if (docSnap.exists()) {
        return docSnap.data() as Usuario;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  /**
   * Actualizar datos de un usuario
   * @param uid UID del usuario
   * @param datos Datos a actualizar
   * @returns Promise con el resultado
   */
  async actualizarUsuario(uid: string, datos: Partial<Usuario>): Promise<any> {
    try {
      await updateDoc(doc(this.usuariosCollection, uid), datos);
      return {
        exito: true,
        mensaje: 'Usuario actualizado exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al actualizar usuario: ' + error.message
      };
    }
  }

  /**
   * Eliminar un usuario (desactivar)
   * @param uid UID del usuario
   * @returns Promise con el resultado
   */
  async eliminarUsuario(uid: string): Promise<any> {
    try {
      await updateDoc(doc(this.usuariosCollection, uid), {
        activo: false
      });
      return {
        exito: true,
        mensaje: 'Usuario desactivado exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al eliminar usuario: ' + error.message
      };
    }
  }

  /**
   * Obtener todos los usuarios por rol
   * @param rol Rol a filtrar
   * @returns Promise con la lista de usuarios
   */
  async obtenerUsuariosPorRol(rol: TipoRol): Promise<Usuario[]> {
    try {
      const q = query(this.usuariosCollection, where('rol', '==', rol));
      const querySnapshot = await getDocs(q);
      
      const usuarios: Usuario[] = [];
      querySnapshot.forEach((doc) => {
        usuarios.push(doc.data() as Usuario);
      });
      
      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      return [];
    }
  }

  /**
   * Obtener todos los usuarios activos
   * @returns Promise con la lista de usuarios
   */
  async obtenerUsuariosActivos(): Promise<Usuario[]> {
    try {
      const q = query(this.usuariosCollection, where('activo', '==', true));
      const querySnapshot = await getDocs(q);
      
      const usuarios: Usuario[] = [];
      querySnapshot.forEach((doc) => {
        usuarios.push(doc.data() as Usuario);
      });
      
      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      return [];
    }
  }

  /**
   * Verificar el rol de un usuario
   * @param uid UID del usuario
   * @returns Promise con el rol del usuario
   */
  async obtenerRolUsuario(uid: string): Promise<TipoRol | null> {
    try {
      const usuario = await this.obtenerUsuario(uid);
      return usuario?.rol || null;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      return null;
    }
  }
}