import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita, EstadoCita } from '../../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './agenda-doctor.html',
  styleUrls: ['./agenda-doctor.css']
})
export class AgendaDoctor implements OnInit {
  private citasService = inject(CitasService);
  private authService = inject(AutenticacionService);
  private router = inject(Router);

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  cargando = true;
  procesandoId: string | null = null;

  // Filtros
  filtroFecha: string = '';
  filtroEspecialidad: string = '';
  filtroEstado: EstadoCita | 'todas' = 'todas';
  
  especialidades: string[] = [];

  async ngOnInit() {
    await this.cargarAgenda();
  }

  async cargarAgenda() {
    this.cargando = true;
    const uid = this.authService.obtenerUid();
    
    if (uid) {
      this.citas = await this.citasService.obtenerCitasPorDoctor(uid);
      this.citasFiltradas = [...this.citas];
      this.extraerEspecialidades();
    }
    this.cargando = false;
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
        if (!confirm('¿Rechazar esta cita?')) { this.procesandoId = null; return; }
        resultado = await this.citasService.cancelarCita(cita.id);
      } else if (accion === 'completar') {
        this.router.navigate(['/doctor/cita', cita.id]);
        return; 
      }

      if (resultado && resultado.exito) {
        await this.cargarAgenda();
        this.aplicarFiltros();
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