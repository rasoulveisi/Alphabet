import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'session',
    loadComponent: () => import('./pages/session/session').then((m) => m.Session),
  },
];
