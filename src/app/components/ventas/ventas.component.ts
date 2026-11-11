
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Ventas, VentaCompleta } from '../../interfaces/ventas';
import { DetalleVenta } from '../../interfaces/detalle-venta';
import { Pagos } from '../../interfaces/pagos';
import { Producto } from '../../interfaces/productos';
import { Clientes } from '../../interfaces/clientes';
import { Usuario } from '../../interfaces/usuarios';

import { VentasService } from '../../services/ventas/ventas.service';
import { ProductosService } from '../../services/productos/productos.service';
import { ClientesService } from '../../services/clientes/clientes.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {

  ventas: Ventas[] = [];
  productos: Producto[] = [];
  clientes: Clientes[] = [];
  usuarios: Usuario[] = [];

  detalleSeleccionado: VentaCompleta | null = null;

  cargando = false;
  cargandoDetalle = false;
  procesandoCancelacion = false;

  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  busqueda = '';
  filtroEstado = '';
  filtroCliente: number | null = null;
  filtroUsuario: number | null = null;
  fechaDesde = '';
  fechaHasta = '';

  constructor(
    private ventasService: VentasService,
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private usuariosService: UsuariosService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // CARGAR HISTORIAL Y CATÁLOGOS
  cargarDatos(): void {
    this.cargando = true;
    this.mensaje = '';

    forkJoin({
      ventas: this.ventasService.getVentas(),
      productos: this.productosService.getProductos(),
      clientes: this.clientesService.getClientes(),
      usuarios: this.usuariosService.getUsuarios()
    }).subscribe({
      next: response => {
        this.ventas = Array.isArray(response.ventas.body)
          ? response.ventas.body
          : [];

        this.productos = Array.isArray(response.productos.body)
          ? response.productos.body
          : [];

        this.clientes = Array.isArray(response.clientes.body)
          ? response.clientes.body
          : [];

        this.usuarios = Array.isArray(response.usuarios.body)
          ? response.usuarios.body
          : [];

        // Más recientes primero
        this.ventas.sort((a, b) =>
          new Date(b.fechaVenta).getTime() -
          new Date(a.fechaVenta).getTime()
        );

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mostrarMensaje(
          'No fue posible cargar el historial de ventas.',
          'error'
        );
      }
    });
  }

  // FILTRAR HISTORIAL
  get ventasFiltradas(): Ventas[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.ventas.filter(venta => {
      const folio = String(venta.idVenta ?? '').toLowerCase();

      const cliente = this.obtenerNombreCliente(venta.idCliente)
        .toLowerCase();

      const usuario = this.obtenerNombreUsuario(venta.idUsuario)
        .toLowerCase();

      const coincideBusqueda =
        !texto ||
        folio.includes(texto) ||
        cliente.includes(texto) ||
        usuario.includes(texto);

      const coincideEstado =
        !this.filtroEstado ||
        venta.estado === this.filtroEstado;

      const coincideCliente =
        this.filtroCliente === null ||
        Number(venta.idCliente) === Number(this.filtroCliente);

      const coincideUsuario =
        this.filtroUsuario === null ||
        Number(venta.idUsuario) === Number(this.filtroUsuario);

      const fecha = venta.fechaVenta
        ? venta.fechaVenta.substring(0, 10)
        : '';

      const coincideDesde =
        !this.fechaDesde || fecha >= this.fechaDesde;

      const coincideHasta =
        !this.fechaHasta || fecha <= this.fechaHasta;

      return coincideBusqueda &&
        coincideEstado &&
        coincideCliente &&
        coincideUsuario &&
        coincideDesde &&
        coincideHasta;
    });
  }

  // TOTAL DE VENTAS PAGADAS
  get totalVentasPagadas(): number {
    return this.ventas
      .filter(venta => venta.estado === 'PAGADA')
      .length;
  }

  // IMPORTE DE VENTAS PAGADAS
  get importeVentasPagadas(): number {
    return this.ventas
      .filter(venta => venta.estado === 'PAGADA')
      .reduce((total, venta) => total + Number(venta.total || 0), 0);
  }

  // VENTAS CANCELADAS
  get totalVentasCanceladas(): number {
    return this.ventas
      .filter(venta => venta.estado === 'CANCELADA')
      .length;
  }

  // CONSULTAR DETALLE
  verDetalle(idVenta?: number): void {
    if (!idVenta) {
      return;
    }

    this.cargandoDetalle = true;
    this.detalleSeleccionado = null;

    this.ventasService.getVenta(idVenta).subscribe({
      next: response => {
        if (!response.body) {
          this.mostrarMensaje(
            response.mensaje || 'No se encontró el detalle de la venta.',
            'error'
          );
          this.cargandoDetalle = false;
          return;
        }

        this.detalleSeleccionado = response.body;
        this.cargandoDetalle = false;
      },
      error: error => {
        this.cargandoDetalle = false;
        this.mostrarMensaje(
          error?.error?.mensaje ||
          'No fue posible consultar el detalle de la venta.',
          'error'
        );
      }
    });
  }

  // CERRAR DETALLE
  cerrarDetalle(): void {
    this.detalleSeleccionado = null;
  }

  // CANCELAR VENTA
  cancelarVenta(venta: Ventas): void {
    if (!venta.idVenta || venta.estado !== 'PAGADA') {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de cancelar la venta #${venta.idVenta}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesandoCancelacion = true;

    this.ventasService.cancelarVenta(venta.idVenta).subscribe({
      next: response => {
        this.procesandoCancelacion = false;

        this.mostrarMensaje(
          response.mensaje || 'Venta cancelada correctamente.',
          'success'
        );

        this.detalleSeleccionado = null;
        this.cargarDatos();
      },
      error: error => {
        this.procesandoCancelacion = false;

        this.mostrarMensaje(
          error?.error?.mensaje ||
          'No fue posible cancelar la venta.',
          'error'
        );
      }
    });
  }

  // LIMPIAR FILTROS
  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = '';
    this.filtroCliente = null;
    this.filtroUsuario = null;
    this.fechaDesde = '';
    this.fechaHasta = '';
  }

  // NOMBRE DEL CLIENTE
  obtenerNombreCliente(idCliente: number | null): string {
    if (idCliente === null || idCliente === undefined) {
      return 'Público general';
    }

    return this.clientes.find(
      cliente => Number(cliente.idCliente) === Number(idCliente)
    )?.nombre || `Cliente #${idCliente}`;
  }

  // NOMBRE DEL USUARIO
  obtenerNombreUsuario(idUsuario: number): string {
    return this.usuarios.find(
      usuario => Number(usuario.idUsuario) === Number(idUsuario)
    )?.nombre || `Usuario #${idUsuario}`;
  }

  // NOMBRE DEL PRODUCTO
  obtenerNombreProducto(idProducto: number): string {
    return this.productos.find(
      producto => Number(producto.idProducto) === Number(idProducto)
    )?.nombre || `Producto #${idProducto}`;
  }

  // MENSAJES
  mostrarMensaje(
    mensaje: string,
    tipo: 'success' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }

  // IMPORTE DE UN DETALLE
  calcularSubtotalDetalle(detalle: DetalleVenta): number {
    return Number(detalle.subtotal || 0);
  }

  // FORMATO DE MÉTODO DE PAGO
  nombreMetodoPago(metodo: string): string {
    const nombres: Record<string, string> = {
      EFECTIVO: 'Efectivo',
      TARJETA: 'Tarjeta',
      TRANSFERENCIA: 'Transferencia'
    };

    return nombres[metodo] || metodo;
  }
}
