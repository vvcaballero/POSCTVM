
import { Component, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  fechaActual: Date = new Date();

  tituloPagina = 'Panel de control';
  descripcionPagina = 'Bienvenido al sistema POSCTVM';

  constructor(
    private router: Router,
    private destroyRef: DestroyRef
  ) {

    this.actualizarTitulo(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => {

      if (event instanceof NavigationEnd) {
        this.actualizarTitulo(event.urlAfterRedirects);
      }

    });
  }

  actualizarTitulo(url: string): void {

    const ruta = url.split('?')[0];

    switch (ruta) {

      case '/dashboard':
      case '/':
        this.tituloPagina = 'Panel de control';
        this.descripcionPagina = 'Bienvenido al sistema POSCTVM';
        break;

      case '/productos':
        this.tituloPagina = 'Productos';
        this.descripcionPagina = 'Administración del catálogo de productos';
        break;

      case '/usuarios':
        this.tituloPagina = 'Usuarios';
        this.descripcionPagina = 'Administración de usuarios del sistema';
        break;

      case '/ventas':
        this.tituloPagina = 'Ventas';
        this.descripcionPagina = 'Control y registro de ventas';
        break;

      case '/inventario':
        this.tituloPagina = 'Inventario';
        this.descripcionPagina = 'Control de existencias';
        break;

      case '/compras':
        this.tituloPagina = 'Compras';
        this.descripcionPagina = 'Administración de compras';
        break;

      case '/reportes':
        this.tituloPagina = 'Reportes';
        this.descripcionPagina = 'Información y estadísticas del negocio';
        break;

      case '/configuracion':
        this.tituloPagina = 'Configuración';
        this.descripcionPagina = 'Configuración general del sistema';
        break;

      default:
        this.tituloPagina = 'POSCTVM';
        this.descripcionPagina = 'Sistema Punto de Venta';
        break;
    }
  }
}
