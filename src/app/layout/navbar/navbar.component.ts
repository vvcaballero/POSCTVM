import { Component, DestroyRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth/auth.service';
import { ReportesService } from '../../services/reportes/reportes.service';

interface Notificacion {
  tipo: 'agotado' | 'stock-bajo';
  titulo: string;
  detalle: string;
  ruta: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  fechaActual: Date = new Date();

  tituloPagina = 'Panel de control';
  descripcionPagina = 'Bienvenido al sistema POSCTVM';

  menuUsuarioAbierto = false;
  menuNotificacionesAbierto = false;

  notificaciones: Notificacion[] = [];
  readonly maxVisibles = 5;

  // Ajusta esta ruta a la de tu pantalla de inventario
  private rutaInventario = '/inventario';

  constructor(
    private router: Router,
    private destroyRef: DestroyRef,
    private authService: AuthService,
    private reportesService: ReportesService,
    private elementRef: ElementRef
  ) {

    this.actualizarTitulo(this.router.url);

    // Cambio de pantalla: actualiza título, cierra menús y refresca alertas
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => {

      if (event instanceof NavigationEnd) {
        this.actualizarTitulo(event.urlAfterRedirects);
        this.menuUsuarioAbierto = false;
        this.menuNotificacionesAbierto = false;
        this.cargarNotificaciones();
      }

    });

    // Carga inicial y luego cada 2 minutos
    timer(0, 120000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.fechaActual = new Date();
      this.cargarNotificaciones();
    });
  }

  // ===== NOTIFICACIONES =====

  cargarNotificaciones(): void {
    // Si no hay sesión (pantalla de login) no se consulta nada
    if (!this.authService.getToken()) {
      this.notificaciones = [];
      return;
    }

    this.reportesService.obtenerDashboard().subscribe({
      next: (response: any) => {
        const lista: any[] = Array.isArray(response?.body?.productosStockBajo)
          ? response.body.productosStockBajo
          : [];

        this.notificaciones = lista
          .map((p): Notificacion => {
            const stock = Number(p?.stock ?? 0);

            return stock <= 0
              ? {
                  tipo: 'agotado',
                  titulo: 'Producto agotado',
                  detalle: `${p?.nombre ?? 'Producto'} · sin existencias`,
                  ruta: this.rutaInventario
                }
              : {
                  tipo: 'stock-bajo',
                  titulo: 'Stock bajo',
                  detalle: `${p?.nombre ?? 'Producto'} · quedan ${stock}`,
                  ruta: this.rutaInventario
                };
          })
          // Agotados primero
          .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'agotado' ? -1 : 1));
      },
      error: () => {
        // Si falla, se conserva lo último que se mostró
      }
    });
  }

  get totalNotificaciones(): number {
    return this.notificaciones.length;
  }

  get notificacionesVisibles(): Notificacion[] {
    return this.notificaciones.slice(0, this.maxVisibles);
  }

  get notificacionesOcultas(): number {
    return Math.max(0, this.notificaciones.length - this.maxVisibles);
  }

  alternarNotificaciones(): void {
    this.menuNotificacionesAbierto = !this.menuNotificacionesAbierto;
    this.menuUsuarioAbierto = false;
  }

  irANotificacion(notificacion: Notificacion): void {
    this.menuNotificacionesAbierto = false;
    this.router.navigate([notificacion.ruta]);
  }

  verInventario(): void {
    this.menuNotificacionesAbierto = false;
    this.router.navigate([this.rutaInventario]);
  }

  // ===== USUARIO =====

  get nombreUsuario(): string {
    const usuario: any = this.authService.getUsuarioActual();

    return (
      usuario?.nombre ??
      usuario?.nombreUsuario ??
      usuario?.username ??
      usuario?.usuario ??
      'Usuario'
    );
  }

  get rolUsuario(): string {
    const usuario: any = this.authService.getUsuarioActual();
    const rol = usuario?.rol ?? usuario?.perfil ?? usuario?.tipoUsuario ?? '';

    return rol ? this.formatearRol(String(rol)) : 'Usuario del sistema';
  }

  private formatearRol(rol: string): string {
    const limpio = rol.replace('ROLE_', '').replace(/_/g, ' ').toLowerCase();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }

  alternarMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
    this.menuNotificacionesAbierto = false;
  }

  // Cierra los menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  alHacerClicFuera(event: MouseEvent): void {
    const host: HTMLElement = this.elementRef.nativeElement;
    const objetivo = event.target as Node;

    const perfil = host.querySelector('.user-profile-wrapper');
    const campana = host.querySelector('.notif-wrapper');

    if (perfil && !perfil.contains(objetivo)) {
      this.menuUsuarioAbierto = false;
    }

    if (campana && !campana.contains(objetivo)) {
      this.menuNotificacionesAbierto = false;
    }
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.menuUsuarioAbierto = false;
    this.menuNotificacionesAbierto = false;
  }

  cerrarSesion(): void {
    const confirmar = window.confirm('¿Deseas cerrar sesión?');

    if (!confirmar) {
      return;
    }

    this.authService.logout();
    this.menuUsuarioAbierto = false;
    this.menuNotificacionesAbierto = false;
    this.notificaciones = [];
    this.router.navigate(['/login']);
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