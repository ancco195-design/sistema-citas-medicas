import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, take } from 'rxjs/operators';

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
    // Solo escuchar la PRIMERA navegación exitosa (carga inicial)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      take(1) // Solo toma el primer evento y se desuscribe
    ).subscribe(() => {
      // Ocultar loader después de la primera navegación completa
      setTimeout(() => {
        this.cargando.set(false);
      }, 300);
    });
  }
}