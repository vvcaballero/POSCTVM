import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../interfaces/productos';

export interface ResponseDTO {
  mensaje: string;
  body: Producto[] | Producto | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  // CONSULTAR TODOS
  getProductos(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  // CONSULTAR POR ID
  getProducto(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // REGISTRAR
  crearProducto(producto: Producto): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, producto);
  }

  // ACTUALIZAR
  actualizarProducto(
    id: number,
    producto: Producto
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      producto
    );
  }

  // ELIMINAR LÓGICAMENTE
  eliminarProducto(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }
}