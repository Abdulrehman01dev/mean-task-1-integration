import { Routes } from '@angular/router';
import { GithubComponent } from './github/github.component';
import { GithubSuccessComponent } from './github-success/github-success.component';

export const INTEGRATIONS_ROUTES: Routes = [
  {
    path: 'github',
    component: GithubComponent
  },
  {
    path: 'github/success',
    component: GithubSuccessComponent
  },
  { path: '', redirectTo: 'integrations/github', pathMatch: 'full' }
];


