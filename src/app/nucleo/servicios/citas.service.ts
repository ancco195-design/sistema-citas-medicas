  import { Injectable, inject } from '@angular/core';
  import { Firestore, collection, doc, addDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, CollectionReference, DocumentData, orderBy, Timestamp } from '@angular/fire/firestore';
  import { Observable, from, map } from 'rxjs';
  import { Cita, CrearCita, ActualizarCita, FiltroCita, EstadoCita, DisponibilidadCita } from '../modelos/cita.model';

  /**
   * Servicio de Citas
   * Maneja las operaciones CRUD de citas médicas en Firestore
   */
  @Injectable({
    providedIn: 'root'
  })
  export class CitasService {
    private firestore = inject(Firestore);
    private citasCollection: CollectionReference<DocumentData>;

    constructor() {
      this.citasCollection = collection(this.firestore, 'citas');
    }

    /**
     * Crear una nueva cita
     * @param datos Datos de la cita
     * @param pacienteNombre Nombre del paciente
     * @param doctorNombre Nombre del doctor
     * @returns Promise con el resultado
     */
    async crearCita(datos: CrearCita, pacienteNombre: string, doctorNombre: string): Promise<any> {
      try {
        // Verificar disponibilidad antes de crear
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

    /**
     * Verificar disponibilidad de un doctor en una fecha/hora
     * @param doctorId UID del doctor
     * @param fecha Fecha de la cita
     * @param hora Hora de la cita
     * @returns Promise con la disponibilidad
     */
    async verificarDisponibilidad(
      doctorId: string, 
      fecha: Date, 
      hora: string
    ): Promise<DisponibilidadCita> {
      try {
        // Buscar citas del doctor en la misma fecha y hora
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

    /**
     * Obtener una cita por su ID
     * @param citaId ID de la cita
     * @returns Promise con la cita
     */
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

    /**
     * Obtener citas de un paciente
     * @param pacienteId UID del paciente
     * @returns Promise con las citas
     */
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

    /**
     * Obtener citas de un doctor
     * @param doctorId UID del doctor
     * @returns Promise con las citas
     */
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

    /**
     * Obtener citas por fecha
     * @param fecha Fecha a buscar
     * @returns Promise con las citas
     */
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

    /**
     * Obtener citas por estado
     * @param estado Estado de la cita
     * @returns Promise con las citas
     */
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

    /**
     * Buscar citas con filtros múltiples
     * @param filtro Filtros a aplicar
     * @returns Promise con las citas
     */
    async buscarCitas(filtro: FiltroCita): Promise<Cita[]> {
      try {
        let citas: Cita[] = [];

        // Si hay filtro de paciente
        if (filtro.pacienteId) {
          citas = await this.obtenerCitasPorPaciente(filtro.pacienteId);
        }
        // Si hay filtro de doctor
        else if (filtro.doctorId) {
          citas = await this.obtenerCitasPorDoctor(filtro.doctorId);
        }
        // Si hay filtro de fecha
        else if (filtro.fecha) {
          citas = await this.obtenerCitasPorFecha(filtro.fecha);
        }
        // Si hay filtro de estado
        else if (filtro.estado) {
          citas = await this.obtenerCitasPorEstado(filtro.estado);
        }
        // Si no hay filtros específicos, obtener todas
        else {
          citas = await this.obtenerTodasCitas();
        }

        // Aplicar filtros adicionales
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

    /**
     * Obtener todas las citas
     * @returns Promise con todas las citas
     */
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

    /**
     * Actualizar una cita
     * @param citaId ID de la cita
     * @param datos Datos a actualizar
     * @returns Promise con el resultado
     */
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

    /**
     * Cancelar una cita
     * @param citaId ID de la cita
     * @returns Promise con el resultado
     */
    async cancelarCita(citaId: string): Promise<any> {
      return await this.actualizarCita(citaId, { estado: 'cancelada' });
    }

    /**
     * Confirmar una cita
     * @param citaId ID de la cita
     * @returns Promise con el resultado
     */
    async confirmarCita(citaId: string): Promise<any> {
      return await this.actualizarCita(citaId, { estado: 'confirmada' });
    }

    /**
     * Completar una cita
     * @param citaId ID de la cita
     * @param notas Notas del doctor (opcional)
     * @returns Promise con el resultado
     */
    async completarCita(citaId: string, notas?: string): Promise<any> {
      return await this.actualizarCita(citaId, { 
        estado: 'completada',
        notas 
      });
    }

    /**
     * Eliminar una cita
     * @param citaId ID de la cita
     * @returns Promise con el resultado
     */
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

    /**
     * Método auxiliar para ejecutar consultas y convertir a array
     * @param q Query de Firestore
     * @returns Promise con array de citas
     */
    private async ejecutarConsultaCitas(q: any): Promise<Cita[]> {
      const querySnapshot = await getDocs(q);
      const citas: Cita[] = [];
      
     querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        citas.push({ 
           id: docSnapshot.id, 
           ...(data || {}) 
        } as Cita);
    });

      
      return citas;
    }

    /**
     * Obtener estadísticas de citas
     * @returns Promise con estadísticas
     */
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