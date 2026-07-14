import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BackendApi } from '../backend-api';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupPage {
  api = inject(BackendApi);
  router = inject(Router);

  username = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  errorMsg = signal<string>('');
  isLoading = signal<boolean>(false);

  signup() {
    this.errorMsg.set('');
    const u = this.username().trim();
    const e = this.email().trim();
    const p = this.password().trim();

    if (!u || !e || !p) {
      this.errorMsg.set('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(e)) {
      this.errorMsg.set('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);
    this.api.signup({ username: u, email: e, password: p }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.api.setSession(res);
        alert('Welcome, ' + res.username + '! Your account is ready! ⚡');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Signup error:', err);
        if (err.status === 0) {
          this.errorMsg.set('Backend server is not running or connection refused.');
        } else {
          this.errorMsg.set(err.error?.error || err.error?.message || 'Username or email already exists.');
        }
      }
    });
  }
}
