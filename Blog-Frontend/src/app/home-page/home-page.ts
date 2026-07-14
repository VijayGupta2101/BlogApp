import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { BackendApi, BlogType } from '../backend-api';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  posts = signal<BlogType[]>([]);
  searchText = signal<string>('');
  activeFaqIndex = signal<number | null>(null);

  // Like counters (stored locally in memory/localStorage to persist between refreshes)
  likesMap = signal<{ [key: number]: number }>({});

  api = inject(BackendApi);
  currentUser = this.api.currentUser;
  isAuthenticated = this.api.isAuthenticated;

  // Computed signal to filter posts based on search input
  filteredPosts = computed(() => {
    const text = this.searchText().toLowerCase().trim();
    if (!text) {
      return this.posts();
    }
    return this.posts().filter(post =>
      post.title.toLowerCase().includes(text) ||
      post.content.toLowerCase().includes(text)
    );
  });

  ngOnInit() {
    this.loadBlogs();
    this.loadLikes();
  }

  loadBlogs() {
    this.api.getBlogs().subscribe({
      next: (res) => {
        this.posts.set(res);
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
      }
    });
  }

  deleteBlog(id: number, event: Event) {
    event.stopPropagation(); // prevent card click

    if (confirm('Are you sure you want to delete this proof of work?')) {
      this.api.delete(id).subscribe({
        next: (res) => {
          alert('Proof of Work deleted successfully!');
          this.loadBlogs();
        },
        error: (error) => {
          console.error('Error deleting blog:', error);
          alert(error.error?.error || 'Could not delete post. Ensure backend is running.');
        }
      });
    }
  }

  likePost(id: number, event: Event) {
    event.stopPropagation();
    const currentLikes = this.likesMap();
    const newLikesCount = (currentLikes[id] || 0) + 1;

    this.likesMap.set({
      ...currentLikes,
      [id]: newLikesCount
    });

    localStorage.setItem('writenest_likes', JSON.stringify(this.likesMap()));
  }

  loadLikes() {
    const saved = localStorage.getItem('writenest_likes');
    if (saved) {
      try {
        this.likesMap.set(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing likes:', e);
      }
    }
  }

  toggleFaq(index: number) {
    if (this.activeFaqIndex() === index) {
      this.activeFaqIndex.set(null);
    } else {
      this.activeFaqIndex.set(index);
    }
  }

  // Generates reading time based on content word count
  getReadingTime(content: string): string {
    const words = content ? content.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200); // 200 wpm
    return `${minutes} min read`;
  }

  // Helper tags for styling blogs dynamically
  getCategoryTag(id: number): { text: string; class: string } {
    const tags = [
      { text: 'Frontend', class: 'bg-info text-dark border-dark' },
      { text: 'Backend', class: 'bg-primary text-white border-dark' },
      { text: 'Web3 / Proof', class: 'bg-warning text-dark border-dark' },
      { text: 'Design', class: 'bg-danger text-white border-dark' },
      { text: 'Career', class: 'bg-success text-dark border-dark' }
    ];
    return tags[id % tags.length];
  }
}
