import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard de Autenticación
 * Protege las rutas verificando si el usuario está autenticado
 * Si no está autenticado, redirige al login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  return autenticacionService.usuarioActual$.pipe(
    take(1),
    map(usuario => {
      if (usuario) {
        // Usuario autenticado, puede continuar
        return true;
      } else {
        // No autenticado, redirigir al login
        router.navigate(['/autenticacion/inicio-sesion']);
        return false;
      }
    })
  );
};