import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly STORAGE_KEY = 'portal_admin_token';

  async login(password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ ok: boolean; token: string }>('/api/login', { password })
      );
      if (res.ok && res.token) {
        sessionStorage.setItem(this.STORAGE_KEY, res.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}