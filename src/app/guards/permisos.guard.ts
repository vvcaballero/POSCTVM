
import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  Router
} from '@angular/router';

import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
import { PermisosService } from '../services/permisos/permisos.service';
import { PermisoRol } from '../interfaces/permiso-rol.interface';

type PermisoCampo = Exclude<keyof PermisoRol, 'id' | 'rol'>;

const permisosPorRuta: Record<string, PermisoCampo> = {
  'dashboard': 'dashboardVer',
  'productos': 'productosVer',
  'categorias': 'productosVer',
  'clientes': 'clientesVer',
  'usuarios': 'usuariosVer',
  'inventario': 'inventarioVer',
  'punto-venta': 'puntoVentaVer',
  'ventas': 'ventasVer',
  'pedidos-clientes': 'ventasVer',
  'reportes': 'reportesVer',
  'configuracion': 'configuracionVer'
};

export const permisosGuard: CanActivateChildFn = async (route) => {

  const authService = inject(AuthService);
  const permisosService = inject(PermisosService);
  const router = inject(Router);

  const usuario = authService.getUsuarioActual();

  // Si no hay sesión, regresar al login.
  if (!usuario || !usuario.rol || !usuario.token) {
    return router.createUrlTree(['/login']);
  }

  const ruta = route.routeConfig?.path;

  // Si la ruta no tiene un permiso configurado, no permitir acceso.
  if (!ruta || !permisosPorRuta[ruta]) {
    return router.createUrlTree(['/dashboard']);
  }

  try {

    const permisos = await firstValueFrom(
      permisosService.getPermisosPorRol(usuario.rol).pipe(
        catchError(error => {
          console.error('Error al consultar permisos:', error);
          return of(null);
        })
      )
    );

    if (!permisos) {
      return router.createUrlTree(['/login']);
    }

    const permisoNecesario = permisosPorRuta[ruta];

    if (permisos[permisoNecesario] === true) {
      return true;
    }

    // No tiene permiso: enviarlo al dashboard si está autorizado.
    if (permisos.dashboardVer) {
      return router.createUrlTree(['/dashboard']);
    }

    // Si tampoco puede ver el dashboard, cerrar el acceso a la zona privada.
    return router.createUrlTree(['/login']);

  } catch (error) {
    console.error('Error al validar permisos:', error);
    return router.createUrlTree(['/login']);
  }
};
