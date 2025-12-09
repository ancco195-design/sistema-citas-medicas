import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { UsuariosService } from '../servicios/usuarios.service';
import { map, take } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

/**
 * Guard para páginas de autenticación (Login/Registro)
 * Si el usuario YA está autenticado, lo redirige a su panel correspondiente
 * Esto previene que usuarios autenticados accedan al login/registro
 */
export const noAuthGuard: CanActivateFn = async (route, state) => {
  const autenticacionService = inject(AutenticacionService);
  const usuariosService = inject(UsuariosService);
  const router = inject(Router);

  try {
    // Esperar a que Firebase cargue el estado de autenticación
    const usuario = await firstValueFrom(
      autenticacionService.obtenerEstadoAutenticacionCargado()
    );

    if (usuario) {
      // Usuario YA autenticado - obtener su rol y redirigir
      console.log('🔒 No-Auth Guard: Usuario ya autenticado, redirigiendo a su panel...');
      
      const datosUsuario = await usuariosService.obtenerUsuario(usuario.uid);
      
      if (datosUsuario) {
        // Redirigir según el rol
        switch (datosUsuario.rol) {
          case 'paciente':
            console.log('👤 Redirigiendo a panel de paciente');
            router.navigate(['/paciente/inicio']);
            break;
          case 'doctor':
            console.log('👨‍⚕️ Redirigiendo a panel de doctor');
            router.navigate(['/doctor/agenda']);
            break;
          case 'admin':
            console.log('🔧 Redirigiendo a panel de admin');
            router.navigate(['/admin/panel']);
            break;
          default:
            router.navigate(['/']);
            break;
        }
        return false; // Bloquear acceso al login/registro
      }
    }

    // No hay usuario autenticado, permitir acceso al login/registro
    console.log('✅ No-Auth Guard: Sin usuario autenticado, permitiendo acceso a login/registro');
    return true;

  } catch (error) {
    console.error('❌ Error en No-Auth Guard:', error);
    // En caso de error, permitir acceso al login
    return true;
  }
};