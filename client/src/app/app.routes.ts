import { Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  {
    path: 'integrations',
    loadChildren: () => import('./integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES)
  },
  {
    path: 'search',
    component: SearchComponent
  }
];
