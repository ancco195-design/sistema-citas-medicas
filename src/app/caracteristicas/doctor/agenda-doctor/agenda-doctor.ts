import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita, EstadoCita } from '../../../nucleo/modelos/cita.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './agenda-doctor.html',
  styleUrls: ['./agenda-doctor.css']
})
export class AgendaDoctor implements OnInit, OnDestroy {
  private citasService = inject(CitasService);
  private authService = inject(AutenticacionService);
  private router = inject(Router);

  // ← NUEVO: Suscripción para limpiar
  private citasSubscription?: Subscription;

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  cargando = true;
  procesandoId: string | null = null;

  // Filtros
  filtroFecha: string = '';
  filtroEspecialidad: string = '';
  filtroEstado: EstadoCita | 'todas' = 'todas';
  
  especialidades: string[] = [];

  ngOnInit() {
    this.cargarAgendaRealTime();
  }

  ngOnDestroy() {
    // ← IMPORTANTE: Limpiar suscripción
    if (this.citasSubscription) {
      this.citasSubscription.unsubscribe();
    }
  }

  // ← NUEVO: Cargar agenda en tiempo real
  cargarAgendaRealTime() {
    const uid = this.authService.obtenerUid();
    
    if (uid) {
      this.citasSubscription = this.citasService.obtenerCitasPorDoctorRealTime(uid)
        .subscribe({
          next: (citas) => {
            this.citas = citas;
            this.citasFiltradas = [...citas];
            this.extraerEspecialidades();
            this.aplicarFiltros(); // Reaplicar filtros automáticamente
            this.cargando = false;
          },
          error: (error) => {
            console.error('❌ Error al cargar agenda:', error);
            this.cargando = false;
          }
        });
    }
  }

  extraerEspecialidades() {
    const especialidadesSet = new Set(this.citas.map(c => c.especialidad).filter(Boolean));
    this.especialidades = Array.from(especialidadesSet);
  }

  aplicarFiltros() {
    this.citasFiltradas = this.citas.filter(cita => {
      // Filtro por fecha
      if (this.filtroFecha) {
        const fechaCita = this.formatearFecha(cita.fecha);
        const fechaFiltro = new Date(this.filtroFecha);
        if (fechaCita?.toDateString() !== fechaFiltro.toDateString()) {
          return false;
        }
      }

      // Filtro por especialidad
      if (this.filtroEspecialidad && cita.especialidad !== this.filtroEspecialidad) {
        return false;
      }

      // Filtro por estado
      if (this.filtroEstado !== 'todas' && cita.estado !== this.filtroEstado) {
        return false;
      }

      return true;
    });
  }

  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroEspecialidad = '';
    this.filtroEstado = 'todas';
    this.citasFiltradas = [...this.citas];
  }

  async gestionarCita(cita: Cita, accion: 'confirmar' | 'cancelar' | 'completar', event: Event) {
    event.stopPropagation();
    
    if (!cita.id) return;
    this.procesandoId = cita.id;

    try {
      let resultado;
      
      if (accion === 'confirmar') {
        resultado = await this.citasService.confirmarCita(cita.id);
      } else if (accion === 'cancelar') {
        if (!confirm('¿Rechazar esta cita?')) { 
          this.procesandoId = null; 
          return; 
        }
        resultado = await this.citasService.cancelarCita(cita.id);
      } else if (accion === 'completar') {
        this.router.navigate(['/doctor/cita', cita.id]);
        return; 
      }

      if (resultado && resultado.exito) {
        // Ya no necesitamos recargar manualmente, el observable lo hace automáticamente
        console.log('✅ Cita actualizada, el tiempo real refrescará los datos');
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.procesandoId = null;
    }
  }

  verDetalle(id: string) {
    this.router.navigate(['/doctor/cita', id]);
  }

  formatearFecha(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (fecha.seconds) return new Date(fecha.seconds * 1000);
    return new Date(fecha);
  }
}