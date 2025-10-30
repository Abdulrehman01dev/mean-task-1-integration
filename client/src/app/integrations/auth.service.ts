import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1';

  // Global states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any | null>(null);

  loading$ = this.loadingSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();
  user$ = this.userSubject.asObservable();


  connectGithub(): void {
    this.http.get<{ url: string }>(`${this.baseUrl}/auth/github/oauth/url`)
      .pipe(map(res => res.url)).subscribe(url => {
      if (url) {
        window.location.href = url;
      }
    });
  };


  verifyOAuthToken(code: string) {
    // Not used when server redirects; kept for API completeness
    return this.http.get<{ url: string }>(`${this.baseUrl}/auth/github/oauth/callback?code=${encodeURIComponent(code)}`);
  };


  authenticate() {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<{ connected: boolean; user?: any; reason?: string }>(`${this.baseUrl}/auth/authenticate`, { headers });
  }

  initializeOnAppLoad() {
    this.loadingSubject.next(true);
    return this.authenticate().pipe(
      tap(res => {
        if (res?.connected) {
          this.connectedSubject.next(true);
          this.userSubject.next(res.user || null);
          // also keeping simple cache for existing UI usage
          const connectedAt = new Date().toISOString();
          const connectedUser = res.user ? { name: res.user.name, login: res.user.login } : undefined;
          localStorage.setItem('githubIntegration', JSON.stringify({ isConnected: true, connectedAt, connectedUser }));
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
  }

  getToken(): string | null {
    return localStorage.getItem('githubToken');
  }


  getGithubData(collection: string, page = 1, limit = 10, search = '') {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get(`${this.baseUrl}/github/data/${collection}`, {
      headers,
      params: { page, limit, search },
    });
  }
  
  resyncIntegration() {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post(`${this.baseUrl}/github/resync`, {}, { headers });
  }

}
