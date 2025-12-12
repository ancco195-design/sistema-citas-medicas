import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { UsuariosService } from '../servicios/usuarios.service';
import { TipoRol } from '../modelos/usuario.model';
import { firstValueFrom } from 'rxjs';

/**
 * Guard de Roles
 * Protege las rutas verificando si el usuario tiene el rol correcto
 * Los roles permitidos se definen en la configuración de la ruta con data: { rolesPermitidos: ['admin', 'doctor'] }
 */
export const rolGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state) => {
  const autenticacionService = inject(AutenticacionService);
  const usuariosService = inject(UsuariosService);
  const router = inject(Router);

  // IMPORTANTE: Esperar a que Firebase cargue el estado de autenticación
  const usuario = await firstValueFrom(autenticacionService.usuarioActual$);

  if (!usuario) {
    // No hay usuario autenticado
    console.log('No hay usuario autenticado. Redirigiendo al login...');
    router.navigate(['/autenticacion/inicio-sesion']);
    return false;
  }

  // Obtener los roles permitidos desde la configuración de la ruta
  const rolesPermitidos = route.data['rolesPermitidos'] as TipoRol[];

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    // No hay restricciones de rol, permitir acceso
    return true;
  }

  try {
    // Obtener el rol del usuario desde Firestore
    const datosUsuario = await usuariosService.obtenerUsuario(usuario.uid);

    if (!datosUsuario) {
      console.log('Usuario no encontrado en la base de datos');
      router.navigate(['/autenticacion/inicio-sesion']);
      return false;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (rolesPermitidos.includes(datosUsuario.rol)) {
      return true;
    } else {
      
      // Redirigir según el rol del usuario
      switch (datosUsuario.rol) {
        case 'paciente':
          router.navigate(['/paciente/inicio']);
          break;
        case 'doctor':
          router.navigate(['/doctor/agenda']);
          break;
        case 'admin':
          router.navigate(['/admin/panel']);
          break;
        default:
          router.navigate(['/']);
          break;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error al verificar el rol del usuario:', error);
    router.navigate(['/autenticacion/inicio-sesion']);
    return false;
  }
};