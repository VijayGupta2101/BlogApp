import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackendApi } from '../backend-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-page.html',
  styleUrl: './create-page.css',
})
export class CreatePage implements OnInit {
  api = inject(BackendApi);
  router = inject(Router);

  title = signal<string>('');
  content = signal<string>('');

  errorMsg = signal<string>('');
  isSubmitting = signal<boolean>(false);

  ngOnInit() {
    if (!this.api.isAuthenticated()) {
      alert('You must be logged in to create a blog post! 🔒');
      this.router.navigate(['/login']);
    }
  }

  addPost() {
    this.errorMsg.set('');
    const cleanTitle = this.title().trim();
    const cleanContent = this.content().trim();

    if (!cleanTitle || !cleanContent) {
      this.errorMsg.set('Both title and content are required to publish your proof of work!');
      return;
    }

    this.isSubmitting.set(true);
    const payload = {
      title: cleanTitle,
      content: cleanContent
    };

    this.api.addBlog(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        alert('Proof of Work added successfully!');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error adding post:', error);
        this.errorMsg.set(error.error?.error || 'Failed to publish. Check if the backend server is running.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
