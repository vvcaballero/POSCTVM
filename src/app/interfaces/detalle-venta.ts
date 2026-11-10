
export interface DetalleVenta {
  
  idDetalle?: number;
  idVenta: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
}
