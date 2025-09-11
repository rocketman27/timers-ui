import { Routes } from '@angular/router';
import { TemplatesComponent } from './pages/templates/templates.component';
import { InstancesComponent } from './pages/instances/instances.component';
import { ExecutionsComponent } from './pages/executions/executions.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'templates' },
  { path: 'templates', component: TemplatesComponent },
  { path: 'instances', component: InstancesComponent },
  { path: 'executions', component: ExecutionsComponent },
];
