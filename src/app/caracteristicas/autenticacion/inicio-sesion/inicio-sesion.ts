import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';

/**
 * Componente de Inicio de Sesión
 * Permite a los usuarios autenticarse en el sistema
 * 
 * ACTUALIZADO: Ahora verifica en ngOnInit si ya hay un usuario autenticado
 */
@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css'
})
export class InicioSesionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  formularioLogin: FormGroup;
  cargando = false;
  mensajeError = '';
  mostrarPassword = false;

  constructor() {
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Verificar si ya hay un usuario autenticado al cargar el componente
   */
  async ngOnInit() {
    // Verificación adicional por si el guard no funcionó
    const usuario = this.autenticacionService.obtenerUsuarioActual();
    
    if (usuario) {
      console.log('⚠️ Usuario ya autenticado detectado en Login, redirigiendo...');
      const datosUsuario = await this.usuariosService.obtenerUsuario(usuario.uid);
      
      if (datosUsuario) {
        this.redirigirSegunRol(datosUsuario.rol);
      }
    }
  }

  /**
   * Obtener el control de un campo del formulario
   */
  get email() {
    return this.formularioLogin.get('email');
  }

  get password() {
    return this.formularioLogin.get('password');
  }

  /**
   * Alternar visibilidad de la contraseña
   */
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Procesar el inicio de sesión
   */
  async onSubmit() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const { email, password } = this.formularioLogin.value;

    try {
      // Intentar iniciar sesión
      const resultado = await this.autenticacionService.iniciarSesion({
        email,
        password
      });

      if (resultado.exito) {
        // Obtener el usuario para saber su rol
        const usuario = await this.usuariosService.obtenerUsuario(resultado.uid);

        if (usuario) {
          // Redirigir según el rol
          this.redirigirSegunRol(usuario.rol);
        } else {
          this.mensajeError = 'Error al obtener datos del usuario';
          this.cargando = false;
        }
      } else {
        this.mensajeError = resultado.mensaje;
        this.cargando = false;
      }
    } catch (error: any) {
      this.mensajeError = 'Error inesperado al iniciar sesión';
      this.cargando = false;
      console.error('Error en login:', error);
    }
  }

  /**
   * Redirigir al usuario según su rol
   */
  private redirigirSegunRol(rol: string) {
    switch (rol) {
      case 'paciente':
        this.router.navigate(['/paciente/inicio']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor/agenda']);
        break;
      case 'admin':
        this.router.navigate(['/admin/panel']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  /**
   * Obtener mensaje de error para un campo
   */
  obtenerMensajeError(campo: string): string {
    const control = this.formularioLogin.get(campo);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return '';
  }
}