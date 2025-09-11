import { Routes } from '@angular/router';
import { TimersComponent } from './pages/timers/timers.component';
import { ExecutionsComponent } from './pages/executions/executions.component';

export const routes: Routes = [
  { path: 'timers', component: TimersComponent },
  { path: 'executions', component: ExecutionsComponent },
  { path: '', redirectTo: 'timers', pathMatch: 'full' },
];
