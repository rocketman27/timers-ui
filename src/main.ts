import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register all community modules for AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
