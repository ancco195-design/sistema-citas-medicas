import { Routes } from '@angular/router';

/**
 * Rutas del módulo de Doctor
 * TODO: Agregar componentes cuando estén creados
 */
export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'agenda',
    pathMatch: 'full'
  },
  {
    path: 'agenda',
    // TODO: Agregar componente de agenda del doctor
    loadChildren: () => import('./doctor.routes').then(m => m.DOCTOR_ROUTES)
  }
];