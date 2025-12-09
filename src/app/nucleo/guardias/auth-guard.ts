import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { map, take, filter } from 'rxjs/operators';

/**
 * Guard de Autenticación
 * Protege las rutas verificando si el usuario está autenticado
 * Si no está autenticado, redirige al login
 * 
 * CORREGIDO: Ahora espera a que Firebase cargue el estado de autenticación
 * antes de tomar decisiones
 */
export const authGuard: CanActivateFn = (route, state) => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  return autenticacionService.obtenerEstadoAutenticacionCargado().pipe(
    take(1),
    map(usuario => {
      if (usuario) {
        // Usuario autenticado, puede continuar
        console.log('✅ Auth Guard: Usuario autenticado', usuario.uid);
        return true;
      } else {
        // No autenticado, redirigir al login
        console.log('❌ Auth Guard: Usuario no autenticado, redirigiendo al login');
        router.navigate(['/autenticacion/inicio-sesion'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};