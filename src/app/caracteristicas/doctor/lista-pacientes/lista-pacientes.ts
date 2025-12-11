import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../compartido/navbar/navbar';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { Cita } from '../../../nucleo/modelos/cita.model';

// Interfaz local para mostrar el resumen en la tarjeta
interface PacienteResumen {
  id: string;
  nombre: string;
  ultimaCita: Date;
  totalCitas: number;
  foto?: string; // ← NUEVO: Foto del paciente
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
  private usuariosService = inject(UsuariosService);
  private authService = inject(AutenticacionService);
  private router = inject(Router);

  pacientes: PacienteResumen[] = [];
  cargando = true;

  async ngOnInit() {
    const uid = this.authService.obtenerUid();
    
    if (uid) {
      try {
        // Obtenemos TODAS las citas históricas del doctor
        const citas = await this.citasService.obtenerCitasPorDoctor(uid);
        await this.agruparPacientes(citas);
      } catch (error) {
        console.error('Error al cargar la lista de pacientes:', error);
      }
    }
    this.cargando = false;
  }

  /**
   * Procesa las citas para extraer una lista de pacientes únicos
   * Calcula la fecha de la última visita y el total de citas por paciente
   * ← ACTUALIZADO: Ahora también carga la foto de cada paciente
   */
  async agruparPacientes(citas: Cita[]) {
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
          totalCitas: 1,
          foto: undefined // Se cargará después
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

    // Convertimos el mapa a un array
    this.pacientes = Array.from(mapa.values());

    // ==================== NUEVO: CARGAR FOTOS DE PACIENTES ====================
    // Cargar la foto de cada paciente
    await this.cargarFotosPacientes();
    // ==================== FIN NUEVO ====================
  }

  /**
   * ← NUEVO: Cargar fotos de todos los pacientes
   */
  async cargarFotosPacientes() {
    const promesas = this.pacientes.map(async (paciente) => {
      try {
        const usuario = await this.usuariosService.obtenerUsuario(paciente.id);
        if (usuario?.foto) {
          paciente.foto = usuario.foto;
        }
      } catch (error) {
        console.error(`Error al cargar foto del paciente ${paciente.id}:`, error);
      }
    });

    // Esperar a que todas las fotos se carguen
    await Promise.all(promesas);
  }

  /**
   * ← NUEVO: Verificar si un paciente tiene foto
   */
  tieneFoto(paciente: PacienteResumen): boolean {
    return !!paciente.foto && paciente.foto !== '';
  }

  /**
   * ← NUEVO: Obtener iniciales del paciente
   */
  obtenerIniciales(nombre: string): string {
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
    }
    return nombre.charAt(0).toUpperCase();
  }

  /**
   * ← NUEVO: Ver historial del paciente
   */
  verHistorial(pacienteId: string) {
    this.router.navigate(['/doctor/paciente', pacienteId]);
  }
}