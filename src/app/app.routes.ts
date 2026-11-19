import { Routes } from '@angular/router';
import { Portal } from './components/portal/portal';
import { Admin } from './components/admin/admin';

export const routes: Routes = [
  { path: '', component: Portal },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: '' }
];