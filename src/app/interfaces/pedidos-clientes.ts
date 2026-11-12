
export interface DetallePedidoClienteRequest {
  descripcionProducto: string;
  cantidad: number;
  precioEstimado: number;
  observaciones?: string;
}

export interface PedidoClienteRequest {
  idCliente: number;
  idUsuario: number;
  observaciones?: string;
  detalles: DetallePedidoClienteRequest[];
}

export interface EstadoPedidoRequest {
  estado: string;
  observaciones?: string;
}

export interface RegistrarProductoPedidoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  idCategoria?: number;
  precioCompra?: number;
  precioVenta?: number;
  stockMinimo?: number;
  cantidadRecibida?: number;
  motivo?: string;
}

export interface DetallePedidoCliente {
  idDetallePedido: number;
  idProducto?: number | null;
  descripcionProducto: string;
  cantidad: number;
  precioEstimado: number;
  observaciones?: string;
}

export interface PedidoCliente {
  idPedido: number;
  idCliente: number;
  idUsuario: number;
  fechaPedido: string;
  estado: string;
  observaciones?: string;
  fechaRecepcion?: string | null;
  fechaConversion?: string | null;
  detalles: DetallePedidoCliente[];
}

export interface PedidoResponseDTO<T> {
  mensaje: string;
  body: T | null;
}
