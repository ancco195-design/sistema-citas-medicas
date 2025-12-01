import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { Cita, EstadoCita } from '../../../nucleo/modelos/cita.model';

/**
 * Componente Mis Citas
 * Muestra todas las citas del paciente con filtros
 */
@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.css'
})
export class MisCitasComponent implements OnInit {
  private autenticacionService = inject(AutenticacionService);
  private citasService = inject(CitasService);
  private router = inject(Router);

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  filtroEstado: EstadoCita | 'todas' = 'todas';
  cargando = false;

  // Estados disponibles
  estadosDisponibles: { valor: EstadoCita | 'todas'; texto: string; icono: string }[] = [
    { valor: 'todas', texto: 'Todas', icono: '📋' },
    { valor: 'pendiente', texto: 'Pendientes', icono: '🕐' },
    { valor: 'confirmada', texto: 'Confirmadas', icono: '✅' },
    { valor: 'completada', texto: 'Completadas', icono: '✔️' },
    { valor: 'cancelada', texto: 'Canceladas', icono: '❌' }
  ];

  ngOnInit() {
    this.cargarCitas();

    // Escuchar cuando el usuario regresa al componente
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.cargarCitas();
    });
  }

  /**
   * Cargar citas del paciente
   */
  async cargarCitas() {
    this.cargando = true;

    try {
      const uid = this.autenticacionService.obtenerUid();
      
      if (!uid) {
        this.router.navigate(['/autenticacion/inicio-sesion']);
        return;
      }

      this.citas = await this.citasService.obtenerCitasPorPaciente(uid);
      this.citasFiltradas = [...this.citas];
      
      // Ordenar por fecha (más recientes primero)
      this.ordenarPorFecha();

    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Filtrar citas por estado
   */
  filtrarPorEstado(estado: EstadoCita | 'todas') {
    this.filtroEstado = estado;
    
    if (estado === 'todas') {
      this.citasFiltradas = [...this.citas];
    } else {
      this.citasFiltradas = this.citas.filter(cita => cita.estado === estado);
    }
    
    this.ordenarPorFecha();
  }

  /**
   * Ordenar citas por fecha
   */
  ordenarPorFecha() {
    this.citasFiltradas.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA; // Más recientes primero
    });
  }

  /**
   * Cancelar una cita
   */
  async cancelarCita(cita: Cita) {
    if (!cita.id) return;

    const confirmar = confirm(`¿Estás seguro de cancelar la cita con ${cita.doctorNombre}?`);
    
    if (!confirmar) return;

    try {
      const resultado = await this.citasService.cancelarCita(cita.id);
      
      if (resultado.exito) {
        alert('Cita cancelada exitosamente');
        await this.cargarCitas();
      } else {
        alert('Error al cancelar la cita: ' + resultado.mensaje);
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert('Error al cancelar la cita');
    }
  }

  /**
   * Verificar si una cita se puede cancelar
   */
  puedeCancelar(cita: Cita): boolean {
    if (cita.estado !== 'pendiente' && cita.estado !== 'confirmada') {
      return false;
    }

    const fechaCita = new Date(cita.fecha);
    const hoy = new Date();
    
    return fechaCita > hoy;
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: Date): string {
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  /**
   * Obtener badge de estado
   */
  obtenerBadgeEstado(estado: string): string {
    const badges: { [key: string]: string } = {
      'pendiente': '🕐 Pendiente',
      'confirmada': '✅ Confirmada',
      'cancelada': '❌ Cancelada',
      'completada': '✔️ Completada',
      'no-asistio': '❌ No asistió'
    };
    return badges[estado] || estado;
  }

  /**
   * Obtener clase CSS según estado
   */
  obtenerClaseEstado(estado: string): string {
    return `estado-${estado}`;
  }

  /**
   * Contar citas por estado
   */
  contarPorEstado(estado: EstadoCita | 'todas'): number {
    if (estado === 'todas') {
      return this.citas.length;
    }
    return this.citas.filter(c => c.estado === estado).length;
  }

  /**
   * Navegar a agendar nueva cita
   */
  agendarNuevaCita() {
    this.router.navigate(['/paciente/doctores']);
  }
}
