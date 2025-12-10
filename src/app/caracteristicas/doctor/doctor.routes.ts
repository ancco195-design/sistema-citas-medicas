import { Routes } from '@angular/router';
import { InicioDoctor } from './inicio-doctor/inicio-doctor';
import { AgendaDoctor } from './agenda-doctor/agenda-doctor';
import { ListaPacientes } from './lista-pacientes/lista-pacientes';
import { PerfilDoctor } from './perfil-doctor/perfil-doctor';
import { DetalleCita } from './detalle-cita/detalle-cita';  

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      // 1. Inicio / Dashboard (Resumen del día)
      { 
        path: 'inicio', 
        loadComponent: () => import('./inicio-doctor/inicio-doctor')
          .then(m => m.InicioDoctor),
        title: 'Panel Médico'
      },
      // 2. Agenda (La que ya tenías o similar)
      { 
        path: 'agenda', 
        loadComponent: () => import('./agenda-doctor/agenda-doctor')
          .then(m => m.AgendaDoctor),
        title: 'Mi Agenda'
      },
      // 3. Lista de Pacientes (Historial) ← ESTA ES LA QUE FALTABA
      { 
        path: 'pacientes', 
        loadComponent: () => import('./lista-pacientes/lista-pacientes')
          .then(m => m.ListaPacientes),
        title: 'Mis Pacientes'
      },
      // 3.1. Detalle de Paciente (Historial de citas)
      { 
        path: 'paciente/:id', 
        loadComponent: () => import('./detalle-paciente/detalle-paciente')
          .then(m => m.DetallePaciente),
        title: 'Historial del Paciente'
      },
      // 4. Perfil del Doctor
      { 
        path: 'perfil', 
        loadComponent: () => import('./perfil-doctor/perfil-doctor')
          .then(m => m.PerfilDoctor),
        title: 'Mi Perfil Profesional'
      },
      // 5. Detalle de Cita (Con parámetro ID)
      { 
        path: 'cita/:id', 
        loadComponent: () => import('./detalle-cita/detalle-cita')
          .then(m => m.DetalleCita),
        title: 'Detalle de Consulta'
      },
      // Redirección por defecto
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  }
];