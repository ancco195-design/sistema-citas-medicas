import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  formularioPassword: FormGroup;
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  mostrarPasswordConfirmar = false;
  
  cambiandoPassword = false;
  mensajeExitoPassword = '';
  mensajeErrorPassword = '';

  mostrarModalEliminar = false;
  eliminandoCuenta = false;

  mostrarAyuda = false;

  constructor() {
    this.formularioPassword = this.fb.group({
      passwordActual: ['', [Validators.required, Validators.minLength(6)]],
      passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmar: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  // === CAMBIAR CONTRASEÑA ===
  
  togglePasswordActual() {
    this.mostrarPasswordActual = !this.mostrarPasswordActual;
  }

  togglePasswordNueva() {
    this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
  }

  togglePasswordConfirmar() {
    this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
  }

  passwordsCoinciden(): boolean {
    const nueva = this.formularioPassword.get('passwordNueva')?.value;
    const confirmar = this.formularioPassword.get('passwordConfirmar')?.value;
    return nueva === confirmar;
  }

  async cambiarPassword() {
    if (this.formularioPassword.invalid) {
      this.formularioPassword.markAllAsTouched();
      return;
    }

    if (!this.passwordsCoinciden()) {
      this.mensajeErrorPassword = 'Las contraseñas no coinciden';
      return;
    }

    this.cambiandoPassword = true;
    this.mensajeExitoPassword = '';
    this.mensajeErrorPassword = '';

    // TODO: Implementar cambio de contraseña con Firebase
    // Por ahora solo simulo
    setTimeout(() => {
      this.mensajeExitoPassword = 'Contraseña actualizada exitosamente';
      this.formularioPassword.reset();
      this.cambiandoPassword = false;

      setTimeout(() => {
        this.mensajeExitoPassword = '';
      }, 3000);
    }, 1000);
  }

  obtenerMensajeErrorPassword(campo: string): string {
    const control = this.formularioPassword.get(campo);
    
    if (!control?.touched) return '';
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    
    return '';
  }

  // === ELIMINAR CUENTA ===

  abrirModalEliminar() {
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
  }

  async confirmarEliminarCuenta() {
    this.eliminandoCuenta = true;
    
    const uid = this.autenticacionService.obtenerUid();
    
    if (uid) {
      const resultado = await this.usuariosService.eliminarUsuario(uid);
      
      if (resultado.exito) {
        alert('Cuenta desactivada exitosamente');
        await this.autenticacionService.cerrarSesion();
        this.router.navigate(['/autenticacion/inicio-sesion']);
      } else {
        alert('Error al desactivar la cuenta');
        this.eliminandoCuenta = false;
        this.cerrarModalEliminar();
      }
    }
  }

  // === AYUDA ===

  toggleAyuda() {
    this.mostrarAyuda = !this.mostrarAyuda;
  }
}