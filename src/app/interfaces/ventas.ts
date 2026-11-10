
import { DetalleVenta, DetalleVentaRequest } from './detalle-venta';
import { Pagos, PagoRequest } from './pagos';

export interface Ventas {
  idVenta?: number;
  idCliente: number | null;
  idUsuario: number;
  fechaVenta: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'PAGADA' | 'CANCELADA';
}

export interface VentaRequest {
  idCliente: number | null;
  idUsuario: number;
  descuento: number;
  detalles: DetalleVentaRequest[];
  pagos: PagoRequest[];
}

export interface VentaCompleta {
  venta: Ventas;
  detalles: DetalleVenta[];
  pagos: Pagos[];
  cambio: number;
}
