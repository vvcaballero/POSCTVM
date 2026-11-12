import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Inventario } from '../../interfaces/inventario';
import { MovimientoRequest } from '../../interfaces/movimiento-request';
import { Producto } from '../../interfaces/productos';
import { Usuario } from '../../interfaces/usuarios';

import { InventarioService } from '../../services/inventario/inventario.service';
import { ProductosService } from '../../services/productos/productos.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {

  movimientos: Inventario[] = [];
  productos: Producto[] = [];
  usuarios: Usuario[] = [];

  filtroProducto: number | null = null;

  nuevoMovimiento: MovimientoRequest = {
    idProducto: 0,
    tipoMovimiento: 'ENTRADA',
    cantidad: 1,
    motivo: '',
    idUsuario: 0
  };

  cargando = false;
  guardando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private inventarioService: InventarioService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarUsuarios();
    this.cargarMovimientos();
  }

  // CONSULTAR PRODUCTOS
  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (response) => {
        this.productos = Array.isArray(response.body)
          ? response.body
          : response.body
            ? [response.body]
            : [];
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los productos';
      }
    });
  }

  // CONSULTAR USUARIOS
  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (response) => {
        const body = response.body;

        this.usuarios = Array.isArray(body)
          ? body
          : body
            ? [body]
            : [];
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los usuarios';
      }
    });
  }

  // CONSULTAR MOVIMIENTOS
  cargarMovimientos(): void {
    this.cargando = true;
    this.mensajeError = '';

    const peticion = this.filtroProducto
      ? this.inventarioService.getMovimientosPorProducto(
          this.filtroProducto
        )
      : this.inventarioService.getMovimientos();

    peticion.subscribe({
      next: (response) => {
        this.movimientos = Array.isArray(response.body)
          ? response.body
          : response.body
            ? [response.body]
            : [];

        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'Error al consultar los movimientos';
        this.cargando = false;
      }
    });
  }

  // FILTRAR POR PRODUCTO
  filtrarMovimientos(): void {
    this.cargarMovimientos();
  }

  // REGISTRAR MOVIMIENTO
  registrarMovimiento(): void {

    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.nuevoMovimiento.idProducto) {
      this.mensajeError = 'Selecciona un producto';
      return;
    }

    if (!this.nuevoMovimiento.idUsuario) {
      this.mensajeError = 'Selecciona un usuario';
      return;
    }

    if (!this.nuevoMovimiento.motivo.trim()) {
      this.mensajeError = 'Ingresa el motivo del movimiento';
      return;
    }

    if (!this.nuevoMovimiento.cantidad ||
        !Number.isInteger(this.nuevoMovimiento.cantidad)) {
      this.mensajeError = 'Ingresa una cantidad entera válida';
      return;
    }

    if (this.nuevoMovimiento.tipoMovimiento === 'AJUSTE') {
      if (this.nuevoMovimiento.cantidad === 0) {
        this.mensajeError = 'El ajuste no puede ser cero';
        return;
      }
    } else if (this.nuevoMovimiento.cantidad <= 0) {
      this.mensajeError = 'La cantidad debe ser mayor a cero';
      return;
    }

    this.guardando = true;

    this.inventarioService
      .registrarMovimiento(this.nuevoMovimiento)
      .subscribe({
        next: (response) => {

          this.guardando = false;

          if (response.mensaje !== 'OK') {
            this.mensajeError = response.mensaje;
            return;
          }

          this.mensajeExito = 'Movimiento registrado correctamente';

          this.nuevoMovimiento = {
            idProducto: 0,
            tipoMovimiento: 'ENTRADA',
            cantidad: 1,
            motivo: '',
            idUsuario: 0
          };

          // Actualizar stock y movimientos
          this.cargarProductos();
          this.cargarMovimientos();
        },
        error: (error) => {
          this.guardando = false;

          this.mensajeError =
            error.error?.mensaje ||
            'No fue posible registrar el movimiento';
        }
      });
  }

  // OBTENER NOMBRE DEL PRODUCTO
  obtenerNombreProducto(idProducto: number): string {
    const producto = this.productos.find(
      p => p.idProducto === idProducto
    );

    return producto ? producto.nombre : `Producto #${idProducto}`;
  }

  // OBTENER NOMBRE DEL USUARIO
  obtenerNombreUsuario(idUsuario: number): string {
    const usuario = this.usuarios.find(
      u => u.idUsuario === idUsuario
    );

    return usuario ? usuario.nombre : `Usuario #${idUsuario}`;
  }

  // CLASE VISUAL SEGÚN TIPO
  obtenerClaseMovimiento(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA':
        return 'badge-entrada';
      case 'SALIDA':
        return 'badge-salida';
      case 'AJUSTE':
        return 'badge-ajuste';
      default:
        return '';
    }
  }

}