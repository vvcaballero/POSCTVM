import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Producto } from '../../interfaces/productos';
import { Clientes } from '../../interfaces/clientes';
import { VentaRequest, VentaCompleta } from '../../interfaces/ventas';
import { PagoRequest } from '../../interfaces/pagos';

import { ProductosService } from '../../services/productos/productos.service';
import { ClientesService } from '../../services/clientes/clientes.service';
import { VentasService } from '../../services/ventas/ventas.service';
import { AuthService } from '../../services/auth/auth.service';

interface ProductoCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './punto-venta.component.html',
  styleUrl: './punto-venta.component.css'
})
export class PuntoVentaComponent implements OnInit {

  productos: Producto[] = [];
  clientes: Clientes[] = [];

  carrito: ProductoCarrito[] = [];

  busqueda = '';
  idCliente: number | null = null;

  descuento = 0;

  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' = 'EFECTIVO';
  montoRecibido = 0;

  cargando = false;
  procesandoVenta = false;

  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  ultimaVenta: VentaCompleta | null = null;

  // Nombre del usuario que hizo la última venta (se guarda al registrarla)
  usuarioUltimaVenta = '';

  constructor(
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private ventasService: VentasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // USUARIO LOGUEADO (desde la sesión)
  get idUsuario(): number | null {
    const usuario: any = this.authService.getUsuarioActual();

    const id = usuario?.idUsuario ?? usuario?.id ?? null;

    return id !== null && id !== undefined ? Number(id) : null;
  }

  get nombreUsuarioLogueado(): string {
    const usuario: any = this.authService.getUsuarioActual();

    return (
      usuario?.nombre ??
      usuario?.nombreUsuario ??
      usuario?.username ??
      usuario?.usuario ??
      'Usuario'
    );
  }

  // CARGAR CATÁLOGOS
  cargarDatos(): void {
    this.cargando = true;

    forkJoin({
      productos: this.productosService.getProductos(),
      clientes: this.clientesService.getClientes()
    }).subscribe({
      next: (response) => {
        this.productos = Array.isArray(response.productos.body)
          ? response.productos.body as Producto[]
          : [];

        this.clientes = Array.isArray(response.clientes.body)
          ? response.clientes.body as Clientes[]
          : [];

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mostrarMensaje(
          'No fue posible cargar los datos del punto de venta.',
          'error'
        );
      }
    });
  }

  // PRODUCTOS FILTRADOS
  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(producto => {
      const nombre = (producto.nombre ?? '').toLowerCase();
      const codigo = (producto.codigo ?? '').toLowerCase();

      return producto.activo !== false &&
        Number(producto.stock) > 0 &&
        (
          nombre.includes(texto) ||
          codigo.includes(texto)
        );
    });
  }

  // AGREGAR PRODUCTO
  agregarProducto(producto: Producto): void {
    if (!producto.idProducto || producto.stock <= 0) {
      return;
    }

    const existente = this.carrito.find(
      item => item.producto.idProducto === producto.idProducto
    );

    if (existente) {
      if (existente.cantidad >= producto.stock) {
        this.mostrarMensaje(
          `Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}.`,
          'error'
        );
        return;
      }

      existente.cantidad++;
    } else {
      this.carrito.push({
        producto,
        cantidad: 1
      });
    }

    this.ultimaVenta = null;
    this.mensaje = '';
  }

  // AUMENTAR CANTIDAD
  aumentarCantidad(item: ProductoCarrito): void {
    if (item.cantidad >= item.producto.stock) {
      this.mostrarMensaje(
        `Stock máximo disponible: ${item.producto.stock}.`,
        'error'
      );
      return;
    }

    item.cantidad++;
    this.mensaje = '';
  }

  // DISMINUIR CANTIDAD
  disminuirCantidad(item: ProductoCarrito): void {
    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      this.eliminarProducto(item);
    }
  }

  // ELIMINAR PRODUCTO
  eliminarProducto(item: ProductoCarrito): void {
    this.carrito = this.carrito.filter(
      producto =>
        producto.producto.idProducto !== item.producto.idProducto
    );
  }

  // VACIAR CARRITO
  limpiarCarrito(): void {
    this.carrito = [];
    this.descuento = 0;
    this.montoRecibido = 0;
    this.mensaje = '';
  }

  // SUBTOTAL
  get subtotal(): number {
    return this.carrito.reduce(
      (total, item) =>
        total + (Number(item.producto.precioVenta) * item.cantidad),
      0
    );
  }

  // DESCUENTO VALIDADO
  get descuentoValido(): number {
    const valor = Number(this.descuento) || 0;

    return Math.min(
      Math.max(valor, 0),
      this.subtotal
    );
  }

  // TOTAL
  get total(): number {
    return Math.max(0, this.subtotal - this.descuentoValido);
  }

  // CANTIDAD DE PRODUCTOS
  get cantidadProductos(): number {
    return this.carrito.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }

  // CAMBIO
  get cambio(): number {
    if (this.metodoPago !== 'EFECTIVO') {
      return 0;
    }

    return Math.max(
      0,
      (Number(this.montoRecibido) || 0) - this.total
    );
  }

  // VALIDAR PAGO
  get pagoValido(): boolean {
    if (this.metodoPago === 'EFECTIVO') {
      return Number(this.montoRecibido) >= this.total;
    }

    return true;
  }

  // CAMBIAR MÉTODO DE PAGO
  cambiarMetodoPago(): void {
    if (this.metodoPago !== 'EFECTIVO') {
      this.montoRecibido = this.total;
    } else {
      this.montoRecibido = 0;
    }
  }

  // REGISTRAR VENTA
  registrarVenta(): void {
    if (this.procesandoVenta) {
      return;
    }

    const idUsuario = this.idUsuario;

    if (!idUsuario) {
      this.mostrarMensaje(
        'No se pudo identificar al usuario de la sesión. Vuelve a iniciar sesión.',
        'error'
      );
      return;
    }

    if (this.carrito.length === 0) {
      this.mostrarMensaje(
        'Agrega al menos un producto al carrito.',
        'error'
      );
      return;
    }

    if (this.total <= 0) {
      this.mostrarMensaje(
        'El total de la venta debe ser mayor a cero.',
        'error'
      );
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && !this.pagoValido) {
      this.mostrarMensaje(
        'El efectivo recibido no cubre el total de la venta.',
        'error'
      );
      return;
    }

    // VALIDAR STOCK
    const stockInsuficiente = this.carrito.find(
      item =>
        item.cantidad > Number(item.producto.stock)
    );

    if (stockInsuficiente) {
      this.mostrarMensaje(
        `Stock insuficiente para ${stockInsuficiente.producto.nombre}.`,
        'error'
      );

      this.cargarDatos();
      return;
    }

    // VALIDAR DESCUENTO
    if (
      !Number.isFinite(Number(this.descuento)) ||
      Number(this.descuento) < 0 ||
      Number(this.descuento) > this.subtotal
    ) {
      this.mostrarMensaje(
        'El descuento no es válido.',
        'error'
      );
      return;
    }

    const montoPago = this.metodoPago === 'EFECTIVO'
      ? Number(this.montoRecibido)
      : this.total;

    const pagos: PagoRequest[] = [
      {
        metodoPago: this.metodoPago,
        monto: montoPago
      }
    ];

    const venta: VentaRequest = {
      idCliente: this.idCliente,
      idUsuario: idUsuario,
      descuento: this.descuentoValido,
      detalles: this.carrito.map(item => ({
        idProducto: item.producto.idProducto!,
        cantidad: item.cantidad
      })),
      pagos
    };

    this.procesandoVenta = true;
    this.mensaje = '';

    this.ventasService.crearVenta(venta).subscribe({
      next: response => {
        this.procesandoVenta = false;

        const body = response.body;

        if (
          !body ||
          !('venta' in body) ||
          !body.venta?.idVenta
        ) {
          this.mostrarMensaje(
            response.mensaje || 'No fue posible confirmar la venta.',
            'error'
          );
          return;
        }

        this.ultimaVenta = body as VentaCompleta;
        this.usuarioUltimaVenta = this.nombreUsuarioLogueado;

        this.mostrarMensaje(
          response.mensaje || 'Venta registrada correctamente.',
          'success'
        );

        // LIMPIAR DATOS DE LA OPERACIÓN
        this.carrito = [];
        this.descuento = 0;
        this.montoRecibido = 0;
        this.idCliente = null;
        this.busqueda = '';
        this.metodoPago = 'EFECTIVO';

        // ACTUALIZAR EXISTENCIAS
        this.productosService.getProductos().subscribe({
          next: productosResponse => {
            this.productos = Array.isArray(productosResponse.body)
              ? productosResponse.body as Producto[]
              : [];
          },
          error: () => {
            this.mostrarMensaje(
              'La venta se registró, pero no se pudieron actualizar las existencias en pantalla.',
              'error'
            );
          }
        });
      },
      error: error => {
        this.procesandoVenta = false;

        const mensajeError =
          error?.error?.mensaje ||
          error?.error?.message ||
          'Error al registrar la venta.';

        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  // MENSAJES
  mostrarMensaje(
    mensaje: string,
    tipo: 'success' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }

  // CLIENTE DE LA ÚLTIMA VENTA
  get nombreClienteVenta(): string {
    if (!this.ultimaVenta?.venta?.idCliente) {
      return 'Público general';
    }

    const cliente = this.clientes.find(
      item => item.idCliente === this.ultimaVenta?.venta.idCliente
    );

    return cliente?.nombre || 'Cliente';
  }
}