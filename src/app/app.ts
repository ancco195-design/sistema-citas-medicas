import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sistema-citas-medicas');
  protected cargando = signal(true);
  
  private router = inject(Router);

  constructor() {
    // Escuchar eventos de navegación del router
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Cuando empieza la navegación, mostrar loader
        this.cargando.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Cuando termina la navegación (exitosa o con error), ocultar loader
        setTimeout(() => {
          this.cargando.set(false);
        }, 300);
      }
    });
  }
}