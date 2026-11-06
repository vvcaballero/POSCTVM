import { Routes } from '@angular/router';

import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ProductosComponent } from './components/productos/productos.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
    children: [

      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      },

      {
        path: 'productos',
        component: ProductosComponent
      },

      {
        path: 'usuarios',
        component: UsuariosComponent
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'productos'
  }

];