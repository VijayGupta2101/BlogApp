import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';

export interface BlogType {
    id: number;
    title: string;
    content: string;
    author: string;
    created_at: string;
}

export interface UserType {
    username: string;
    email: string;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class BackendApi {
    http = inject(HttpClient);
    currentUser = signal<UserType | null>(null);
    isAuthenticated = computed(() => this.currentUser() !== null);

    constructor() {
        const saved = localStorage.getItem('writenest_session');
        if (saved) {
            try {
                this.currentUser.set(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading session from localStorage:', e);
            }
        }
    }

    private getHeaders() {
        const user = this.currentUser();
        if (user && user.token) {
            return {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            };
        }
        return {};
    }

    signup(payload: any) {
        return this.http.post<UserType>("http://localhost:3000/signup", payload);
    }

    login(payload: any) {
        return this.http.post<UserType>("http://localhost:3000/login", payload);
    }

    setSession(user: UserType | null) {
        this.currentUser.set(user);
        if (user) {
            localStorage.setItem('writenest_session', JSON.stringify(user));
        } else {
            localStorage.removeItem('writenest_session');
        }
    }

    getBlogs() {
        return this.http.get<BlogType[]>("http://localhost:3000/posts");
    }

    getBlogById(id: any) {
        return this.http.get<BlogType>(`http://localhost:3000/posts/${id}`);
    }

    addBlog(payload: any) {
        return this.http.post("http://localhost:3000/posts", payload, this.getHeaders());
    }

    delete(payload: any) {
        return this.http.delete(`http://localhost:3000/posts/${payload}`, this.getHeaders());
    }

    update(id: any, payload: any) {
        return this.http.put(`http://localhost:3000/posts/${id}`, payload, this.getHeaders());
    }
}

