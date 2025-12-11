import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita } from '../../../nucleo/modelos/cita.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio-doctor',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './inicio-doctor.html',
  styleUrls: ['./inicio-doctor.css']
})
export class InicioDoctor implements OnInit, OnDestroy {
  private citasService = inject(CitasService);
  private authService = inject(AutenticacionService);

  // ← NUEVO: Suscripción para limpiar al destruir
  private citasSubscription?: Subscription;

  citasHoy = 0;
  pendientes = 0;
  totalPacientes = 0;
  fechaHoy = new Date();

  ngOnInit() {
    this.cargarDatosRealTime();
  }

  ngOnDestroy() {
    // ← IMPORTANTE: Limpiar suscripción
    if (this.citasSubscription) {
      this.citasSubscription.unsubscribe();
    }
  }

  // ← NUEVO: Cargar datos en tiempo real
  cargarDatosRealTime() {
    const uid = this.authService.obtenerUid();
    
    if (uid) {
      // Suscribirse a las citas del doctor en tiempo real
      this.citasSubscription = this.citasService.obtenerCitasPorDoctorRealTime(uid)
        .subscribe({
          next: (citas) => {
            this.procesarDatos(citas);
          },
          error: (error) => {
            console.error('❌ Error al cargar citas del doctor:', error);
          }
        });
    }
  }

  procesarDatos(citas: Cita[]) {
    const hoyStr = new Date().toDateString();
    
    this.citasHoy = citas.filter(c => {
      // Convertir Timestamp o Date a string para comparar solo la fecha
      const fechaCita = c.fecha instanceof Date ? c.fecha : new Date((c.fecha as any).seconds * 1000);
      return fechaCita.toDateString() === hoyStr && c.estado !== 'cancelada';
    }).length;

    this.pendientes = citas.filter(c => c.estado === 'pendiente').length;

    // Calcular pacientes únicos usando un Set
    const pacientesUnicos = new Set(citas.map(c => c.pacienteId));
    this.totalPacientes = pacientesUnicos.size;
  }
}