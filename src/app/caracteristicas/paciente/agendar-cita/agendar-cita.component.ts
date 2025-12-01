import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { CitasService } from '../../../nucleo/servicios/citas.service';
import { Doctor } from '../../../nucleo/modelos/doctor.model';
import { Usuario } from '../../../nucleo/modelos/usuario.model';

/**
 * Componente Agendar Cita
 * Formulario para que los pacientes agenden citas con doctores
 */
@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './agendar-cita.component.html',
  styleUrl: './agendar-cita.component.css'
})
export class AgendarCitaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private doctoresService = inject(DoctoresService);
  private citasService = inject(CitasService);

  formularioCita!: FormGroup;
  doctor: Doctor | null = null;
  doctorUsuario: Usuario | null = null;
  paciente: Usuario | null = null;
  
  horasDisponibles: string[] = [];
  cargando = false;
  procesando = false;
  mensajeExito = '';
  mensajeError = '';
  
  fechaMinima: string = '';
  fechaMaxima: string = '';

  ngOnInit() {
    this.inicializarFormulario();
    this.configurarFechas();
    this.cargarDatos();
  }

  /**
   * Inicializar formulario reactivo
   */
  inicializarFormulario() {
    this.formularioCita = this.fb.group({
      doctorId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });

    // Escuchar cambios en la fecha para actualizar horas disponibles
    this.formularioCita.get('fecha')?.valueChanges.subscribe(() => {
      this.generarHorasDisponibles();
    });
  }

  /**
   * Configurar fechas mínimas y máximas
   */
  configurarFechas() {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const enTresMeses = new Date(hoy);
    enTresMeses.setMonth(enTresMeses.getMonth() + 3);

    this.fechaMinima = manana.toISOString().split('T')[0];
    this.fechaMaxima = enTresMeses.toISOString().split('T')[0];
  }

  /**
   * Cargar datos necesarios
   */
  async cargarDatos() {
    this.cargando = true;

    try {
      // Obtener ID del doctor desde la URL
      const doctorId = this.route.snapshot.paramMap.get('doctorId');
      
      if (!doctorId) {
        this.mensajeError = 'No se especificó un doctor';
        this.cargando = false;
        return;
      }

      // Cargar doctor
      this.doctor = await this.doctoresService.obtenerDoctor(doctorId);
      
      if (!this.doctor) {
        this.mensajeError = 'Doctor no encontrado';
        this.cargando = false;
        return;
      }

      // Cargar información del usuario doctor
      this.doctorUsuario = await this.usuariosService.obtenerUsuario(doctorId);

      // Cargar paciente actual
      const uid = this.autenticacionService.obtenerUid();
      if (uid) {
        this.paciente = await this.usuariosService.obtenerUsuario(uid);
      }

      // Establecer doctorId en el formulario
      this.formularioCita.patchValue({ doctorId });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mensajeError = 'Error al cargar información';
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Generar horas disponibles (bloques de 30 minutos)
   */
  generarHorasDisponibles() {
    this.horasDisponibles = [];
    
    // Generar horarios de 8:00 AM a 6:00 PM en bloques de 30 minutos
    for (let hora = 8; hora < 18; hora++) {
      this.horasDisponibles.push(`${hora.toString().padStart(2, '0')}:00`);
      this.horasDisponibles.push(`${hora.toString().padStart(2, '0')}:30`);
    }
  }

  /**
   * Procesar el formulario
   */
  async onSubmit() {
    if (this.formularioCita.invalid) {
      this.formularioCita.markAllAsTouched();
      return;
    }

    if (!this.paciente || !this.doctorUsuario) {
      this.mensajeError = 'Información incompleta';
      return;
    }

    this.procesando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    try {
      const valores = this.formularioCita.value;

      // Crear la cita
      const resultado = await this.citasService.crearCita(
        {
          pacienteId: this.paciente.uid,
          doctorId: valores.doctorId,
          especialidad: this.doctor!.especialidad,
          fecha: new Date(valores.fecha),
          hora: valores.hora,
          motivo: valores.motivo
        },
        `${this.paciente.nombre} ${this.paciente.apellido}`,
        `${this.doctorUsuario.nombre} ${this.doctorUsuario.apellido}`
      );

      if (resultado.exito) {
        this.mensajeExito = '¡Cita agendada exitosamente!';
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/paciente/mis-citas']);
        }, 2000);
      } else {
        this.mensajeError = resultado.mensaje;
      }

    } catch (error: any) {
      this.mensajeError = error.message || 'Error al agendar la cita';
    } finally {
      this.procesando = false;
    }
  }

  /**
   * Obtener mensaje de error para un campo
   */
  obtenerMensajeError(campo: string): string {
    const control = this.formularioCita.get(campo);
    
    if (!control?.touched) return '';
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    
    return '';
  }

  /**
   * Obtener nombre completo del doctor
   */
  get nombreDoctor(): string {
    if (this.doctorUsuario) {
      return `Dr. ${this.doctorUsuario.nombre} ${this.doctorUsuario.apellido}`;
    }
    return 'Doctor';
  }

  /**
   * Cancelar y volver
   */
  cancelar() {
    this.router.navigate(['/paciente/doctores']);
  }
}