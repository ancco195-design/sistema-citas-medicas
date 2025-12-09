import { Routes } from '@angular/router';

/**
 * Rutas del módulo de Admin
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  },
  {
    path: 'panel',
    loadComponent: () => import('./panel-estadisticas/panel-estadisticas').then(m => m.PanelEstadisticasComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil-admin/perfil-admin').then(m => m.PerfilAdmin)
  }
];