import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita } from '../../../nucleo/modelos/cita.model';

// Interfaz local para mostrar el resumen en la tarjeta
interface PacienteResumen {
  id: string;
  nombre: string;
  ultimaCita: Date;
  totalCitas: number;
}

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './lista-pacientes.html',
  styleUrls: ['./lista-pacientes.css']
})
export class ListaPacientes implements OnInit {
  private citasService = inject(CitasService);
  private authService = inject(AutenticacionService);

  pacientes: PacienteResumen[] = [];
  cargando = true;

  async ngOnInit() {
    const uid = this.authService.obtenerUid();
    
    if (uid) {
      try {
        // Obtenemos TODAS las citas históricas del doctor
        const citas = await this.citasService.obtenerCitasPorDoctor(uid);
        this.agruparPacientes(citas);
      } catch (error) {
        console.error('Error al cargar la lista de pacientes:', error);
      }
    }
    this.cargando = false;
  }

  /**
   * Procesa las citas para extraer una lista de pacientes únicos
   * Calcula la fecha de la última visita y el total de citas por paciente
   */
  agruparPacientes(citas: Cita[]) {
    const mapa = new Map<string, PacienteResumen>();

    citas.forEach(cita => {
      // Conversión segura de fecha (Timestamp Firestore -> Date JS)
      let fechaCita: Date;
      if (cita.fecha instanceof Date) {
        fechaCita = cita.fecha;
      } else if ((cita.fecha as any).seconds) {
        fechaCita = new Date((cita.fecha as any).seconds * 1000);
      } else {
        // Fallback por si viene como string
        fechaCita = new Date(cita.fecha);
      }

      // Si el paciente no está en el mapa, lo agregamos
      if (!mapa.has(cita.pacienteId)) {
        mapa.set(cita.pacienteId, {
          id: cita.pacienteId,
          nombre: cita.pacienteNombre || 'Paciente Desconocido',
          ultimaCita: fechaCita,
          totalCitas: 1
        });
      } else {
        // Si ya existe, actualizamos sus contadores
        const existente = mapa.get(cita.pacienteId)!;
        existente.totalCitas++;
        
        // Verificamos si esta cita es más reciente que la guardada
        if (fechaCita > existente.ultimaCita) {
          existente.ultimaCita = fechaCita;
        }
      }
    });

    // Convertimos el mapa a un array para usarlo en el *ngFor
    this.pacientes = Array.from(mapa.values());
  }
}