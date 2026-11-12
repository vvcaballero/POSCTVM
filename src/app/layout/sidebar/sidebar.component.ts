
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { PermisosService } from '../../services/permisos/permisos.service';
import { PermisoRol } from '../../interfaces/permiso-rol.interface';




type PermisoCampo = Exclude<keyof PermisoRol, 'id' | 'rol'>;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  permisos: PermisoRol | null = null;

  constructor(
    private authService: AuthService,
    private permisosService: PermisosService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioActual();

    if (!usuario || !usuario.rol) {
      return;
    }

    this.permisosService
      .getPermisosPorRol(usuario.rol)
      .subscribe({
        next: respuesta => {
          this.permisos = respuesta;
        },
        error: error => {
          console.error('Error al cargar permisos del menú:', error);
          this.permisos = null;
        }
      });
  }

  tienePermiso(campo: PermisoCampo): boolean {
    return this.permisos?.[campo] === true;
  }
  
esAdmin(): boolean {
  return this.authService.getUsuarioActual()?.rol?.toUpperCase() === 'ADMIN';
}

}
