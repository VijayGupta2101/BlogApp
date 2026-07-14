import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BackendApi } from './backend-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('newapp');
  api = inject(BackendApi);
  router = inject(Router);

  logout() {
    this.api.setSession(null);
    alert('Logged out successfully! See you soon. ⚡');
    this.router.navigate(['/']);
  }
}
