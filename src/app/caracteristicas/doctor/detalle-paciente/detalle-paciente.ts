import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita } from '../../../nucleo/modelos/cita.model';
import { Usuario } from '../../../nucleo/modelos/usuario.model';

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './detalle-paciente.html',
  styleUrl: './detalle-paciente.css'
})
export class DetallePaciente implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private citasService = inject(CitasService);
  private usuariosService = inject(UsuariosService);
  private authService = inject(AutenticacionService);

  paciente: Usuario | null = null;
  citasPaciente: Cita[] = [];
  cargando = true;

  async ngOnInit() {
    const pacienteId = this.route.snapshot.paramMap.get('id');
    
    if (!pacienteId) {
      this.router.navigate(['/doctor/pacientes']);
      return;
    }

    await this.cargarDatos(pacienteId);
  }

  async cargarDatos(pacienteId: string) {
    try {
      const doctorId = this.authService.obtenerUid();
      
      if (!doctorId) return;

      // Cargar información del paciente
      this.paciente = await this.usuariosService.obtenerUsuario(pacienteId);

      // Cargar todas las citas del doctor
      const todasCitas = await this.citasService.obtenerCitasPorDoctor(doctorId);
      
      // Filtrar solo las citas de este paciente
      this.citasPaciente = todasCitas
        .filter(c => c.pacienteId === pacienteId)
        .sort((a, b) => {
          // Ordenar por fecha descendente (más reciente primero)
          const fechaA = this.convertirFecha(a.fecha);
          const fechaB = this.convertirFecha(b.fecha);
          return fechaB.getTime() - fechaA.getTime();
        });

    } catch (error) {
      console.error('Error al cargar datos del paciente:', error);
    } finally {
      this.cargando = false;
    }
  }

  convertirFecha(fecha: any): Date {
    if (fecha instanceof Date) {
      return fecha;
    } else if (fecha?.seconds) {
      return new Date(fecha.seconds * 1000);
    }
    return new Date(fecha);
  }

  obtenerIniciales(): string {
    if (!this.paciente) return 'P';
    return `${this.paciente.nombre.charAt(0)}${this.paciente.apellido.charAt(0)}`.toUpperCase();
  }

  get nombreCompleto(): string {
    if (!this.paciente) return 'Paciente';
    return `${this.paciente.nombre} ${this.paciente.apellido}`;
  }

  get tieneFoto(): boolean {
    return !!this.paciente?.foto && this.paciente.foto !== '';
  }

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'estado-pendiente',
      'confirmada': 'estado-confirmada',
      'completada': 'estado-completada',
      'cancelada': 'estado-cancelada',
      'no-asistio': 'estado-no-asistio'
    };
    return clases[estado] || '';
  }

  obtenerTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'pendiente': '⏳ Pendiente',
      'confirmada': '✅ Confirmada',
      'completada': '✔️ Completada',
      'cancelada': '❌ Cancelada',
      'no-asistio': '⚠️ No asistió'
    };
    return textos[estado] || estado;
  }

  volver() {
    this.router.navigate(['/doctor/pacientes']);
  }
}