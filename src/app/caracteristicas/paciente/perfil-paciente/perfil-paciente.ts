import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { Usuario } from '../../../nucleo/modelos/usuario.model';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './perfil-paciente.html',
  styleUrl: './perfil-paciente.css'
})
export class PerfilPaciente implements OnInit {
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

  // Variables para foto
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  subiendoFoto = false;
  mostrarModalEliminar = false; // ← NUEVO

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
        
        // Cargar foto si existe
        if (this.usuario.foto) {
          this.fotoPreview = this.usuario.foto;
        }
        
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
      
      // Restaurar foto
      this.fotoPreview = this.usuario.foto || null;
      this.fotoSeleccionada = null;
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

  // ==================== MÉTODOS PARA FOTO ====================

  /**
   * Manejar selección de archivo
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar archivo
    const validacion = this.validarImagen(file);
    if (!validacion.valido) {
      this.mensajeError = validacion.mensaje;
      setTimeout(() => this.mensajeError = '', 3000);
      return;
    }

    this.fotoSeleccionada = file;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Subir foto de perfil
   */
  async subirFoto() {
    if (!this.fotoSeleccionada) {
      this.mensajeError = 'Por favor selecciona una imagen';
      return;
    }

    this.subiendoFoto = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const uid = this.autenticacionService.obtenerUid();
    if (!uid) return;

    try {
      // Comprimir y convertir a Base64
      const base64 = await this.comprimirImagen(this.fotoSeleccionada);
      
      // Guardar en Firestore
      const resultado = await this.usuariosService.actualizarUsuario(uid, {
        foto: base64
      });

      if (resultado.exito) {
        this.mensajeExito = '¡Foto actualizada exitosamente!';
        await this.cargarDatos();
        this.fotoSeleccionada = null;
        
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      } else {
        this.mensajeError = 'Error al guardar la foto';
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      this.mensajeError = 'Error al procesar la imagen';
    }

    this.subiendoFoto = false;
  }

  /**
   * Eliminar foto de perfil
   */
  async eliminarFoto() {
    // ← CAMBIADO: Ahora solo abre el modal
    this.mostrarModalEliminar = true;
  }

  /**
   * ← NUEVO: Confirmar eliminación
   */
  async confirmarEliminarFoto() {
    this.mostrarModalEliminar = false;
    this.subiendoFoto = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const uid = this.autenticacionService.obtenerUid();
    if (!uid) return;

    try {
      // Usar deleteField de Firestore o simplemente no enviar el campo
      const resultado = await this.usuariosService.actualizarUsuario(uid, {
        foto: '' // Enviamos string vacío en lugar de null
      });

      if (resultado.exito) {
        this.mensajeExito = 'Foto eliminada exitosamente';
        this.fotoPreview = null;
        this.fotoSeleccionada = null;
        await this.cargarDatos();
        
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      }
    } catch (error) {
      this.mensajeError = 'Error al eliminar la foto';
    }

    this.subiendoFoto = false;
  }

  /**
   * ← NUEVO: Cancelar eliminación
   */
  cancelarEliminarFoto() {
    this.mostrarModalEliminar = false;
  }

  /**
   * Validar imagen
   */
  private validarImagen(file: File): { valido: boolean; mensaje: string } {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      return {
        valido: false,
        mensaje: 'Solo se permiten imágenes JPG, PNG o WEBP'
      };
    }

    const tamañoMaximo = 2 * 1024 * 1024; // 2MB
    if (file.size > tamañoMaximo) {
      return {
        valido: false,
        mensaje: 'La imagen no debe superar los 2MB'
      };
    }

    return { valido: true, mensaje: 'Imagen válida' };
  }

  /**
   * Comprimir imagen a Base64
   */
  private async comprimirImagen(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==================== FIN MÉTODOS PARA FOTO ====================

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