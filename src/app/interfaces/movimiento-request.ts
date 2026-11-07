export interface MovimientoRequest {
  idProducto: number;
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  idUsuario: number;
}