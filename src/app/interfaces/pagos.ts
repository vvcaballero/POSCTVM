
export interface Pagos {
  idPago?: number;
  idVenta: number;
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  monto: number;
  referencia?: string;
  fechaPago?: string;
}

export interface PagoRequest {
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  monto: number;
}
