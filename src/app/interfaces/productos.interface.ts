export interface Producto {

  idProducto: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  idCategoria: number;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;

}