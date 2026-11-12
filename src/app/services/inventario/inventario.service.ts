import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Inventario } from '../../interfaces/inventario';
import { MovimientoRequest } from '../../interfaces/movimiento-request';

export interface ResponseDTO {
  mensaje: string;
  body: Inventario[] | Inventario | null;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  //private apiUrl = 'http://localhost:8080/api/inventario';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api';


  constructor(private http: HttpClient) {}

  getMovimientos(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  getMovimientosPorProducto(idProducto: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(
      `${this.apiUrl}/producto/${idProducto}`
    );
  }

  registrarMovimiento(
    movimiento: MovimientoRequest
  ): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(
      this.apiUrl,
      movimiento
    );
  }
}