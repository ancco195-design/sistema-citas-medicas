import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { Doctor } from '../../../nucleo/modelos/doctor.model';
import { Usuario } from '../../../nucleo/modelos/usuario.model';
import { TelefonoPipe } from '../../../nucleo/pipes/telefono-pipe';

@Component({
  selector: 'app-detalle-doctor',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TelefonoPipe],
  templateUrl: './detalle-doctor.html',
  styleUrl: './detalle-doctor.css'
})
export class DetalleDoctor implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private doctoresService = inject(DoctoresService);
  private usuariosService = inject(UsuariosService);

  doctor: Doctor | null = null;
  usuario: Usuario | null = null;
  cargando = true;
  errorCarga = false;
  imagenError = false;

  async ngOnInit() {
    const doctorId = this.route.snapshot.paramMap.get('id');
    
    if (!doctorId) {
      this.errorCarga = true;
      this.cargando = false;
      return;
    }

    await this.cargarDoctor(doctorId);
  }

  async cargarDoctor(uid: string) {
    try {
      this.cargando = true;
      
      this.doctor = await this.doctoresService.obtenerDoctor(uid);
      
      if (this.doctor) {
        this.usuario = await this.usuariosService.obtenerUsuario(uid);
      } else {
        this.errorCarga = true;
      }
    } catch (error) {
      console.error('Error al cargar doctor:', error);
      this.errorCarga = true;
    } finally {
      this.cargando = false;
    }
  }

  get nombreCompleto(): string {
    if (!this.usuario) return 'Doctor';
    return `Dr. ${this.usuario.nombre} ${this.usuario.apellido}`;
  }

  get aniosExperiencia(): number {
    if (!this.doctor) return 0;
    return (this.doctor as any)['añosExperiencia'] || 0;
  }

  get estrellas(): number[] {
    const calificacion = this.doctor?.calificacion || 0;
    return Array(5).fill(0).map((_, i) => i < Math.round(calificacion) ? 1 : 0);
  }

  obtenerIniciales(): string {
    if (!this.usuario) return 'DR';
    return `${this.usuario.nombre.charAt(0)}${this.usuario.apellido.charAt(0)}`.toUpperCase();
  }

  // ==================== NUEVO: Getter para foto ====================
  get fotoDoctor(): string | undefined {
    // La foto está en usuario.foto, no en doctor.foto
    return this.usuario?.foto;
  }

  get tieneFoto(): boolean {
    return !!this.usuario?.foto && this.usuario.foto !== '';
  }
  // ==================== FIN NUEVO ====================

  obtenerDiasActivos(): string[] {
    if (!this.doctor?.horarioDisponible) return [];
    
    return this.doctor.horarioDisponible
      .filter(h => h.activo)
      .map(h => this.capitalizarDia(h.dia));
  }

  obtenerHorarioDia(dia: string): string {
    if (!this.doctor?.horarioDisponible) return '';
    
    const diaLower = dia.toLowerCase();
    const horario = this.doctor.horarioDisponible.find(
      h => h.dia.toLowerCase() === diaLower && h.activo
    );
    
    return horario ? `${horario.horaInicio} - ${horario.horaFin}` : 'No disponible';
  }

  capitalizarDia(dia: string): string {
    const dias: { [key: string]: string } = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miercoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };
    return dias[dia.toLowerCase()] || dia;
  }

  agendarCita() {
    if (this.doctor) {
      this.router.navigate(['/paciente/agendar-cita', this.doctor.uid]);
    }
  }

  volver() {
    this.router.navigate(['/paciente/doctores']);
  }

  onImageError(event: any) {
    if (!this.imagenError) {
      this.imagenError = true;
      // Ocultar imagen y mostrar placeholder
      event.target.style.display = 'none';
    }
  }
}