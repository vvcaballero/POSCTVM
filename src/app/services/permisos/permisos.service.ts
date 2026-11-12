
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { PermisoRol } from '../../interfaces/permiso-rol.interface';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  // DESARROLLO
  private apiUrl = 'http://localhost:8080/api/permisos-rol';

  // PRODUCCIÓN
  // private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api/permisos-rol';

  private permisosCache: { [rol: string]: PermisoRol } = {};

  private solicitudes: {
    [rol: string]: Observable<PermisoRol>
  } = {};

  constructor(private http: HttpClient) {}

  getPermisos(): Observable<PermisoRol[]> {
    return this.http.get<PermisoRol[]>(this.apiUrl);
  }

  getPermisosPorRol(rol: string): Observable<PermisoRol> {

    if (this.permisosCache[rol]) {
      return of(this.permisosCache[rol]);
    }

    if (this.solicitudes[rol]) {
      return this.solicitudes[rol];
    }

    const solicitud = this.http
      .get<PermisoRol>(`${this.apiUrl}/${rol}`)
      .pipe(
        tap(respuesta => {
          this.permisosCache[rol] = respuesta;
          delete this.solicitudes[rol];
        }),
        shareReplay(1)
      );

    this.solicitudes[rol] = solicitud;

    return solicitud;
  }

  actualizarPermisos(
    rol: string,
    permisos: PermisoRol
  ): Observable<PermisoRol> {

    return this.http
      .put<PermisoRol>(`${this.apiUrl}/${rol}`, permisos)
      .pipe(
        tap(respuesta => {
          this.permisosCache[rol] = respuesta;
        })
      );
  }

  obtenerPermisosGuardados(rol: string): PermisoRol | null {
    return this.permisosCache[rol] ?? null;
  }

  limpiarCache(): void {
    this.permisosCache = {};
    this.solicitudes = {};
  }
}
