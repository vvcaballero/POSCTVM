import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { InventarioComponent } from './components/inventario/inventario.component';

export const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    component: LoginComponent
  },

  // PÁGINA PRINCIPAL
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // SISTEMA POS
  {
    path: '',
    component: MainLayoutComponent,
    children: [

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
      ,
      {
        path: 'inventario',
        component: InventarioComponent
      }
      
      

    ]
  },

  // RUTA NO ENCONTRADA
  {
    path: '**',
    redirectTo: 'login'
  }

];