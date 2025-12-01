import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-perfil-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './perfil-doctor.html',
  styleUrls: ['./perfil-doctor.css']
})
export class PerfilDoctor implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private authService = inject(AutenticacionService);

  formPerfil: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    especialidad: ['', Validators.required],
    telefono: ['']
  });

  uidUsuario = '';
  procesando = false;
  nombreMostrar = '';
  especialidadMostrar = '';

  async ngOnInit() {
    this.uidUsuario = this.authService.obtenerUid() || '';
    if (this.uidUsuario) {
      const usuario = await this.usuariosService.obtenerUsuario(this.uidUsuario);
      if (usuario) {
        this.formPerfil.patchValue(usuario);
        this.nombreMostrar = `${usuario.nombre} ${usuario.apellido}`;
        this.especialidadMostrar = usuario.especialidad || 'General';
      }
    }
  }

  async guardar() {
    if (this.formPerfil.invalid) return;
    this.procesando = true;
    try {
      await this.usuariosService.actualizarUsuario(this.uidUsuario, this.formPerfil.value);
      alert('Perfil actualizado correctamente');
      this.nombreMostrar = `${this.formPerfil.value.nombre} ${this.formPerfil.value.apellido}`;
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    } finally {
      this.procesando = false;
    }
  }
}