import { Routes } from '@angular/router';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion';
import { RegistroComponent } from './registro/registro';

/**
 * Rutas del módulo de Autenticación
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
    title: 'Iniciar Sesión - Sistema de Citas Médicas'
  },
  {
    path: 'registro',
    component: RegistroComponent,
    title: 'Registro - Sistema de Citas Médicas'
  }
];