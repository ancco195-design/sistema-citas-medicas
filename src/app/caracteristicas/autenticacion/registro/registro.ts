import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { TipoRol } from '../../../nucleo/modelos/usuario.model';
import { ESPECIALIDADES_COMUNES } from '../../../nucleo/modelos/especialidad.model';

/**
 * Componente de Registro
 * Permite registrar nuevos usuarios (pacientes y doctores)
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private doctoresService = inject(DoctoresService);
  private router = inject(Router);

  formularioRegistro: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  mostrarPassword = false;
  especialidades = ESPECIALIDADES_COMUNES;

  constructor() {
    this.formularioRegistro = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],
      rol: ['paciente', [Validators.required]],
      especialidad: [''],
      consultorio: [''],
      biografia: [''],
      añosExperiencia: [0]
    });

    // Observar cambios en el rol
    this.formularioRegistro.get('rol')?.valueChanges.subscribe(rol => {
      this.actualizarValidacionesSegunRol(rol);
    });
  }

  /**
   * Actualizar validaciones según el rol seleccionado
   */
  actualizarValidacionesSegunRol(rol: TipoRol) {
    const especialidadControl = this.formularioRegistro.get('especialidad');
    const consultorioControl = this.formularioRegistro.get('consultorio');
    const biografiaControl = this.formularioRegistro.get('biografia');
    const añosControl = this.formularioRegistro.get('añosExperiencia');

    if (rol === 'doctor') {
      especialidadControl?.setValidators([Validators.required]);
      consultorioControl?.setValidators([Validators.required]);
      biografiaControl?.setValidators([Validators.required, Validators.minLength(20)]);
      añosControl?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      especialidadControl?.clearValidators();
      consultorioControl?.clearValidators();
      biografiaControl?.clearValidators();
      añosControl?.clearValidators();
    }

    especialidadControl?.updateValueAndValidity();
    consultorioControl?.updateValueAndValidity();
    biografiaControl?.updateValueAndValidity();
    añosControl?.updateValueAndValidity();
  }

  /**
   * Verificar si es doctor
   */
  get esDoctor(): boolean {
    return this.formularioRegistro.get('rol')?.value === 'doctor';
  }

  /**
   * Alternar visibilidad de contraseña
   */
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Validar que las contraseñas coincidan
   */
  passwordsCoinciden(): boolean {
    const password = this.formularioRegistro.get('password')?.value;
    const confirmar = this.formularioRegistro.get('confirmarPassword')?.value;
    return password === confirmar;
  }

  /**
   * Procesar el registro
   */
  async onSubmit() {
    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      return;
    }

    if (!this.passwordsCoinciden()) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const datos = this.formularioRegistro.value;

    try {
      // 1. Registrar en Firebase Auth
      const resultadoAuth = await this.autenticacionService.registrarUsuario({
        email: datos.email,
        password: datos.password,
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        rol: datos.rol,
        especialidad: datos.rol === 'doctor' ? datos.especialidad : undefined
      });

      if (!resultadoAuth.exito) {
        this.mensajeError = resultadoAuth.mensaje;
        this.cargando = false;
        return;
      }

      // 2. Crear usuario en Firestore
      const resultadoUsuario = await this.usuariosService.crearUsuario(
        resultadoAuth.uid,
        {
          email: datos.email,
          password: datos.password,
          nombre: datos.nombre,
          apellido: datos.apellido,
          telefono: datos.telefono,
          rol: datos.rol,
          especialidad: datos.rol === 'doctor' ? datos.especialidad : undefined
        }
      );

      if (!resultadoUsuario.exito) {
        this.mensajeError = 'Error al crear usuario en base de datos';
        this.cargando = false;
        return;
      }

      // 3. Si es doctor, crear perfil de doctor
      if (datos.rol === 'doctor') {
        await this.doctoresService.crearDoctor({
          uid: resultadoAuth.uid,
          especialidad: datos.especialidad,
          consultorio: datos.consultorio,
          biografia: datos.biografia,
          añosExperiencia: datos.añosExperiencia,
          horarioDisponible: [
            { dia: 'lunes', horaInicio: '09:00', horaFin: '17:00', activo: true },
            { dia: 'martes', horaInicio: '09:00', horaFin: '17:00', activo: true },
            { dia: 'miercoles', horaInicio: '09:00', horaFin: '17:00', activo: true },
            { dia: 'jueves', horaInicio: '09:00', horaFin: '17:00', activo: true },
            { dia: 'viernes', horaInicio: '09:00', horaFin: '17:00', activo: true },
            { dia: 'sabado', horaInicio: '09:00', horaFin: '13:00', activo: false },
            { dia: 'domingo', horaInicio: '09:00', horaFin: '13:00', activo: false }
          ]
        });
      }

      // 4. Éxito - Mostrar mensaje y redirigir
      this.mensajeExito = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
      
      setTimeout(() => {
        this.router.navigate(['/autenticacion/inicio-sesion']);
      }, 2000);

    } catch (error: any) {
      this.mensajeError = 'Error inesperado durante el registro';
      this.cargando = false;
      console.error('Error en registro:', error);
    }
  }

  /**
   * Obtener mensaje de error para un campo
   */
  obtenerMensajeError(campo: string): string {
    const control = this.formularioRegistro.get(campo);
    
    if (!control?.touched) return '';
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (control?.hasError('pattern')) {
      return 'Ingrese un teléfono válido (9 dígitos)';
    }
    
    if (control?.hasError('min')) {
      return 'Debe ser mayor o igual a 0';
    }
    
    return '';
  }
}