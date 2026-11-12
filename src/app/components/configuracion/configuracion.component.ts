
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermisosService } from '../../services/permisos/permisos.service';
import { PermisoRol } from '../../interfaces/permiso-rol.interface';

type PermisoCampo = Exclude<keyof PermisoRol, 'id' | 'rol'>;

interface PermisoItem {
  campo: PermisoCampo;
  etiqueta: string;
}

interface GrupoPermisos {
  titulo: string;
  permisos: PermisoItem[];
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent implements OnInit {

  roles: string[] = ['ADMIN', 'CAJERO'];

  rolSeleccionado = 'ADMIN';

  permisosActuales: PermisoRol | null = null;

  cargando = false;
  guardando = false;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  gruposPermisos: GrupoPermisos[] = [
    {
      titulo: 'Dashboard',
      permisos: [
        { campo: 'dashboardVer', etiqueta: 'Ver dashboard' }
      ]
    },
    {
      titulo: 'Punto de venta',
      permisos: [
        { campo: 'puntoVentaVer', etiqueta: 'Acceder al punto de venta' }
      ]
    },
    {
      titulo: 'Ventas',
      permisos: [
        { campo: 'ventasVer', etiqueta: 'Ver ventas' },
        { campo: 'ventasCrear', etiqueta: 'Crear ventas' },
        { campo: 'ventasEditar', etiqueta: 'Editar ventas' },
        { campo: 'ventasEliminar', etiqueta: 'Eliminar ventas' }
      ]
    },
    {
      titulo: 'Productos',
      permisos: [
        { campo: 'productosVer', etiqueta: 'Ver productos' },
        { campo: 'productosCrear', etiqueta: 'Crear productos' },
        { campo: 'productosEditar', etiqueta: 'Editar productos' },
        { campo: 'productosEliminar', etiqueta: 'Eliminar productos' }
      ]
    },
    {
      titulo: 'Inventario',
      permisos: [
        { campo: 'inventarioVer', etiqueta: 'Ver inventario' },
        { campo: 'inventarioCrear', etiqueta: 'Registrar movimientos' },
        { campo: 'inventarioEditar', etiqueta: 'Editar inventario' }
      ]
    },
    {
      titulo: 'Clientes',
      permisos: [
        { campo: 'clientesVer', etiqueta: 'Ver clientes' },
        { campo: 'clientesCrear', etiqueta: 'Crear clientes' },
        { campo: 'clientesEditar', etiqueta: 'Editar clientes' },
        { campo: 'clientesEliminar', etiqueta: 'Eliminar clientes' }
      ]
    },
    {
      titulo: 'Reportes',
      permisos: [
        { campo: 'reportesVer', etiqueta: 'Ver reportes' }
      ]
    },
    {
      titulo: 'Usuarios',
      permisos: [
        { campo: 'usuariosVer', etiqueta: 'Ver usuarios' },
        { campo: 'usuariosCrear', etiqueta: 'Crear usuarios' },
        { campo: 'usuariosEditar', etiqueta: 'Editar usuarios' },
        { campo: 'usuariosEliminar', etiqueta: 'Eliminar usuarios' }
      ]
    },
    {
      titulo: 'Configuración',
      permisos: [
        { campo: 'configuracionVer', etiqueta: 'Ver configuración' },
        { campo: 'configuracionEditar', etiqueta: 'Editar configuración' }
      ]
    }
  ];

  constructor(private permisosService: PermisosService) {}

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    this.mensaje = '';
    this.tipoMensaje = '';
    this.permisosActuales = null;

    this.permisosService
      .getPermisosPorRol(this.rolSeleccionado)
      .subscribe({
        next: (respuesta) => {
          this.permisosActuales = { ...respuesta };
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al consultar permisos:', error);
          this.cargando = false;

          this.mostrarMensaje(
            'No fue posible cargar los permisos del rol.',
            'error'
          );
        }
      });
  }

  cambiarRol(rol: string): void {
    if (rol === this.rolSeleccionado) {
      return;
    }

    this.rolSeleccionado = rol;
    this.cargarPermisos();
  }

  cambiarPermiso(campo: PermisoCampo, valor: boolean): void {
    if (!this.permisosActuales) {
      return;
    }

    this.permisosActuales[campo] = valor;
  }

  guardarPermisos(): void {
    if (!this.permisosActuales || this.guardando) {
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.tipoMensaje = '';

    this.permisosService
      .actualizarPermisos(
        this.rolSeleccionado,
        this.permisosActuales
      )
      .subscribe({
        next: (respuesta) => {
          this.permisosActuales = { ...respuesta };
          this.guardando = false;

          this.mostrarMensaje(
            `Los permisos del rol ${this.rolSeleccionado} se guardaron correctamente.`,
            'exito'
          );
        },
        error: (error) => {
          console.error('Error al guardar permisos:', error);
          this.guardando = false;

          this.mostrarMensaje(
            'No fue posible guardar los permisos.',
            'error'
          );
        }
      });
  }

  private mostrarMensaje(
    mensaje: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }
}
