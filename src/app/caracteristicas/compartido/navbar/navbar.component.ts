import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { UsuariosService } from '../../../nucleo/servicios/usuarios.service';
import { Usuario } from '../../../nucleo/modelos/usuario.model';
import { Subject, takeUntil, filter } from 'rxjs';

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
export class NavbarComponent implements OnInit, OnDestroy {
  private autenticacionService = inject(AutenticacionService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Cache estático para evitar recargas
  private static usuarioCache: Usuario | null = null;
  private static cacheIniciado = false;

  usuario: Usuario | null = null;
  mostrarMenuUsuario = false;
  mostrarMenuMovil = false;
  enlacesMenu: any[] = [];
  nombreCompleto = 'Usuario';
  rolBadge = '';

  ngOnInit() {
    // Si ya hay datos en cache, usarlos inmediatamente
    if (NavbarComponent.usuarioCache) {
      this.aplicarDatosUsuario(NavbarComponent.usuarioCache);
    } else if (!NavbarComponent.cacheIniciado) {
      // Solo cargar si no se ha iniciado el cache
      this.cargarUsuario();
    }

    // Cerrar menús al navegar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.mostrarMenuUsuario = false;
      this.mostrarMenuMovil = false;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar datos del usuario actual (solo una vez)
   */
  cargarUsuario() {
    NavbarComponent.cacheIniciado = true;
    
    const uid = this.autenticacionService.obtenerUid();
    if (uid) {
      this.usuariosService.obtenerUsuario(uid).then(usuario => {
        if (usuario) {
          NavbarComponent.usuarioCache = usuario;
          this.aplicarDatosUsuario(usuario);
        }
      });
    }
  }

  /**
   * Aplicar datos del usuario al componente
   */
  private aplicarDatosUsuario(usuario: Usuario) {
    this.usuario = usuario;
    this.nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
    this.rolBadge = this.obtenerRolBadge(usuario.rol);
    this.enlacesMenu = this.obtenerEnlacesMenu(usuario.rol);
  }

  /**
   * Obtener iniciales del usuario
   */
  obtenerIniciales(): string {
    if (!this.usuario) return 'U';
    return `${this.usuario.nombre.charAt(0)}${this.usuario.apellido.charAt(0)}`;
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
          { ruta: '/paciente/mis-citas', texto: 'Mis Citas', icono: '📅' },
          { ruta: '/paciente/perfil', texto: 'Mi Perfil', icono: '👤' }
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
          { ruta: '/admin/perfil', texto: 'Mi Perfil', icono: '👤' }
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
   * Navegar al inicio según el rol
   */
  irAlInicio() {
    if (!this.usuario) return;
    
    switch (this.usuario.rol) {
      case 'paciente':
        this.router.navigate(['/paciente/inicio']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor/inicio']);
        break;
      case 'admin':
        this.router.navigate(['/admin/panel']);
        break;
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
    // Limpiar cache al cerrar sesión
    NavbarComponent.usuarioCache = null;
    NavbarComponent.cacheIniciado = false;
    
    const resultado = await this.autenticacionService.cerrarSesion();
    if (resultado.exito) {
      this.router.navigate(['/autenticacion/inicio-sesion']);
    }
  }
}