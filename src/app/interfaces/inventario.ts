export interface Inventario {
  idMovimiento?: number;
  idProducto: number;
  idUsuario: number;
  tipo: string;
  cantidad: number;
  motivo: string;
  fecha?: string;
}