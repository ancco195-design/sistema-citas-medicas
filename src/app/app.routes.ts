import { Routes } from '@angular/router';
import { authGuard } from './nucleo/guardias/auth-guard';
import { rolGuard } from './nucleo/guardias/rol-guard';

/**
 * Rutas principales de la aplicación
 */
export const routes: Routes = [
  // Ruta por defecto - redirige a autenticación
  {
    path: '',
    redirectTo: 'autenticacion',
    pathMatch: 'full'
  },

  // Módulo de Autenticación (Login y Registro) - SIN protección
  {
    path: 'autenticacion',
    loadChildren: () => import('./caracteristicas/autenticacion/autenticacion.routes')
      .then(m => m.AUTENTICACION_ROUTES),
    title: 'Autenticación'
  },

  // Módulo de Paciente - Protegido por authGuard y rolGuard
  {
    path: 'paciente',
    canActivate: [authGuard, rolGuard],
    data: { rolesPermitidos: ['paciente'] },
    loadChildren: () => import('./caracteristicas/paciente/paciente.routes')
      .then(m => m.PACIENTE_ROUTES),
    title: 'Panel de Paciente'
  },

  // Módulo de Doctor - Protegido por authGuard y rolGuard
  {
    path: 'doctor',
    canActivate: [authGuard, rolGuard],
    data: { rolesPermitidos: ['doctor'] },
    loadChildren: () => import('./caracteristicas/doctor/doctor.routes')
      .then(m => m.DOCTOR_ROUTES),
    title: 'Panel de Doctor'
  },

  // Módulo de Admin - Protegido por authGuard y rolGuard
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard],
    data: { rolesPermitidos: ['admin'] },
    loadChildren: () => import('./caracteristicas/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES),
    title: 'Panel de Administrador'
  },

  // Ruta 404 - Página no encontrada
  {
    path: '**',
    redirectTo: 'autenticacion'
  }
];   