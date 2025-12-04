import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctoresService } from '../../../nucleo/servicios/doctores.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { NavbarComponent } from '../../compartido/navbar/navbar.component';
import { Doctor } from '../../../nucleo/modelos/doctor.model';
import { Usuario } from '../../../nucleo/modelos/usuario.model';
import { ESPECIALIDADES_COMUNES } from '../../../nucleo/modelos/especialidad.model';

/**
 * Componente Lista de Doctores
 * Muestra todos los doctores disponibles con filtros
 */
@Component({
  selector: 'app-lista-doctores',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './lista-doctores.component.html',
  styleUrl: './lista-doctores.component.css'
})
export class ListaDoctoresComponent implements OnInit {
  private doctoresService = inject(DoctoresService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  doctores: Doctor[] = [];
  doctoresFiltrados: Doctor[] = [];
  usuariosDoctores: Map<string, Usuario> = new Map();
  especialidades = ESPECIALIDADES_COMUNES;
  
  // Filtros
  filtroEspecialidad = '';
  filtroBusqueda = '';
  
  cargando = true; // ✅ CAMBIADO A TRUE

  ngOnInit() {
    this.cargarDoctores();
  }

  /**
   * Cargar todos los doctores
   */
  async cargarDoctores() {
    this.cargando = true;

    try {
      // Cargar doctores desde Firestore
      this.doctores = await this.doctoresService.obtenerTodosDoctores();
      this.doctoresFiltrados = [...this.doctores];

      // Cargar información de usuarios en paralelo
      const promesasUsuarios = this.doctores.map(doctor =>
        this.usuariosService.obtenerUsuario(doctor.uid).then(usuario => {
          if (usuario) {
            this.usuariosDoctores.set(doctor.uid, usuario);
          }
        })
      );

      await Promise.all(promesasUsuarios);

    } catch (error) {
      console.error('Error al cargar doctores:', error);
    } finally {
      this.cargando = false; // ✅ Ocultar loader cuando termine
    }
  }

  /**
   * Aplicar filtros
   */
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

  /**
   * Limpiar filtros
   */
  limpiarFiltros() {
    this.filtroEspecialidad = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  /**
   * Obtener nombre completo del doctor
   */
  obtenerNombreDoctor(uid: string): string {
    const usuario = this.usuariosDoctores.get(uid);
    if (usuario) {
      return `Dr. ${usuario.nombre} ${usuario.apellido}`;
    }
    return 'Doctor';
  }

  /**
   * Obtener foto del doctor
   */
  obtenerFotoDoctor(uid: string): string {
    const usuario = this.usuariosDoctores.get(uid);
    return usuario?.foto || '';
  }

  /**
   * Obtener iniciales del doctor
   */
  obtenerIniciales(uid: string): string {
    const usuario = this.usuariosDoctores.get(uid);
    if (usuario) {
      return `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`;
    }
    return 'DR';
  }

  /**
   * Navegar a detalle del doctor
   */
  verDetalle(doctor: Doctor) {
    this.router.navigate(['/paciente/doctores', doctor.uid]);
  }

  /**
   * Navegar a agendar cita
   */
  agendarCita(doctor: Doctor) {
    this.router.navigate(['/paciente/agendar-cita', doctor.uid]);
  }

  /**
   * Obtener ícono de especialidad
   */
  obtenerIconoEspecialidad(especialidad: string): string {
    const esp = this.especialidades.find(e => 
      e.nombre.toLowerCase() === especialidad.toLowerCase()
    );
    return esp?.icono || '🩺';
  }

  /**
   * Obtener estrellas de calificación
   */
  obtenerEstrellas(calificacion?: number): string {
    const cal = calificacion || 0;
    const estrellas = Math.round(cal);
    return '⭐'.repeat(estrellas) + '☆'.repeat(5 - estrellas);
  }
}