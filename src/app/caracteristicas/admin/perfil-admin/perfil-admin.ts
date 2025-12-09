import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { Usuario } from '../../../nucleo/modelos/usuario.model';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './perfil-admin.html',
  styleUrl: './perfil-admin.css'
})
export class PerfilAdmin implements OnInit {
  private fb = inject(FormBuilder);
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);

  usuario: Usuario | null = null;
  formularioPerfil: FormGroup;
  cargando = true;
  guardando = false;
  modoEdicion = false;
  mensajeExito = '';
  mensajeError = '';

  constructor() {
    this.formularioPerfil = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]]
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    const uid = this.autenticacionService.obtenerUid();
    
    if (uid) {
      this.usuario = await this.usuariosService.obtenerUsuario(uid);
      
      if (this.usuario) {
        this.formularioPerfil.patchValue({
          nombre: this.usuario.nombre,
          apellido: this.usuario.apellido,
          telefono: this.usuario.telefono
        });
        
        // Deshabilitar el formulario inicialmente
        this.formularioPerfil.disable();
      }
    }
    
    this.cargando = false;
  }

  activarEdicion() {
    this.modoEdicion = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.formularioPerfil.enable();
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.mensajeExito = '';
    this.mensajeError = '';
    
    // Restaurar valores originales
    if (this.usuario) {
      this.formularioPerfil.patchValue({
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        telefono: this.usuario.telefono
      });
    }
    
    // Deshabilitar el formulario
    this.formularioPerfil.disable();
  }

  async guardarCambios() {
    if (this.formularioPerfil.invalid) {
      this.formularioPerfil.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const uid = this.autenticacionService.obtenerUid();
    
    if (uid) {
      const datos = this.formularioPerfil.value;
      
      try {
        const resultado = await this.usuariosService.actualizarUsuario(uid, datos);

        if (resultado.exito) {
          this.mensajeExito = 'Perfil actualizado exitosamente';
          this.modoEdicion = false;
          await this.cargarDatos();
          
          setTimeout(() => {
            this.mensajeExito = '';
          }, 3000);
        } else {
          this.mensajeError = 'Error al actualizar el perfil';
        }
      } catch (error) {
        this.mensajeError = 'Error inesperado al guardar';
        console.error(error);
      }
    }
    
    this.guardando = false;
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'No disponible';
    
    try {
      let fechaObj: Date;
      
      if (fecha instanceof Date) {
        fechaObj = fecha;
      } else if (fecha.seconds) {
        fechaObj = new Date(fecha.seconds * 1000);
      } else {
        fechaObj = new Date(fecha);
      }
      
      return fechaObj.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'No disponible';
    }
  }

  obtenerMensajeError(campo: string): string {
    const control = this.formularioPerfil.get(campo);
    
    if (!control?.touched) return '';
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (control?.hasError('pattern')) {
      return 'Ingrese un teléfono válido (9 dígitos)';
    }
    
    return '';
  }
}