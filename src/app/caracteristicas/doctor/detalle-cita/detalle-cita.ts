import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Vital para [(ngModel)]
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { Cita } from '../../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-detalle-cita',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './detalle-cita.html',
  styleUrls: ['./detalle-cita.css']
})
export class DetalleCita implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private citasService = inject(CitasService);

  cita: Cita | null = null;
  cargando = true;
  notasMedicas = '';

  async ngOnInit() {
    // Obtener ID de la URL (/doctor/cita/:id)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cita = await this.citasService.obtenerCita(id);
      if (this.cita) {
        // Cargar notas existentes si las hay
        this.notasMedicas = this.cita.notas || '';
      }
    }
    this.cargando = false;
  }

  async confirmar() {
    if (!this.cita?.id) return;
    try {
      await this.citasService.confirmarCita(this.cita.id);
      this.cita.estado = 'confirmada';
      // No usamos alert() nativo si podemos evitarlo, pero para este MVP está bien.
      alert('Has aceptado la cita.');
    } catch (error) {
      console.error(error);
      alert('Error al confirmar la cita');
    }
  }

  async guardarNotas() {
    if (!this.cita?.id) return;
    try {
      await this.citasService.completarCita(this.cita.id, this.notasMedicas);
      this.cita.estado = 'completada';
      alert('Notas guardadas y consulta finalizada.');
      this.router.navigate(['/doctor/agenda']);
    } catch (error) {
      console.error(error);
      alert('Error al guardar notas');
    }
  }

  volver() {
    this.router.navigate(['/doctor/agenda']);
  }

  formatearFecha(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (fecha.seconds) return new Date(fecha.seconds * 1000);
    return new Date(fecha);
  }
}