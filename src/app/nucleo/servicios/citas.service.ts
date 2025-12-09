import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  CollectionReference, 
  DocumentData, 
  orderBy,
  collectionData  // ← NUEVO: Para tiempo real
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Cita, CrearCita, ActualizarCita, FiltroCita, EstadoCita, DisponibilidadCita } from '../modelos/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private firestore = inject(Firestore);
  private citasCollection: CollectionReference<DocumentData>;

  constructor() {
    this.citasCollection = collection(this.firestore, 'citas');
  }

  // NUEVO: MÉTODOS CON OBSERVABLES (TIEMPO REAL)
  /**
   * Obtener todas las citas en tiempo real
   * @returns Observable con las citas que se actualiza automáticamente
   */
  obtenerTodasCitasRealTime(): Observable<Cita[]> {
    return collectionData(this.citasCollection, { idField: 'id' }).pipe(
      map((citas: any[]) => 
        citas.map(cita => this.convertirTimestamps(cita))
      )
    );
  }

  /**
   * Obtener citas de un paciente en tiempo real
   * @param pacienteId UID del paciente
   * @returns Observable con las citas
   */
  obtenerCitasPorPacienteRealTime(pacienteId: string): Observable<Cita[]> {
    const q = query(
      this.citasCollection,
      where('pacienteId', '==', pacienteId),
      orderBy('fecha', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((citas: any[]) => 
        citas.map(cita => this.convertirTimestamps(cita))
      )
    );
  }

  /**
   * Obtener citas de un doctor en tiempo real
   * @param doctorId UID del doctor
   * @returns Observable con las citas
   */
  obtenerCitasPorDoctorRealTime(doctorId: string): Observable<Cita[]> {
    const q = query(
      this.citasCollection,
      where('doctorId', '==', doctorId),
      orderBy('fecha', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((citas: any[]) => 
        citas.map(cita => this.convertirTimestamps(cita))
      )
    );
  }

  /**
   * Método auxiliar para convertir Timestamps de Firestore a Date
   */
  private convertirTimestamps(cita: any): Cita {
    const citaConvertida: any = { ...cita };
    
    // Convertir fecha si es Timestamp
    if (cita.fecha && typeof cita.fecha === 'object' && 'seconds' in cita.fecha) {
      citaConvertida.fecha = new Date(cita.fecha.seconds * 1000);
    }
    
    // Convertir fechaCreacion si es Timestamp
    if (cita.fechaCreacion && typeof cita.fechaCreacion === 'object' && 'seconds' in cita.fechaCreacion) {
      citaConvertida.fechaCreacion = new Date(cita.fechaCreacion.seconds * 1000);
    }
    
    // Convertir fechaActualizacion si es Timestamp
    if (cita.fechaActualizacion && typeof cita.fechaActualizacion === 'object' && 'seconds' in cita.fechaActualizacion) {
      citaConvertida.fechaActualizacion = new Date(cita.fechaActualizacion.seconds * 1000);
    }
    
    return citaConvertida as Cita;
  }


  // MÉTODOS ORIGINALES (SE MANTIENEN)


  async crearCita(datos: CrearCita, pacienteNombre: string, doctorNombre: string): Promise<any> {
    try {
      const disponibilidad = await this.verificarDisponibilidad(
        datos.doctorId,
        datos.fecha,
        datos.hora
      );

      if (!disponibilidad.disponible) {
        return {
          exito: false,
          mensaje: disponibilidad.mensaje
        };
      }

      const nuevaCita: Omit<Cita, 'id'> = {
        ...datos,
        pacienteNombre,
        doctorNombre,
        estado: 'pendiente',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };

      const docRef = await addDoc(this.citasCollection, nuevaCita);
      
      return {
        exito: true,
        mensaje: 'Cita creada exitosamente',
        citaId: docRef.id,
        cita: { ...nuevaCita, id: docRef.id }
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al crear cita: ' + error.message
      };
    }
  }

  async verificarDisponibilidad(
    doctorId: string, 
    fecha: Date, 
    hora: string
  ): Promise<DisponibilidadCita> {
    try {
      const q = query(
        this.citasCollection,
        where('doctorId', '==', doctorId),
        where('fecha', '==', fecha),
        where('hora', '==', hora),
        where('estado', 'in', ['pendiente', 'confirmada'])
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return {
          doctorId,
          fecha,
          hora,
          disponible: false,
          mensaje: 'El doctor ya tiene una cita en este horario'
        };
      }

      return {
        doctorId,
        fecha,
        hora,
        disponible: true,
        mensaje: 'Horario disponible'
      };
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return {
        doctorId,
        fecha,
        hora,
        disponible: false,
        mensaje: 'Error al verificar disponibilidad'
      };
    }
  }

  async obtenerCita(citaId: string): Promise<Cita | null> {
    try {
      const docSnap = await getDoc(doc(this.citasCollection, citaId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as Cita;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      return null;
    }
  }

  async obtenerCitasPorPaciente(pacienteId: string): Promise<Cita[]> {
    try {
      const q = query(
        this.citasCollection,
        where('pacienteId', '==', pacienteId),
        orderBy('fecha', 'desc')
      );
      
      return await this.ejecutarConsultaCitas(q);
    } catch (error) {
      console.error('Error al obtener citas del paciente:', error);
      return [];
    }
  }

  async obtenerCitasPorDoctor(doctorId: string): Promise<Cita[]> {
    try {
      const q = query(
        this.citasCollection,
        where('doctorId', '==', doctorId),
        orderBy('fecha', 'desc')
      );
      
      return await this.ejecutarConsultaCitas(q);
    } catch (error) {
      console.error('Error al obtener citas del doctor:', error);
      return [];
    }
  }

  async obtenerCitasPorFecha(fecha: Date): Promise<Cita[]> {
    try {
      const q = query(
        this.citasCollection,
        where('fecha', '==', fecha),
        orderBy('hora', 'asc')
      );
      
      return await this.ejecutarConsultaCitas(q);
    } catch (error) {
      console.error('Error al obtener citas por fecha:', error);
      return [];
    }
  }

  async obtenerCitasPorEstado(estado: EstadoCita): Promise<Cita[]> {
    try {
      const q = query(
        this.citasCollection,
        where('estado', '==', estado),
        orderBy('fecha', 'desc')
      );
      
      return await this.ejecutarConsultaCitas(q);
    } catch (error) {
      console.error('Error al obtener citas por estado:', error);
      return [];
    }
  }

  async buscarCitas(filtro: FiltroCita): Promise<Cita[]> {
    try {
      let citas: Cita[] = [];

      if (filtro.pacienteId) {
        citas = await this.obtenerCitasPorPaciente(filtro.pacienteId);
      }
      else if (filtro.doctorId) {
        citas = await this.obtenerCitasPorDoctor(filtro.doctorId);
      }
      else if (filtro.fecha) {
        citas = await this.obtenerCitasPorFecha(filtro.fecha);
      }
      else if (filtro.estado) {
        citas = await this.obtenerCitasPorEstado(filtro.estado);
      }
      else {
        citas = await this.obtenerTodasCitas();
      }

      if (filtro.especialidad) {
        citas = citas.filter(c => c.especialidad === filtro.especialidad);
      }

      if (filtro.fechaInicio && filtro.fechaFin) {
        citas = citas.filter(c => {
          const fechaCita = new Date(c.fecha);
          return fechaCita >= filtro.fechaInicio! && fechaCita <= filtro.fechaFin!;
        });
      }

      return citas;
    } catch (error) {
      console.error('Error al buscar citas:', error);
      return [];
    }
  }

  async obtenerTodasCitas(): Promise<Cita[]> {
    try {
      const querySnapshot = await getDocs(this.citasCollection);
      
      const citas: Cita[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        citas.push({ id: docSnapshot.id, ...data } as Cita);
      });
      
      return citas.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    } catch (error) {
      console.error('Error al obtener todas las citas:', error);
      return [];
    }
  }

  async actualizarCita(citaId: string, datos: ActualizarCita): Promise<any> {
    try {
      await updateDoc(doc(this.citasCollection, citaId), {
        ...datos,
        fechaActualizacion: new Date()
      });
      
      return {
        exito: true,
        mensaje: 'Cita actualizada exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al actualizar cita: ' + error.message
      };
    }
  }

  async cancelarCita(citaId: string): Promise<any> {
    return await this.actualizarCita(citaId, { estado: 'cancelada' });
  }

  async confirmarCita(citaId: string): Promise<any> {
    return await this.actualizarCita(citaId, { estado: 'confirmada' });
  }

  async completarCita(citaId: string, notas?: string): Promise<any> {
    return await this.actualizarCita(citaId, { 
      estado: 'completada',
      notas 
    });
  }

  async eliminarCita(citaId: string): Promise<any> {
    try {
      await deleteDoc(doc(this.citasCollection, citaId));
      return {
        exito: true,
        mensaje: 'Cita eliminada exitosamente'
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: 'Error al eliminar cita: ' + error.message
      };
    }
  }

  private async ejecutarConsultaCitas(q: any): Promise<Cita[]> {
    const querySnapshot = await getDocs(q);
    const citas: Cita[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const data: any = docSnapshot.data();
      const cita: any = {
        id: docSnapshot.id,
        ...(data as object)
      };
      
      if (data['fecha'] && typeof data['fecha'] === 'object' && 'seconds' in data['fecha']) {
        cita.fecha = new Date(data['fecha'].seconds * 1000);
      }
      
      if (data['fechaCreacion'] && typeof data['fechaCreacion'] === 'object' && 'seconds' in data['fechaCreacion']) {
        cita.fechaCreacion = new Date(data['fechaCreacion'].seconds * 1000);
      }
      
      if (data['fechaActualizacion'] && typeof data['fechaActualizacion'] === 'object' && 'seconds' in data['fechaActualizacion']) {
        cita.fechaActualizacion = new Date(data['fechaActualizacion'].seconds * 1000);
      }
      
      citas.push(cita as Cita);
    });
    
    return citas;
  }

  async obtenerEstadisticas(): Promise<any> {
    try {
      const todasCitas = await this.obtenerTodasCitas();
      
      return {
        total: todasCitas.length,
        pendientes: todasCitas.filter(c => c.estado === 'pendiente').length,
        confirmadas: todasCitas.filter(c => c.estado === 'confirmada').length,
        completadas: todasCitas.filter(c => c.estado === 'completada').length,
        canceladas: todasCitas.filter(c => c.estado === 'cancelada').length
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}