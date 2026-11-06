import { Routes } from '@angular/router';

import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { CategoriasComponent } from './components/categorias/categorias.component';

export const routes: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'productos',
        component: ProductosComponent
      },

      {
        path: 'categorias',
        component: CategoriasComponent
      },

      {
        path: 'clientes',
        component: ClientesComponent
      },

      {
        path: 'usuarios',
        component: UsuariosComponent
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];