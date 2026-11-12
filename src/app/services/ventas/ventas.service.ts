
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Ventas,
  VentaCompleta,
  VentaRequest
} from '../../interfaces/ventas';

export interface ResponseDTO<T> {
  mensaje: string;
  body: T | null;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  //private apiUrl = 'http://localhost:8080/api/ventas';
   private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api/ventas';


  constructor(private http: HttpClient) {}

  // HISTORIAL DE VENTAS
  getVentas(): Observable<ResponseDTO<Ventas[]>> {
    return this.http.get<ResponseDTO<Ventas[]>>(
      `${this.apiUrl}/all`
    );
  }

  // CONSULTAR DETALLE DE UNA VENTA
  getVenta(id: number): Observable<ResponseDTO<VentaCompleta>> {
    return this.http.get<ResponseDTO<VentaCompleta>>(
      `${this.apiUrl}/${id}`
    );
  }

  // REGISTRAR VENTA
  crearVenta(
    venta: VentaRequest
  ): Observable<ResponseDTO<VentaCompleta>> {
    return this.http.post<ResponseDTO<VentaCompleta>>(
      this.apiUrl,
      venta
    );
  }

  // CANCELAR VENTA
  cancelarVenta(id: number): Observable<ResponseDTO<Ventas>> {
    return this.http.delete<ResponseDTO<Ventas>>(
      `${this.apiUrl}/${id}`
    );
  }
}
