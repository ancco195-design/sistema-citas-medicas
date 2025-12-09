import { Routes } from '@angular/router';
import { InicioPacienteComponent} from './inicio-paciente/inicio-paciente.component';
import { ListaDoctoresComponent } from './lista-doctores/lista-doctores.component';
import { AgendarCitaComponent } from './agendar-cita/agendar-cita.component';
import { MisCitasComponent} from './mis-citas/mis-citas.component';      
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
    component: InicioPacienteComponent,
    title: 'Inicio - Paciente'
  },
  {
    path: 'doctores',
    component: ListaDoctoresComponent,
    title: 'Buscar Doctores'
  },
  {
    path: 'doctores/:id',
    component: DetalleDoctor,
    title: 'Detalle del Doctor'
  },
  {
    path: 'agendar-cita/:doctorId',
    component: AgendarCitaComponent,
    title: 'Agendar Cita'
  },
  {
    path: 'mis-citas',
    component: MisCitasComponent,
    title: 'Mis Citas'
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil-paciente/perfil-paciente').then(m => m.PerfilPaciente),
    title: 'Mi Perfil'
  }
];