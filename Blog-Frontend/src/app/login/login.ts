import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BackendApi } from '../backend-api';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  api = inject(BackendApi);
  router = inject(Router);

  username = signal<string>('');
  password = signal<string>('');
  errorMsg = signal<string>('');
  isLoading = signal<boolean>(false);

  login() {
    this.errorMsg.set('');
    const u = this.username().trim();
    const p = this.password().trim();

    if (!u || !p) {
      this.errorMsg.set('Please enter both username/email and password');
      return;
    }

    this.isLoading.set(true);
    this.api.login({ username: u, password: p }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.api.setSession(res);
        alert('Welcome back, ' + res.username + '! ⚡');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        if (err.status === 0) {
          this.errorMsg.set('Backend server is not running or connection refused.');
        } else {
          this.errorMsg.set(err.error?.error || err.error?.message || 'Invalid username/email or password.');
        }
      }
    });
  }
}
