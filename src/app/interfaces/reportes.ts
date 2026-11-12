export interface ApiResponse<T> {
  mensaje: string;
  body: T;
}

export interface ResumenReporte {
  cantidadVentas: number;
  subtotal: number;
  descuentos: number;
  totalVentas: number;
}

export interface VentaDiaria {
  fecha: string;
  cantidadVentas: number;
  totalVentas: number;
}

export interface VentaUsuario {
  idUsuario: number;
  nombreUsuario: string;
  cantidadVentas: number;
  totalVentas: number;
}

export interface VentaCliente {
  idCliente: number;
  nombreCliente: string;
  cantidadCompras: number;
  totalComprado: number;
}

export interface MetodoPago {
  metodoPago: string;
  total: number;
  cantidadPagos: number;
}

export interface ProductoMasVendido {
  idProducto: number;
  nombre: string;
  unidadesVendidas: number;
}