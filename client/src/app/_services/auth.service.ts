import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, map, of, tap } from 'rxjs';
import { GITHUB_API_URL } from '../_constants/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Global states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any | null>(null);

  loading$ = this.loadingSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();
  user$ = this.userSubject.asObservable();


  connectGithub(): void {
    this.http.get<{ url: string }>(`${GITHUB_API_URL}/auth/github/oauth/url`)
      .pipe(map(res => res.url)).subscribe(url => {
      if (url) {
        window.location.href = url;
      }
    });
  };


  verifyOAuthToken(code: string) {
    // Not used when server redirects; kept for API completeness
    return this.http.get<{ url: string }>(`${GITHUB_API_URL}/auth/github/oauth/callback?code=${encodeURIComponent(code)}`);
  };


  authenticate() {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<{ connected: boolean; user?: any; reason?: string }>(`${GITHUB_API_URL}/auth/authenticate`, { headers });
  }


  initializeOnAppLoad() {
    this.loadingSubject.next(true);
    return this.authenticate().pipe(
      tap(res => {
        if (res?.connected) {
          this.connectedSubject.next(true);
          this.userSubject.next(res.user || null);
        } else {
          this.connectedSubject.next(false);
          this.userSubject.next(null);
        }
      }),
      catchError(() => {
        this.connectedSubject.next(false);
        this.userSubject.next(null);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }


  setToken(token: string): void {
    localStorage.setItem('githubToken', token);
  };


  getToken(): string | null {
    return localStorage.getItem('githubToken');
  }

}
