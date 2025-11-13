import { Routes } from '@angular/router';

/**
 * Rutas del módulo de Admin
 * TODO: Agregar componentes cuando estén creados
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  },
  {
    path: 'panel',
    // TODO: Agregar componente de panel del administrador
    loadChildren: () => import('./admin.routes').then(m => m.ADMIN_ROUTES)
  }
];  