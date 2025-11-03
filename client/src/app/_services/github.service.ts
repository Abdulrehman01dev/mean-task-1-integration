import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GITHUB_API_URL } from '../constants/api';


@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private http = inject(HttpClient);


  setToken(token: string): void {
    localStorage.setItem('githubToken', token);
  };


  getToken(): string | null {
    return localStorage.getItem('githubToken');
  }


  getGithubData(collection: string, page = 1, limit = 10, search = '', sortField: string, sortDir: string, filters: Record<string, any>) {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const filtersStr = Object.keys(filters || {}).length > 0 ? JSON.stringify(filters) : undefined;
    return this.http.get(`${GITHUB_API_URL}/github/data/${collection}`, {
      headers,
      params: { page, limit, search, sortField, sortDir, ...(filtersStr && { filters: filtersStr }) },
    });
  }
  
  
  resyncIntegration() {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post(`${GITHUB_API_URL}/github/resync`, {}, { headers });
  };
  

  removeIntegration() {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete(`${GITHUB_API_URL}/github/remove`,  { headers });
  };
  

  searchGlobalData(query: string) {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<any>(`${GITHUB_API_URL}/github/search`, {
      headers,
      params: { q: query }
    });
  }

}
