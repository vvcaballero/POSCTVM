import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../interfaces/productos.interface';


export interface ResponseDTO {
  mensaje: string;
  body: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }
}