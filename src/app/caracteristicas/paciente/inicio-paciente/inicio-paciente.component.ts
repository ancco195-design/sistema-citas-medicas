import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { Usuario } from '../../../nucleo/modelos/usuario.model';
import { Cita } from '../../../nucleo/modelos/cita.model';

/**
 * Componente de Inicio del Paciente
 * Dashboard principal con resumen de información
 */
@Component({
  selector: 'app-inicio-paciente',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './inicio-paciente.component.html',
  styleUrl: './inicio-paciente.component.css'
})
export class InicioPacienteComponent implements OnInit {
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private citasService = inject(CitasService);
  private doctoresService = inject(DoctoresService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  citasPendientes: Cita[] = [];
  proximasCitas: Cita[] = [];
  totalDoctores = 0;
  cargando = false; // CAMBIADO A FALSE PARA QUE CARGUE INMEDIATAMENTE

  ngOnInit() {
    this.cargarDatos();
  }

  /**
   * Cargar todos los datos del dashboard
   */
  cargarDatos() {
    const uid = this.autenticacionService.obtenerUid();

    if (!uid) {
      this.router.navigate(['/autenticacion/inicio-sesion']);
      return;
    }

    // Cargar usuario
    this.usuariosService.obtenerUsuario(uid).then(usuario => {
      this.usuario = usuario;
    }).catch(error => {
      console.error('Error al cargar usuario:', error);
    });

    // Cargar citas
    this.citasService.obtenerCitasPorPaciente(uid).then(todasCitas => {
      this.citasPendientes = todasCitas.filter(
        cita => cita.estado === 'pendiente' || cita.estado === 'confirmada'
      );

      this.proximasCitas = this.citasPendientes
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        .slice(0, 3);
    }).catch(error => {
      console.warn('No se pudieron cargar las citas:', error);
    });

    // Cargar doctores
    this.doctoresService.obtenerTodosDoctores().then(doctores => {
      this.totalDoctores = doctores.length;
    }).catch(error => {
      console.warn('No se pudieron cargar los doctores:', error);
    });
  }

  /**
   * Obtener saludo según la hora
   */
  get saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
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
   * Obtener badge de estado de cita
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
   * Navegar a agendar cita
   */
  navegarAgendarCita() {
    this.router.navigate(['/paciente/doctores']);
  }

  /**
   * Navegar a ver todas las citas
   */
  navegarMisCitas() {
    this.router.navigate(['/paciente/mis-citas']);
  }

  /**
   * Navegar a buscar doctores
   */
  navegarDoctores() {
    this.router.navigate(['/paciente/doctores']);
  }
}