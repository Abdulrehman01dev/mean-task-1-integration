import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-github-success',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: "github-success.component.html",
})


export class GithubSuccessComponent {
  status: 'success' | 'error' | 'loading' = 'loading';

  constructor(route: ActivatedRoute, private router: Router, authService: AuthService) {
    const qs = route.snapshot.queryParamMap;
    const code = qs.get('code');
    if (code) {
      // Send the user to backend to finish OAuth; backend will redirect back with status
      authService.verifyOAuthToken(code).pipe().subscribe({
        next: (res: any) => {
          authService.setToken(res?.token);
          this.status = 'success';
        },
        error: error => {
          this.status = 'error';
        }
      });


      return;
    };
  }
}
