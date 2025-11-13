import { Routes } from '@angular/router';

/**
 * Rutas del módulo de Paciente
 * TODO: Agregar componentes cuando estén creados
 */
export const PACIENTE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    // TODO: Agregar componente de inicio del paciente
    loadChildren: () => import('./paciente.routes').then(m => m.PACIENTE_ROUTES)
  }
];