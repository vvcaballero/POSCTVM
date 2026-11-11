
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Clientes } from '../../interfaces/clientes';
import { Categorias } from '../../interfaces/categorias';
import { LoginResponse } from '../../interfaces/login';

import {
  PedidoCliente,
  PedidoClienteRequest,
  DetallePedidoCliente,
  DetallePedidoClienteRequest,
  RegistrarProductoPedidoRequest
} from '../../interfaces/pedidos-clientes';

import { ClientesService } from '../../services/clientes/clientes.service';
import { CategoriasService } from '../../services/categorias/categorias.service';
import { AuthService } from '../../services/auth/auth.service';
import { PedidosClientesService } from '../../services/pedidos-clientes/pedidos-clientes.service';

interface DetalleFormulario {
  descripcionProducto: string;
  cantidad: number;
  precioEstimado: number;
  observaciones: string;
}

interface ConversionFormulario {
  codigo: string;
  nombre: string;
  descripcion: string;
  idCategoria: number | null;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  cantidadRecibida: number;
  motivo: string;
}

@Component({
  selector: 'app-pedidos-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-clientes.component.html',
  styleUrl: './pedidos-clientes.component.css'
})
export class PedidosClientesComponent implements OnInit {

  // DATOS PRINCIPALES
  pedidos: PedidoCliente[] = [];
  pedidosResumen: PedidoCliente[] = [];

  clientes: Clientes[] = [];
  categorias: Categorias[] = [];

  pedidosFiltrados: PedidoCliente[] = [];

  // ESTADOS
  cargando = false;
  guardando = false;

  error = '';
  mensaje = '';

  vista: 'pendientes' | 'historial' = 'pendientes';

  filtroEstado = 'TODOS';
  busqueda = '';

  // MODALES
  mostrarFormulario = false;
  mostrarConversion = false;

  pedidoSeleccionado: PedidoCliente | null = null;
  detalleSeleccionado: DetallePedidoCliente | null = null;

  // FORMULARIO PEDIDO
  idClienteSeleccionado: number | null = null;
  observacionesPedido = '';

  detallesFormulario: DetalleFormulario[] = [
    this.nuevoDetalle()
  ];

  // FORMULARIO CONVERSION
  conversion: ConversionFormulario = this.nuevaConversion();

  // USUARIO AUTENTICADO
  usuarioActual: LoginResponse | null = null;

  constructor(
    private pedidosService: PedidosClientesService,
    private clientesService: ClientesService,
    private categoriasService: CategoriasService,
    private authService: AuthService
  ) {}

  // ==========================================
  // INICIALIZACION
  // ==========================================

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUsuarioActual();

    this.cargarClientes();
    this.cargarCategorias();
    this.cargarPedidos();
    this.cargarResumen();
  }

  // ==========================================
  // INDICADORES DEL RESUMEN
  // ==========================================

  get totalPedidosPendientes(): number {
    return this.pedidosResumen.filter(
      pedido =>
        pedido.estado !== 'CONVERTIDO' &&
        pedido.estado !== 'CANCELADO'
    ).length;
  }

  get totalPedidosRecibidos(): number {
    return this.pedidosResumen.filter(
      pedido => pedido.estado === 'RECIBIDO'
    ).length;
  }

  get totalPedidosConvertidos(): number {
    return this.pedidosResumen.filter(
      pedido => pedido.estado === 'CONVERTIDO'
    ).length;
  }

  cargarResumen(): void {
    this.pedidosService.listarTodos().subscribe({
      next: response => {
        this.pedidosResumen = Array.isArray(response.body)
          ? response.body
          : [];
      },
      error: err => {
        console.error('Error al cargar resumen de pedidos:', err);
        this.pedidosResumen = [];
      }
    });
  }

  // ==========================================
  // FORMULARIOS
  // ==========================================

  private nuevoDetalle(): DetalleFormulario {
    return {
      descripcionProducto: '',
      cantidad: 1,
      precioEstimado: 0,
      observaciones: ''
    };
  }

  private nuevaConversion(): ConversionFormulario {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      idCategoria: null,
      precioCompra: 0,
      precioVenta: 0,
      stockMinimo: 0,
      cantidadRecibida: 1,
      motivo: 'Recepción de pedido de cliente'
    };
  }

  // ==========================================
  // CARGAR CLIENTES
  // ==========================================

  cargarClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: response => {
        this.clientes = Array.isArray(response.body)
          ? response.body
          : [];
      },
      error: () => {
        this.error = 'No fue posible cargar los clientes.';
      }
    });
  }

  // ==========================================
  // CARGAR CATEGORIAS
  // ==========================================

  cargarCategorias(): void {
    this.categoriasService.getCategorias().subscribe({
      next: response => {
        this.categorias = Array.isArray(response.body)
          ? response.body
          : [];
      },
      error: () => {
        this.error = 'No fue posible cargar las categorías.';
      }
    });
  }

  // ==========================================
  // CARGAR PEDIDOS
  // ==========================================

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';

    const peticion = this.vista === 'pendientes'
      ? this.pedidosService.listarPendientes()
      : this.pedidosService.listarTodos();

    peticion.subscribe({
      next: response => {
        this.pedidos = Array.isArray(response.body)
          ? response.body
          : [];

        this.aplicarFiltros();
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;

        this.error = err?.error?.mensaje ||
          'No fue posible cargar los pedidos.';
      }
    });
  }

  cambiarVista(vista: 'pendientes' | 'historial'): void {
    this.vista = vista;
    this.filtroEstado = 'TODOS';
    this.busqueda = '';

    this.cargarPedidos();
  }

  // ==========================================
  // FILTROS
  // ==========================================

  aplicarFiltros(): void {
    let resultado = [...this.pedidos];

    if (this.filtroEstado !== 'TODOS') {
      resultado = resultado.filter(
        pedido => pedido.estado === this.filtroEstado
      );
    }

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();

      resultado = resultado.filter(pedido => {
        const cliente = this.obtenerNombreCliente(pedido.idCliente);

        return (
          String(pedido.idPedido).includes(termino) ||
          cliente.toLowerCase().includes(termino) ||
          pedido.estado.toLowerCase().includes(termino)
        );
      });
    }

    this.pedidosFiltrados = resultado;
  }

  // ==========================================
  // REGISTRAR PEDIDO
  // ==========================================

  abrirFormulario(): void {
    this.error = '';
    this.mensaje = '';

    this.idClienteSeleccionado = null;
    this.observacionesPedido = '';

    this.detallesFormulario = [
      this.nuevoDetalle()
    ];

    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  agregarDetalle(): void {
    this.detallesFormulario.push(
      this.nuevoDetalle()
    );
  }

  eliminarDetalle(index: number): void {
    if (this.detallesFormulario.length === 1) {
      this.error = 'El pedido debe tener al menos un detalle.';
      return;
    }

    this.detallesFormulario.splice(index, 1);
    this.error = '';
  }

  registrarPedido(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.idClienteSeleccionado) {
      this.error = 'Selecciona un cliente.';
      return;
    }

    if (!this.usuarioActual?.idUsuario) {
      this.error = 'No se encontró el usuario autenticado. Inicia sesión nuevamente.';
      return;
    }

    if (this.detallesFormulario.length === 0) {
      this.error = 'Agrega al menos un producto al pedido.';
      return;
    }

    const detallesValidos = this.detallesFormulario.every(detalle =>
      detalle.descripcionProducto.trim().length > 0 &&
      Number.isInteger(Number(detalle.cantidad)) &&
      Number(detalle.cantidad) > 0 &&
      Number.isFinite(Number(detalle.precioEstimado)) &&
      Number(detalle.precioEstimado) >= 0
    );

    if (!detallesValidos) {
      this.error = 'Completa la descripción, cantidad y precio de cada detalle.';
      return;
    }

    const detalles: DetallePedidoClienteRequest[] =
      this.detallesFormulario.map(detalle => ({
        descripcionProducto: detalle.descripcionProducto.trim(),
        cantidad: Number(detalle.cantidad),
        precioEstimado: Number(detalle.precioEstimado),
        observaciones: detalle.observaciones.trim()
      }));

    const request: PedidoClienteRequest = {
      idCliente: this.idClienteSeleccionado,
      idUsuario: this.usuarioActual.idUsuario,
      observaciones: this.observacionesPedido.trim(),
      detalles
    };

    this.guardando = true;

    this.pedidosService.registrarPedido(request).subscribe({
      next: response => {
        this.guardando = false;

        if (!response.body) {
          this.error = response.mensaje || 'No se pudo registrar el pedido.';
          return;
        }

        this.mensaje = response.mensaje ||
          'Pedido registrado correctamente.';

        this.mostrarFormulario = false;

        this.cargarPedidos();
        this.cargarResumen();
      },
      error: err => {
        this.guardando = false;

        this.error = err?.error?.mensaje ||
          'Ocurrió un error al registrar el pedido.';
      }
    });
  }

  // ==========================================
  // ACTUALIZAR ESTADO
  // ==========================================

  cambiarEstado(pedido: PedidoCliente, estado: string): void {
    this.error = '';
    this.mensaje = '';

    if (estado === 'RECIBIDO') {
      const confirmar = confirm(
        `¿Confirmas que el pedido #${pedido.idPedido} ya fue recibido?`
      );

      if (!confirmar) {
        this.cargarPedidos();
        return;
      }
    }

    if (estado === 'CANCELADO') {
      const confirmar = confirm(
        `¿Deseas cancelar el pedido #${pedido.idPedido}?`
      );

      if (!confirmar) {
        this.cargarPedidos();
        return;
      }
    }

    this.pedidosService.actualizarEstado(
      pedido.idPedido,
      {
        estado,
        observaciones: pedido.observaciones || ''
      }
    ).subscribe({
      next: response => {
        if (!response.body) {
          this.error = response.mensaje ||
            'No fue posible actualizar el estado.';
          return;
        }

        this.mensaje = response.mensaje ||
          'Estado actualizado correctamente.';

        this.cargarPedidos();
        this.cargarResumen();
      },
      error: err => {
        this.error = err?.error?.mensaje ||
          'Error al actualizar el estado del pedido.';

        this.cargarPedidos();
      }
    });
  }

  // ==========================================
  // CONVERTIR DETALLE EN PRODUCTO
  // ==========================================

  abrirConversion(
    pedido: PedidoCliente,
    detalle: DetallePedidoCliente
  ): void {

    if (pedido.estado !== 'RECIBIDO') {
      this.error = 'El pedido debe estar recibido antes de convertir sus productos.';
      return;
    }

    if (detalle.idProducto) {
      this.error = 'Este detalle ya fue convertido en producto.';
      return;
    }

    this.pedidoSeleccionado = pedido;
    this.detalleSeleccionado = detalle;

    this.conversion = this.nuevaConversion();

    this.conversion.nombre = detalle.descripcionProducto;
    this.conversion.cantidadRecibida = detalle.cantidad;
    this.conversion.precioCompra = detalle.precioEstimado;

    this.mostrarConversion = true;

    this.error = '';
    this.mensaje = '';
  }

  cerrarConversion(): void {
    this.mostrarConversion = false;
    this.pedidoSeleccionado = null;
    this.detalleSeleccionado = null;
  }

  confirmarConversion(): void {

    if (!this.pedidoSeleccionado || !this.detalleSeleccionado) {
      this.error = 'No se seleccionó un detalle para convertir.';
      return;
    }

    if (
      !this.conversion.codigo.trim() ||
      !this.conversion.nombre.trim()
    ) {
      this.error = 'El código y el nombre del producto son obligatorios.';
      return;
    }

    if (
      !Number.isInteger(Number(this.conversion.cantidadRecibida)) ||
      Number(this.conversion.cantidadRecibida) <= 0
    ) {
      this.error = 'La cantidad recibida debe ser un número entero mayor que cero.';
      return;
    }

    if (
      !Number.isFinite(Number(this.conversion.precioCompra)) ||
      !Number.isFinite(Number(this.conversion.precioVenta)) ||
      Number(this.conversion.precioCompra) < 0 ||
      Number(this.conversion.precioVenta) < 0
    ) {
      this.error = 'Los precios deben ser números válidos y no negativos.';
      return;
    }

    if (
      !Number.isInteger(Number(this.conversion.stockMinimo)) ||
      Number(this.conversion.stockMinimo) < 0
    ) {
      this.error = 'El stock mínimo debe ser un número entero no negativo.';
      return;
    }

    const request: RegistrarProductoPedidoRequest = {
      codigo: this.conversion.codigo.trim(),
      nombre: this.conversion.nombre.trim(),
      descripcion: this.conversion.descripcion.trim(),
      idCategoria: this.conversion.idCategoria || undefined,
      precioCompra: Number(this.conversion.precioCompra),
      precioVenta: Number(this.conversion.precioVenta),
      stockMinimo: Number(this.conversion.stockMinimo),
      cantidadRecibida: Number(this.conversion.cantidadRecibida),
      motivo: this.conversion.motivo.trim()
    };

    this.guardando = true;
    this.error = '';

    this.pedidosService.convertirProducto(
      this.pedidoSeleccionado.idPedido,
      this.detalleSeleccionado.idDetallePedido,
      request
    ).subscribe({
      next: response => {
        this.guardando = false;

        if (!response.body) {
          this.error = response.mensaje ||
            'No se pudo convertir el detalle.';
          return;
        }

        this.mensaje = response.mensaje ||
          'Producto registrado y entrada de inventario realizada.';

        this.cerrarConversion();

        this.cargarPedidos();
        this.cargarResumen();
      },
      error: err => {
        this.guardando = false;

        this.error = err?.error?.mensaje ||
          'Ocurrió un error al convertir el detalle.';
      }
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  obtenerNombreCliente(idCliente: number): string {
    const cliente = this.clientes.find(
      item => item.idCliente === idCliente
    );

    return cliente?.nombre || `Cliente #${idCliente}`;
  }

  obtenerTotalEstimado(pedido: PedidoCliente): number {
    return (pedido.detalles || []).reduce(
      (total, detalle) =>
        total +
        Number(detalle.cantidad) *
        Number(detalle.precioEstimado),
      0
    );
  }

  obtenerDetallesConvertidos(pedido: PedidoCliente): number {
    return (pedido.detalles || []).filter(
      detalle => !!detalle.idProducto
    ).length;
  }

  obtenerEstadoClase(estado: string): string {
    const clases: Record<string, string> = {
      REGISTRADO: 'estado-registrado',
      APARTADO: 'estado-apartado',
      PEDIDO_PROVEEDOR: 'estado-proveedor',
      EN_ARRIBO: 'estado-arribo',
      RECIBIDO: 'estado-recibido',
      CONVERTIDO: 'estado-convertido',
      CANCELADO: 'estado-cancelado'
    };

    return clases[estado] || 'estado-default';
  }

  formatearEstado(estado: string): string {
    return estado.replace(/_/g, ' ');
  }

  trackByPedido(
    index: number,
    pedido: PedidoCliente
  ): number {
    return pedido.idPedido;
  }

  trackByDetalle(
    index: number,
    detalle: DetallePedidoCliente
  ): number {
    return detalle.idDetallePedido;
  }
}
