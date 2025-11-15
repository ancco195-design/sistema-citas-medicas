import { Routes } from '@angular/router';
import { InicioPaciente} from './inicio-paciente/inicio-paciente';
import { ListaDoctores } from './lista-doctores/lista-doctores';
import { AgendarCita } from './agendar-cita/agendar-cita';
import { MisCitas} from './mis-citas/mis-citas';
import { DetalleDoctor} from './detalle-doctor/detalle-doctor';

/**
 * Rutas del módulo de Paciente
 * Todas estas rutas están protegidas por authGuard y rolGuard
 */
export const PACIENTE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: InicioPaciente,
    title: 'Inicio - Paciente'
  },
  {
    path: 'doctores',
    component: ListaDoctores,
    title: 'Buscar Doctores'
  },
  {
    path: 'doctores/:id',
    component: DetalleDoctor,
    title: 'Detalle del Doctor'
  },
  {
    path: 'agendar-cita/:doctorId',
    component: AgendarCita,
    title: 'Agendar Cita'
  },
  {
    path: 'mis-citas',
    component: MisCitas,
    title: 'Mis Citas'
  }
];