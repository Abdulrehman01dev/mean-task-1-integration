import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'integrations',
    loadChildren: () => import('./integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES)
  }
];
