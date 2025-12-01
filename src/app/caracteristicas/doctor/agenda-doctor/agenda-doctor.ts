import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importar Router para navegar al detalle
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita } from '../../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './agenda-doctor.html',
  styleUrls: ['./agenda-doctor.css']
})
export class AgendaDoctor implements OnInit {
  private citasService = inject(CitasService);
  private authService = inject(AutenticacionService);
  private router = inject(Router);

  citas: Cita[] = [];
  cargando = true;
  procesandoId: string | null = null;

  async ngOnInit() {
    this.cargarAgenda();
  }

  async cargarAgenda() {
    this.cargando = true;
    const uid = this.authService.obtenerUid();
    
    if (uid) {
      this.citas = await this.citasService.obtenerCitasPorDoctor(uid);
    }
    this.cargando = false;
  }

  async gestionarCita(cita: Cita, accion: 'confirmar' | 'cancelar' | 'completar', event: Event) {
    // Evita que el click se propague y abra el detalle al mismo tiempo
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
        // Redirigir al detalle para llenar notas
        this.router.navigate(['/doctor/cita', cita.id]);
        return; 
      }

      if (resultado && resultado.exito) {
        await this.cargarAgenda(); // Recargar lista
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