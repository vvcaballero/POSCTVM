export interface Inventario {
  
  idMovimiento?: number;
  idProducto: number;
  idUsuario: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  fecha: string;
}