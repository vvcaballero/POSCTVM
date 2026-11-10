
import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { InventarioComponent } from './components/inventario/inventario.component';

import { VentasComponent } from './components/ventas/ventas.component';
import { PuntoVentaComponent } from './components/punto-venta/punto-venta.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    component: LoginComponent
  },

  // RUTA INICIAL
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
      },

      {
        path: 'inventario',
        component: InventarioComponent
      },

      {
        path: 'punto-venta',
        component: PuntoVentaComponent
      },

      {
        path: 'ventas',
        component: VentasComponent
      },

      {
        path: 'reportes',
        component: ReportesComponent
      },

      {
        path: 'configuracion',
        component: ConfiguracionComponent
      }

    ]
  },

  // RUTA NO ENCONTRADA
  {
    path: '**',
    redirectTo: 'login'
  }

];
