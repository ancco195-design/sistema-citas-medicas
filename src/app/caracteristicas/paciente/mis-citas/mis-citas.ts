import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { Cita, EstadoCita } from '../../../nucleo/modelos/cita.model';
import { Subscription } from 'rxjs';
import { TiempoRelativoPipe } from '../../../nucleo/pipes/tiempo-relativo-pipe';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, TiempoRelativoPipe], // ← AGREGADO
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitasComponent implements OnInit, OnDestroy {
  private autenticacionService = inject(AutenticacionService);
  private citasService = inject(CitasService);
  private router = inject(Router);

  private citasSubscription?: Subscription;

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  filtroEstado: EstadoCita | 'todas' = 'todas';
  ordenamiento: 'fecha-desc' | 'fecha-asc' | 'doctor' | 'especialidad' = 'fecha-desc';
  cargando = true;

  estadosDisponibles: { valor: EstadoCita | 'todas'; texto: string; icono: string }[] = [
    { valor: 'todas', texto: 'Todas', icono: '📋' },
    { valor: 'pendiente', texto: 'Pendientes', icono: '🕐' },
    { valor: 'confirmada', texto: 'Confirmadas', icono: '✅' },
    { valor: 'completada', texto: 'Completadas', icono: '✔️' },
    { valor: 'cancelada', texto: 'Canceladas', icono: '❌' }
  ];

  opcionesOrdenamiento = [
    { valor: 'fecha-desc', texto: 'Fecha (más reciente)' },
    { valor: 'fecha-asc', texto: 'Fecha (más antigua)' },
    { valor: 'doctor', texto: 'Nombre del doctor' },
    { valor: 'especialidad', texto: 'Especialidad' }
  ];

  ngOnInit() {
    this.cargarCitasRealTime();
  }

  ngOnDestroy() {
    if (this.citasSubscription) {
      this.citasSubscription.unsubscribe();
    }
  }

  cargarCitasRealTime() {
    const uid = this.autenticacionService.obtenerUid();
    
    if (!uid) {
      this.router.navigate(['/autenticacion/inicio-sesion']);
      return;
    }

    this.citasSubscription = this.citasService.obtenerCitasPorPacienteRealTime(uid)
      .subscribe({
        next: (citas) => {
          console.log('✅ Mis Citas: Citas actualizadas en tiempo real:', citas.length);
          this.citas = citas;
          this.aplicarFiltroYOrdenamiento();
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar citas:', error);
          this.cargando = false;
        }
      });
  }

  aplicarFiltroYOrdenamiento() {
    if (this.filtroEstado === 'todas') {
      this.citasFiltradas = [...this.citas];
    } else {
      this.citasFiltradas = this.citas.filter(cita => cita.estado === this.filtroEstado);
    }
    
    this.aplicarOrdenamiento();
  }

  filtrarPorEstado(estado: EstadoCita | 'todas') {
    this.filtroEstado = estado;
    this.aplicarFiltroYOrdenamiento();
  }

  cambiarOrdenamiento() {
    this.aplicarOrdenamiento();
  }

  aplicarOrdenamiento() {
    switch (this.ordenamiento) {
      case 'fecha-desc':
        this.citasFiltradas.sort((a, b) => {
          const fechaA = this.convertirFecha(a.fecha).getTime();
          const fechaB = this.convertirFecha(b.fecha).getTime();
          return fechaB - fechaA;
        });
        break;

      case 'fecha-asc':
        this.citasFiltradas.sort((a, b) => {
          const fechaA = this.convertirFecha(a.fecha).getTime();
          const fechaB = this.convertirFecha(b.fecha).getTime();
          return fechaA - fechaB;
        });
        break;

      case 'doctor':
        this.citasFiltradas.sort((a, b) => 
          a.doctorNombre.localeCompare(b.doctorNombre)
        );
        break;

      case 'especialidad':
        this.citasFiltradas.sort((a, b) => 
          a.especialidad.localeCompare(b.especialidad)
        );
        break;
    }
  }

  private convertirFecha(fecha: any): Date {
    if (fecha instanceof Date) return fecha;
    if (fecha?.seconds) return new Date(fecha.seconds * 1000);
    return new Date(fecha);
  }

  async cancelarCita(cita: Cita) {
    if (!cita.id) return;

    const confirmar = confirm(`¿Estás seguro de cancelar la cita con ${cita.doctorNombre}?`);
    
    if (!confirmar) return;

    try {
      const resultado = await this.citasService.cancelarCita(cita.id);
      
      if (resultado.exito) {
        alert('Cita cancelada exitosamente');
        console.log('✅ Cita cancelada, el tiempo real refrescará los datos');
      } else {
        alert('Error al cancelar la cita: ' + resultado.mensaje);
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert('Error al cancelar la cita');
    }
  }

  puedeCancelar(cita: Cita): boolean {
    if (cita.estado !== 'pendiente' && cita.estado !== 'confirmada') {
      return false;
    }

    const fechaCita = this.convertirFecha(cita.fecha);
    const hoy = new Date();
    
    return fechaCita > hoy;
  }

  formatearFecha(fecha: Date): string {
    try {
      const fechaObj = this.convertirFecha(fecha);
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

  obtenerClaseEstado(estado: string): string {
    return `estado-${estado}`;
  }

  contarPorEstado(estado: EstadoCita | 'todas'): number {
    if (estado === 'todas') {
      return this.citas.length;
    }
    return this.citas.filter(c => c.estado === estado).length;
  }

  agendarNuevaCita() {
    this.router.navigate(['/paciente/doctores']);
  }
}