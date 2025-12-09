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
  citasActivas: Cita[] = [];
  proximasCitas: Cita[] = [];
  totalDoctores = 0;
  cargando = true;

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    const uid = this.autenticacionService.obtenerUid();

    if (!uid) {
      this.router.navigate(['/autenticacion/inicio-sesion']);
      return;
    }

    try {
      this.usuario = await this.usuariosService.obtenerUsuario(uid);

      const todasCitas = await this.citasService.obtenerCitasPorPaciente(uid);
      
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      this.citasActivas = todasCitas.filter(cita => {
        const fechaCita = this.convertirFecha(cita.fecha);
        const fechaSoloCita = new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate());
        
        const esEstadoActivo = cita.estado === 'pendiente' || cita.estado === 'confirmada';
        const esFechaFutura = fechaSoloCita.getTime() >= hoy.getTime();
        
        return esEstadoActivo && esFechaFutura;
      });

      this.proximasCitas = [...this.citasActivas]
        .sort((a, b) => {
          const fechaA = this.convertirFecha(a.fecha);
          const fechaB = this.convertirFecha(b.fecha);
          return fechaA.getTime() - fechaB.getTime();
        })
        .slice(0, 3);

      const doctores = await this.doctoresService.obtenerTodosDoctores();
      this.totalDoctores = doctores.length;

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  private convertirFecha(fecha: any): Date {
    if (fecha instanceof Date) {
      return fecha;
    }
    
    if (fecha && typeof fecha === 'object' && 'seconds' in fecha) {
      return new Date(fecha.seconds * 1000);
    }
    
    if (fecha && typeof fecha.toDate === 'function') {
      return fecha.toDate();
    }
    
    return new Date(fecha);
  }

  get saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
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
      'pendiente': '🕒 Pendiente',
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

  navegarAgendarCita() {
    this.router.navigate(['/paciente/doctores']);
  }

  navegarMisCitas() {
    this.router.navigate(['/paciente/mis-citas']);
  }

  navegarDoctores() {
    this.router.navigate(['/paciente/doctores']);
  }
}