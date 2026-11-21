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
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

  mostrarModalWhatsApp = false;
  telefonoWhatsApp = '';

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

  get idUsuario(): number | null {
    const usuario: any = this.authService.getUsuarioActual();
    const id = usuario?.idUsuario ?? usuario?.id ?? null;

    return id !== null && id !== undefined ? Number(id) : null;
  }

  get nombreUsuarioLogueado(): string {
    const usuario: any = this.authService.getUsuarioActual();

    return usuario?.nombre ??
      usuario?.nombreUsuario ??
      usuario?.username ??
      usuario?.usuario ??
      'Usuario';
  }

  cargarDatos(): void {
    this.cargando = true;

    forkJoin({
      productos: this.productosService.getProductos(),
      clientes: this.clientesService.getClientes()
    }).subscribe({
      next: response => {
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

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(producto => {
      const nombre = (producto.nombre ?? '').toLowerCase();
      const codigo = (producto.codigo ?? '').toLowerCase();

      return producto.activo !== false &&
        Number(producto.stock) > 0 &&
        (nombre.includes(texto) || codigo.includes(texto));
    });
  }

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
      this.carrito.push({ producto, cantidad: 1 });
    }

    this.ultimaVenta = null;
    this.mensaje = '';
  }

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

  disminuirCantidad(item: ProductoCarrito): void {
    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      this.eliminarProducto(item);
    }
  }

  eliminarProducto(item: ProductoCarrito): void {
    this.carrito = this.carrito.filter(
      producto =>
        producto.producto.idProducto !== item.producto.idProducto
    );
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.descuento = 0;
    this.montoRecibido = 0;
    this.mensaje = '';
  }

  get subtotal(): number {
    return this.carrito.reduce(
      (total, item) =>
        total + Number(item.producto.precioVenta) * item.cantidad,
      0
    );
  }

  get descuentoValido(): number {
    const valor = Number(this.descuento) || 0;

    return Math.min(Math.max(valor, 0), this.subtotal);
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.descuentoValido);
  }

  get cantidadProductos(): number {
    return this.carrito.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }

  get cambio(): number {
    if (this.metodoPago !== 'EFECTIVO') {
      return 0;
    }

    return Math.max(0, (Number(this.montoRecibido) || 0) - this.total);
  }

  get pagoValido(): boolean {
    if (this.metodoPago === 'EFECTIVO') {
      return Number(this.montoRecibido) >= this.total;
    }

    return true;
  }

  cambiarMetodoPago(): void {
    if (this.metodoPago !== 'EFECTIVO') {
      this.montoRecibido = this.total;
    } else {
      this.montoRecibido = 0;
    }
  }

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
      this.mostrarMensaje('Agrega al menos un producto al carrito.', 'error');
      return;
    }

    if (this.total <= 0) {
      this.mostrarMensaje('El total de la venta debe ser mayor a cero.', 'error');
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && !this.pagoValido) {
      this.mostrarMensaje(
        'El efectivo recibido no cubre el total de la venta.',
        'error'
      );
      return;
    }

    const stockInsuficiente = this.carrito.find(
      item => item.cantidad > Number(item.producto.stock)
    );

    if (stockInsuficiente) {
      this.mostrarMensaje(
        `Stock insuficiente para ${stockInsuficiente.producto.nombre}.`,
        'error'
      );
      this.cargarDatos();
      return;
    }

    if (
      !Number.isFinite(Number(this.descuento)) ||
      Number(this.descuento) < 0 ||
      Number(this.descuento) > this.subtotal
    ) {
      this.mostrarMensaje('El descuento no es válido.', 'error');
      return;
    }

    const montoPago = this.metodoPago === 'EFECTIVO'
      ? Number(this.montoRecibido)
      : this.total;

    const pagos: PagoRequest[] = [{
      metodoPago: this.metodoPago,
      monto: montoPago
    }];

    const venta: VentaRequest = {
      idCliente: this.idCliente,
      idUsuario,
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

        if (!body || !('venta' in body) || !body.venta?.idVenta) {
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

        this.carrito = [];
        this.descuento = 0;
        this.montoRecibido = 0;
        this.idCliente = null;
        this.busqueda = '';
        this.metodoPago = 'EFECTIVO';

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

  mostrarMensaje(
    mensaje: string,
    tipo: 'success' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }

  get nombreClienteVenta(): string {
    if (!this.ultimaVenta?.venta?.idCliente) {
      return 'Público general';
    }

    const cliente = this.clientes.find(
      item => item.idCliente === this.ultimaVenta?.venta.idCliente
    );

    return cliente?.nombre || 'Cliente';
  }

  obtenerNombreProducto(idProducto: number): string {
    const producto = this.productos.find(
      p => p.idProducto === idProducto
    );

    return producto?.nombre || `Producto #${idProducto}`;
  }

  imprimirTicket(): void {
    if (!this.ultimaVenta) {
      return;
    }

    window.print();
  }

  abrirModalWhatsApp(): void {
    if (!this.ultimaVenta) {
      this.mostrarMensaje('No hay una venta para enviar.', 'error');
      return;
    }

    this.telefonoWhatsApp = '';
    this.mostrarModalWhatsApp = true;
  }

  cerrarModalWhatsApp(): void {
    this.mostrarModalWhatsApp = false;
    this.telefonoWhatsApp = '';
  }

  

async enviarTicketWhatsApp(): Promise<void> {
  if (!this.ultimaVenta) {
    this.mostrarMensaje('No hay una venta para compartir.', 'error');
    return;
  }

  try {
    const archivo = await this.generarTicketPDF();

    const venta = this.ultimaVenta;

    const texto =
      `Comprobante de compra POSCTVM.\n` +
      `Folio: #${venta.venta.idVenta}\n` +
      `Total: ${new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(Number(venta.venta.total) || 0)}`;

    const navegador = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };

    const datosCompartir: ShareData = {
      files: [archivo],
      title: `Ticket #${venta.venta.idVenta}`,
      text: texto
    };

    // Intentar compartir el PDF directamente.
    if (
      typeof navigator.share === 'function' &&
      typeof navegador.canShare === 'function' &&
      navegador.canShare({ files: [archivo] })
    ) {
      await navigator.share(datosCompartir);

      this.cerrarModalWhatsApp();

      this.mostrarMensaje(
        'Se abrió la opción para compartir el ticket. Selecciona WhatsApp y el destinatario.',
        'success'
      );

      return;
    }

    // Alternativa para navegadores que no permiten compartir archivos.
    this.descargarTicketPDF(archivo);

    this.cerrarModalWhatsApp();

    this.mostrarMensaje(
      'El ticket PDF se descargó. Ahora puedes adjuntarlo en el chat de WhatsApp del cliente.',
      'success'
    );

  } catch (error: any) {

    // El usuario puede cancelar voluntariamente el menú de compartir.
    if (error?.name === 'AbortError') {
      return;
    }

    console.error('Error al generar o compartir ticket:', error);

    this.mostrarMensaje(
      'No fue posible generar o compartir el ticket PDF.',
      'error'
    );
  }
}


private async generarTicketPDF(): Promise<File> {
  if (!this.ultimaVenta) {
    throw new Error('No existe una venta para generar el ticket.');
  }

  const ticket = document.querySelector('.ticket-print') as HTMLElement | null;

  if (!ticket) {
    throw new Error('No se encontró el contenido del ticket.');
  }

  // Guardar los estilos originales para no afectar la impresión.
  const estilosOriginales = ticket.getAttribute('style');

  try {
    // Mostrar temporalmente el ticket para poder capturarlo.
    ticket.style.setProperty('display', 'block', 'important');
    ticket.style.position = 'fixed';
    ticket.style.left = '0';
    ticket.style.top = '0';
    ticket.style.width = '72mm';
    ticket.style.maxWidth = '72mm';
    ticket.style.margin = '0';
    ticket.style.padding = '4mm';
    ticket.style.boxSizing = 'border-box';
    ticket.style.background = '#ffffff';
    ticket.style.opacity = '0.01';
    ticket.style.zIndex = '2147483647';

    const canvas = await html2canvas(ticket, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: Math.max(window.innerWidth, 800),

      // Ajustar la copia que html2canvas utiliza para capturar.
      onclone: (documentoClonado) => {
        const ticketClonado = documentoClonado.querySelector(
          '.ticket-print'
        ) as HTMLElement | null;

        if (ticketClonado) {
          ticketClonado.style.setProperty('display', 'block', 'important');
          ticketClonado.style.setProperty('opacity', '1', 'important');
          ticketClonado.style.position = 'static';
          ticketClonado.style.left = 'auto';
          ticketClonado.style.top = 'auto';
          ticketClonado.style.zIndex = 'auto';
          ticketClonado.style.width = '72mm';
          ticketClonado.style.maxWidth = '72mm';
          ticketClonado.style.margin = '0';
          ticketClonado.style.padding = '4mm';
        }
      }
    });

    if (!canvas.width || !canvas.height) {
      throw new Error('No fue posible capturar el ticket.');
    }

    // Configuración de papel térmico de 80 mm.
    const anchoPagina = 80;
    const margen = 4;
    const anchoContenido = 72;

    const altoContenido =
      canvas.height * (anchoContenido / canvas.width);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [anchoPagina, altoContenido + (margen * 2)],
      compress: true
    });

    const imagen = canvas.toDataURL('image/jpeg', 0.95);

    pdf.addImage(
      imagen,
      'JPEG',
      margen,
      margen,
      anchoContenido,
      altoContenido
    );

    const archivo = pdf.output('blob');

    return new File(
      [archivo],
      `ticket-${this.ultimaVenta.venta.idVenta}.pdf`,
      { type: 'application/pdf' }
    );

  } finally {
    // Restaurar los estilos originales.
    if (estilosOriginales === null) {
      ticket.removeAttribute('style');
    } else {
      ticket.setAttribute('style', estilosOriginales);
    }
  }
}

private descargarTicketPDF(archivo: File): void {
  const url = URL.createObjectURL(archivo);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = archivo.name;

  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}




}