import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendApi } from '../backend-api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './update-page.html',
  styleUrl: './update-page.css',
})
export class UpdatePage implements OnInit {
  api = inject(BackendApi);
  route = inject(ActivatedRoute);
  router = inject(Router);

  id: number | null = null;

  // Exposing reactive signals for state tracking
  title = signal<string>('');
  content = signal<string>('');
  errorMsg = signal<string>('');
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params) => {
        const paramId = params.get('id');
        if (paramId) {
          this.id = Number(paramId);
          this.loadPost(this.id);
        } else {
          this.errorMsg.set('No post ID provided in route parameters.');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Route parameter subscription error:', err);
        this.errorMsg.set('Failed to read route parameters.');
        this.isLoading.set(false);
      }
    });
  }

  loadPost(id: number) {
    this.api.getBlogById(id).subscribe({
      next: (res) => {
        if (res.author && (!this.api.isAuthenticated() || this.api.currentUser()?.username !== res.author)) {
          alert('You are not authorized to update this blog post! 🔒');
          this.router.navigate(['/']);
          return;
        }
        this.title.set(res.title);
        this.content.set(res.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading blog details:', err);
        this.errorMsg.set('Could not load the blog details. Verify the backend connection.');
        this.isLoading.set(false);
      }
    });
  }

  updatePost() {
    this.errorMsg.set('');
    const cleanTitle = this.title().trim();
    const cleanContent = this.content().trim();

    if (!cleanTitle || !cleanContent) {
      this.errorMsg.set('Both title and content are required to save changes!');
      return;
    }

    if (this.id === null) {
      this.errorMsg.set('Invalid post ID.');
      return;
    }

    this.isSubmitting.set(true);
    const payload = {
      title: cleanTitle,
      content: cleanContent
    };

    this.api.update(this.id, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        alert('Proof of Work updated successfully!');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating post:', error);
        this.errorMsg.set('Failed to save changes. Make sure the backend server is running.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
