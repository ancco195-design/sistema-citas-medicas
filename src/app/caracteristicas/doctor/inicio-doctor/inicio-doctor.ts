import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita } from '../../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-inicio-doctor',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './inicio-doctor.html',
  styleUrls: ['./inicio-doctor.css']
})
export class InicioDoctor implements OnInit {
  private citasService = inject(CitasService);
  private authService = inject(AutenticacionService);

  citasHoy = 0;
  pendientes = 0;
  totalPacientes = 0;
  fechaHoy = new Date();

  async ngOnInit() {
    const uid = this.authService.obtenerUid();
    if (uid) {
      const citas = await this.citasService.obtenerCitasPorDoctor(uid);
      this.procesarDatos(citas);
    }
  }

  procesarDatos(citas: Cita[]) {
    const hoyStr = new Date().toDateString();
    
    this.citasHoy = citas.filter(c => {
      // Convertir Timestamp o Date a string para comparar solo la fecha (día/mes/año)
      const fechaCita = c.fecha instanceof Date ? c.fecha : new Date((c.fecha as any).seconds * 1000);
      return fechaCita.toDateString() === hoyStr && c.estado !== 'cancelada';
    }).length;

    this.pendientes = citas.filter(c => c.estado === 'pendiente').length;

    // Calcular pacientes únicos usando un Set
    const pacientesUnicos = new Set(citas.map(c => c.pacienteId));
    this.totalPacientes = pacientesUnicos.size;
  }
}