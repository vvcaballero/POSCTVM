
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

  //private apiUrl = 'http://localhost:8080/api/productos';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api/productos';


  constructor(private http: HttpClient) {}

  getProductos(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  getProducto(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Producto): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, producto);
  }

  actualizarProducto(
    id: number,
    producto: Producto
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      producto
    );
  }

  eliminarProducto(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }
}
