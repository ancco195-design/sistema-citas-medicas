import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-404',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagina-404.html',
  styleUrl: './pagina-404.css'
})
export class Pagina404Component {
  constructor(private router: Router) {}

  irAlInicio() {
    this.router.navigate(['/']);
  }

  volver() {
    window.history.back();
  }
}