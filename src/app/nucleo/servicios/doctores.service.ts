import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, CollectionReference, DocumentData, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Doctor, CrearDoctor, FiltroDoctor } from '../modelos/doctor.model';

/**
 * Servicio de Doctores
 * Maneja las operaciones CRUD de doctores en Firestore
 */
@Injectable({
  providedIn: 'root'
})
export class DoctoresService {
  private firestore = inject(Firestore);
  private doctoresCollection: CollectionReference<DocumentData>;

  constructor() {
    this.doctoresCollection = collection(this.firestore, 'doctores');
  }

  /**
   * Crear un nuevo doctor en Firestore
   * @param datos Datos del doctor
   * @returns Promise con el resultado
   */
  async crearDoctor(datos: CrearDoctor): Promise<any> {
    try {
      const nuevoDoctor: Doctor = {
        ...datos,
        calificacion: 0,
        numeroCitas: 0
      };

      await setDoc(doc(this.doctoresCollection, datos.uid), nuevoDoctor);
      
      return {
        exito: true,
        mensaje: 'Doctor creado exitosamente',
        doctor: nuevoDoctor
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al crear doctor: ' + error.message
      };
    }
  }

  /**
   * Obtener un doctor por su UID
   * @param uid UID del doctor
   * @returns Observable con el doctor
   */
  obtenerDoctorPorId(uid: string): Observable<Doctor | null> {
    return from(getDoc(doc(this.doctoresCollection, uid))).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as Doctor;
        }
        return null;
      })
    );
  }

  /**
   * Obtener un doctor por su UID (Promise)
   * @param uid UID del doctor
   * @returns Promise con el doctor
   */
  async obtenerDoctor(uid: string): Promise<Doctor | null> {
    try {
      const docSnap = await getDoc(doc(this.doctoresCollection, uid));
      if (docSnap.exists()) {
        return docSnap.data() as Doctor;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener doctor:', error);
      return null;
    }
  }

  /**
   * Obtener todos los doctores
   * @returns Promise con la lista de doctores
   */
  async obtenerTodosDoctores(): Promise<Doctor[]> {
    try {
      const querySnapshot = await getDocs(this.doctoresCollection);
      
      const doctores: Doctor[] = [];
      querySnapshot.forEach((doc) => {
        doctores.push(doc.data() as Doctor);
      });
      
      return doctores;
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      return [];
    }
  }

  /**
   * Obtener doctores por especialidad
   * @param especialidad Especialidad a filtrar
   * @returns Promise con la lista de doctores
   */
  async obtenerDoctoresPorEspecialidad(especialidad: string): Promise<Doctor[]> {
    try {
      const q = query(
        this.doctoresCollection, 
        where('especialidad', '==', especialidad)
      );
      const querySnapshot = await getDocs(q);
      
      const doctores: Doctor[] = [];
      querySnapshot.forEach((doc) => {
        doctores.push(doc.data() as Doctor);
      });
      
      return doctores;
    } catch (error) {
      console.error('Error al obtener doctores por especialidad:', error);
      return [];
    }
  }

  /**
   * Buscar doctores con filtros
   * @param filtro Filtros a aplicar
   * @returns Promise con la lista de doctores
   */
  async buscarDoctores(filtro: FiltroDoctor): Promise<Doctor[]> {
    try {
      let doctores = await this.obtenerTodosDoctores();

      // Filtrar por especialidad
      if (filtro.especialidad) {
        doctores = doctores.filter(d => 
          d.especialidad.toLowerCase().includes(filtro.especialidad!.toLowerCase())
        );
      }

      // Filtrar por nombre (buscar en UID, necesitarías también el nombre)
      if (filtro.nombre) {
        doctores = doctores.filter(d => 
          d.uid.toLowerCase().includes(filtro.nombre!.toLowerCase())
        );
      }

      return doctores;
    } catch (error) {
      console.error('Error al buscar doctores:', error);
      return [];
    }
  }

  /**
   * Actualizar datos de un doctor
   * @param uid UID del doctor
   * @param datos Datos a actualizar
   * @returns Promise con el resultado
   */
  async actualizarDoctor(uid: string, datos: Partial<Doctor>): Promise<any> {
    try {
      await updateDoc(doc(this.doctoresCollection, uid), datos);
      return {
        exito: true,
        mensaje: 'Doctor actualizado exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al actualizar doctor: ' + error.message
      };
    }
  }

  /**
   * Eliminar un doctor
   * @param uid UID del doctor
   * @returns Promise con el resultado
   */
  async eliminarDoctor(uid: string): Promise<any> {
    try {
      await deleteDoc(doc(this.doctoresCollection, uid));
      return {
        exito: true,
        mensaje: 'Doctor eliminado exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al eliminar doctor: ' + error.message
      };
    }
  }

  /**
   * Incrementar el contador de citas de un doctor
   * @param uid UID del doctor
   * @returns Promise con el resultado
   */
  async incrementarNumeroCitas(uid: string): Promise<any> {
    try {
      const doctor = await this.obtenerDoctor(uid);
      if (doctor) {
        const nuevoNumero = (doctor.numeroCitas || 0) + 1;
        await this.actualizarDoctor(uid, { numeroCitas: nuevoNumero });
        return { exito: true };
      }
      return { exito: false, mensaje: 'Doctor no encontrado' };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al incrementar citas: ' + error.message
      };
    }
  }

  /**
   * Actualizar calificación de un doctor
   * @param uid UID del doctor
   * @param calificacion Nueva calificación (1-5)
   * @returns Promise con el resultado
   */
  async actualizarCalificacion(uid: string, calificacion: number): Promise<any> {
    try {
      if (calificacion < 1 || calificacion > 5) {
        return {
          exito: false,
          mensaje: 'La calificación debe estar entre 1 y 5'
        };
      }

      await this.actualizarDoctor(uid, { calificacion });
      return {
        exito: true,
        mensaje: 'Calificación actualizada exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al actualizar calificación: ' + error.message
      };
    }
  }
}