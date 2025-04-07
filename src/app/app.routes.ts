import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'log-in',
    loadComponent: () => import('./log-in/log-in.page').then( m => m.LogInPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path:'**', redirectTo: 'log-in'
  },
  {
    path: 'pago',
    loadComponent: () => import('./pago/pago.page').then( m => m.PagoPage)
  }

];