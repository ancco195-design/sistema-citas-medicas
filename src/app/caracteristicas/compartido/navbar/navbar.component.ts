import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { Usuario } from '../../../nucleo/modelos/usuario.model';

/**
 * Componente Navbar
 * Barra de navegación dinámica según el rol del usuario
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  mostrarMenuUsuario = false;
  mostrarMenuMovil = false;
  enlacesMenu: any[] = [];
  nombreCompleto = 'Usuario';
  rolBadge = '';

  ngOnInit() {
    this.cargarUsuario();
  }

  /**
   * Cargar datos del usuario actual
   */
  cargarUsuario() {
    const uid = this.autenticacionService.obtenerUid();
    if (uid) {
      this.usuariosService.obtenerUsuario(uid).then(usuario => {
        this.usuario = usuario;
        if (usuario) {
          this.nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
          this.rolBadge = this.obtenerRolBadge(usuario.rol);
          this.enlacesMenu = this.obtenerEnlacesMenu(usuario.rol);
        }
      });
    }
  }

  /**
   * Obtener enlaces del menú según el rol
   */
  obtenerEnlacesMenu(rol: string): any[] {
    switch (rol) {
      case 'paciente':
        return [
          { ruta: '/paciente/inicio', texto: 'Inicio', icono: '🏠' },
          { ruta: '/paciente/doctores', texto: 'Buscar Doctores', icono: '🔍' },
          { ruta: '/paciente/mis-citas', texto: 'Mis Citas', icono: '📅' }
        ];
      
      case 'doctor':
        return [
          { ruta : '/doctor/inicio', texto: 'Inicio', icono: '🏠' },
          { ruta: '/doctor/agenda', texto: 'Mi Agenda', icono: '📅' },
          { ruta: '/doctor/perfil', texto: 'Mi Perfil', icono: '👨‍⚕️' }
        ];
      
      case 'admin':
        return [
          { ruta: '/admin/panel', texto: 'Panel', icono: '📊' },
          { ruta: '/admin/doctores', texto: 'Doctores', icono: '👨‍⚕️' },
          { ruta: '/admin/citas', texto: 'Citas', icono: '📅' },
          { ruta: '/admin/estadisticas', texto: 'Estadísticas', icono: '📈' }
        ];
      
      default:
        return [];
    }
  }

  /**
   * Obtener badge del rol
   */
  obtenerRolBadge(rol: string): string {
    switch (rol) {
      case 'paciente':
        return '👤 Paciente';
      case 'doctor':
        return '👨‍⚕️ Doctor';
      case 'admin':
        return '👑 Administrador';
      default:
        return '';
    }
  }

  /**
   * Alternar menú de usuario
   */
  toggleMenuUsuario() {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  /**
   * Alternar menú móvil
   */
  toggleMenuMovil() {
    this.mostrarMenuMovil = !this.mostrarMenuMovil;
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    const resultado = await this.autenticacionService.cerrarSesion();
    if (resultado.exito) {
      this.router.navigate(['/autenticacion/inicio-sesion']);
    }
  }
}