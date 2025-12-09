import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { Doctor } from '../../../nucleo/modelos/doctor.model';
import { Usuario } from '../../../nucleo/modelos/usuario.model';
import { ESPECIALIDADES_COMUNES } from '../../../nucleo/modelos/especialidad.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-doctores',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './lista-doctores.component.html',
  styleUrl: './lista-doctores.component.css'
})
export class ListaDoctoresComponent implements OnInit, OnDestroy {
  private doctoresService = inject(DoctoresService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  // ← NUEVO: Suscripción para limpiar
  private doctoresSubscription?: Subscription;

  doctores: Doctor[] = [];
  doctoresFiltrados: Doctor[] = [];
  usuariosDoctores: Map<string, Usuario> = new Map();
  especialidades = ESPECIALIDADES_COMUNES;
  
  // Filtros
  filtroEspecialidad = '';
  filtroBusqueda = '';
  
  cargando = true;

  ngOnInit() {
    this.cargarDoctoresRealTime();
  }

  ngOnDestroy() {
    // ← IMPORTANTE: Limpiar suscripción
    if (this.doctoresSubscription) {
      this.doctoresSubscription.unsubscribe();
    }
  }

  // ← NUEVO: Cargar doctores en tiempo real
  cargarDoctoresRealTime() {
    this.doctoresSubscription = this.doctoresService.obtenerTodosDoctoresRealTime()
      .subscribe({
        next: async (doctores) => {
          this.doctores = doctores;
          this.doctoresFiltrados = [...doctores];
          
          // Cargar información de usuarios en paralelo
          await this.cargarUsuariosDoctores();
          
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar doctores:', error);
          this.cargando = false;
        }
      });
  }

  // ← NUEVO: Método para cargar usuarios de los doctores
  async cargarUsuariosDoctores() {
    const promesasUsuarios = this.doctores.map(doctor =>
      this.usuariosService.obtenerUsuario(doctor.uid).then(usuario => {
        if (usuario) {
          this.usuariosDoctores.set(doctor.uid, usuario);
        }
      })
    );

    await Promise.all(promesasUsuarios);
  }

  aplicarFiltros() {
    this.doctoresFiltrados = this.doctores.filter(doctor => {
      const usuario = this.usuariosDoctores.get(doctor.uid);
      
      // Filtro por especialidad
      const cumpleEspecialidad = !this.filtroEspecialidad || 
        doctor.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase());
      
      // Filtro por búsqueda (nombre)
      const cumpleBusqueda = !this.filtroBusqueda || 
        (usuario && 
         `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(this.filtroBusqueda.toLowerCase()));
      
      return cumpleEspecialidad && cumpleBusqueda;
    });
  }

  limpiarFiltros() {
    this.filtroEspecialidad = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  obtenerNombreDoctor(uid: string): string {
    const usuario = this.usuariosDoctores.get(uid);
    if (usuario) {
      return `Dr. ${usuario.nombre} ${usuario.apellido}`;
    }
    return 'Doctor';
  }

  obtenerFotoDoctor(uid: string): string {
    const usuario = this.usuariosDoctores.get(uid);
    return usuario?.foto || '';
  }

  obtenerIniciales(uid: string): string {
    const usuario = this.usuariosDoctores.get(uid);
    if (usuario) {
      return `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`;
    }
    return 'DR';
  }

  verDetalle(doctor: Doctor) {
    this.router.navigate(['/paciente/doctores', doctor.uid]);
  }

  agendarCita(doctor: Doctor) {
    this.router.navigate(['/paciente/agendar-cita', doctor.uid]);
  }

  obtenerIconoEspecialidad(especialidad: string): string {
    const esp = this.especialidades.find(e => 
      e.nombre.toLowerCase() === especialidad.toLowerCase()
    );
    return esp?.icono || '🩺';
  }

  obtenerEstrellas(calificacion?: number): string {
    const cal = calificacion || 0;
    const estrellas = Math.round(cal);
    return '⭐'.repeat(estrellas) + '☆'.repeat(5 - estrellas);
  }
}