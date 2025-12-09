import { Routes } from '@angular/router';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion';
import { RegistroComponent } from './registro/registro';
import { noAuthGuard } from '../../nucleo/guardias';

/**
 * Rutas del módulo de Autenticación
 * Protegidas con noAuthGuard para redirigir usuarios ya autenticados
 */
export const AUTENTICACION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'inicio-sesion',
    pathMatch: 'full'
  },
  {
    path: 'inicio-sesion',
    component: InicioSesionComponent,
    canActivate: [noAuthGuard],  // ← NUEVO: Previene acceso si ya está autenticado
    title: 'Iniciar Sesión - Sistema de Citas Médicas'
  },
  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [noAuthGuard],  // ← NUEVO: Previene acceso si ya está autenticado
    title: 'Registro - Sistema de Citas Médicas'
  }
];