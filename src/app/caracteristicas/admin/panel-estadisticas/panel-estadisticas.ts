import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { Cita } from '../../../nucleo/modelos/cita.model';
import { Doctor } from '../../../nucleo/modelos/doctor.model';
import { Subscription } from 'rxjs';

interface EstadisticaCita {
  estado: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface EstadisticaEspecialidad {
  especialidad: string;
  cantidad: number;
}

interface EstadisticaDoctor {
  nombre: string;
  especialidad: string;
  cantidad: number;
}

@Component({
  selector: 'app-panel-estadisticas',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './panel-estadisticas.html',
  styleUrl: './panel-estadisticas.css'
})
export class PanelEstadisticasComponent implements OnInit, OnDestroy {
  private citasService = inject(CitasService);
  private doctoresService = inject(DoctoresService);

  // ← NUEVO: Suscripciones para limpiar al destruir el componente
  private citasSubscription?: Subscription;
  private doctoresSubscription?: Subscription;

  cargando = true;
  
  // Estadísticas generales
  totalCitas = 0;
  totalDoctores = 0;
  estadisticasPorEstado: EstadisticaCita[] = [];
  estadisticasPorEspecialidad: EstadisticaEspecialidad[] = [];
  estadisticasPorDoctor: EstadisticaDoctor[] = [];

  // Variables para almacenar los datos en tiempo real
  private citasActuales: Cita[] = [];
  private doctoresActuales: Doctor[] = [];

  ngOnInit() {
    this.cargarEstadisticasRealTime();
  }

  ngOnDestroy() {
    // ← IMPORTANTE: Limpiar suscripciones para evitar memory leaks
    if (this.citasSubscription) {
      this.citasSubscription.unsubscribe();
    }
    if (this.doctoresSubscription) {
      this.doctoresSubscription.unsubscribe();
    }
  }

  // ← NUEVO: Cargar estadísticas con suscripciones en tiempo real
  cargarEstadisticasRealTime() {
    this.cargando = true;

    // Suscribirse a las citas en tiempo real
    this.citasSubscription = this.citasService.obtenerTodasCitasRealTime()
      .subscribe({
        next: (citas) => {
          this.citasActuales = citas;
          this.totalCitas = citas.length;
          
          // Recalcular estadísticas con los nuevos datos
          this.calcularEstadisticasPorEstado(citas);
          this.calcularEstadisticasPorEspecialidad(citas);
          this.calcularEstadisticasPorDoctor(citas);
          
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar citas:', error);
          this.cargando = false;
        }
      });

    // Suscribirse a los doctores en tiempo real
    this.doctoresSubscription = this.doctoresService.obtenerTodosDoctoresRealTime()
      .subscribe({
        next: (doctores) => {
          this.doctoresActuales = doctores;
          this.totalDoctores = doctores.length;
        },
        error: (error) => {
          console.error('❌ Error al cargar doctores:', error);
        }
      });
  }

  calcularEstadisticasPorEstado(citas: Cita[]) {
    const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    const colores: { [key: string]: string } = {
      'pendiente': '#f1c40f',
      'confirmada': '#2ecc71',
      'completada': '#3498db',
      'cancelada': '#e74c3c'
    };

    this.estadisticasPorEstado = estados.map(estado => {
      const cantidad = citas.filter(c => c.estado === estado).length;
      const porcentaje = this.totalCitas > 0 ? (cantidad / this.totalCitas) * 100 : 0;
      
      return {
        estado,
        cantidad,
        porcentaje: Math.round(porcentaje),
        color: colores[estado]
      };
    });
  }

  calcularEstadisticasPorEspecialidad(citas: Cita[]) {
    const especialidadesMap = new Map<string, number>();

    citas.forEach(cita => {
      const esp = cita.especialidad || 'Sin especialidad';
      especialidadesMap.set(esp, (especialidadesMap.get(esp) || 0) + 1);
    });

    this.estadisticasPorEspecialidad = Array.from(especialidadesMap.entries())
      .map(([especialidad, cantidad]) => ({ especialidad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  calcularEstadisticasPorDoctor(citas: Cita[]) {
    const doctoresMap = new Map<string, number>();

    citas.forEach(cita => {
      doctoresMap.set(cita.doctorId, (doctoresMap.get(cita.doctorId) || 0) + 1);
    });

    const estadisticas: EstadisticaDoctor[] = [];

    for (const [doctorId, cantidad] of doctoresMap.entries()) {
      const cita = citas.find(c => c.doctorId === doctorId);
      if (cita) {
        estadisticas.push({
          nombre: cita.doctorNombre || 'Doctor desconocido',
          especialidad: cita.especialidad || 'Sin especialidad',
          cantidad
        });
      }
    }

    this.estadisticasPorDoctor = estadisticas
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  obtenerNombreEstado(estado: string): string {
    const nombres: { [key: string]: string } = {
      'pendiente': 'Pendientes',
      'confirmada': 'Confirmadas',
      'completada': 'Completadas',
      'cancelada': 'Canceladas'
    };
    return nombres[estado] || estado;
  }
}