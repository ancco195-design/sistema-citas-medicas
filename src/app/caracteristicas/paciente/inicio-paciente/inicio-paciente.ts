import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { Usuario } from '../../../nucleo/modelos/usuario.model';
import { Cita } from '../../../nucleo/modelos/cita.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio-paciente',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './inicio-paciente.html',
  styleUrl: './inicio-paciente.css'
})
export class InicioPacienteComponent implements OnInit, OnDestroy {
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private citasService = inject(CitasService);
  private doctoresService = inject(DoctoresService);
  private router = inject(Router);

  // ← NUEVO: Suscripciones para limpiar
  private citasSubscription?: Subscription;
  private doctoresSubscription?: Subscription;

  usuario: Usuario | null = null;
  citasActivas: Cita[] = [];
  proximasCitas: Cita[] = [];
  totalDoctores = 0;
  cargando = true;

  ngOnInit() {
    this.cargarDatosRealTime();
  }

  ngOnDestroy() {
    // ← IMPORTANTE: Limpiar suscripciones
    if (this.citasSubscription) {
      this.citasSubscription.unsubscribe();
    }
    if (this.doctoresSubscription) {
      this.doctoresSubscription.unsubscribe();
    }
  }

  // ← NUEVO: Cargar datos en tiempo real
  async cargarDatosRealTime() {
    const uid = this.autenticacionService.obtenerUid();

    if (!uid) {
      this.router.navigate(['/autenticacion/inicio-sesion']);
      return;
    }

    try {
      // Cargar usuario (esto no necesita tiempo real)
      this.usuario = await this.usuariosService.obtenerUsuario(uid);

      // Suscribirse a citas en tiempo real
      this.citasSubscription = this.citasService.obtenerCitasPorPacienteRealTime(uid)
        .subscribe({
          next: (citas) => {
            this.procesarCitas(citas);
            this.cargando = false;
          },
          error: (error) => {
            console.error('❌ Error al cargar citas del paciente:', error);
            this.cargando = false;
          }
        });

      // Suscribirse a doctores en tiempo real
      this.doctoresSubscription = this.doctoresService.obtenerTodosDoctoresRealTime()
        .subscribe({
          next: (doctores) => {
            this.totalDoctores = doctores.length;
          },
          error: (error) => {
            console.error('❌ Error al cargar doctores:', error);
          }
        });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.cargando = false;
    }
  }

  // ← NUEVO: Procesar citas cuando se actualizan
  procesarCitas(todasCitas: Cita[]) {
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