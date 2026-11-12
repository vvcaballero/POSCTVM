import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  ResumenReporte,
  VentaDiaria,
  VentaUsuario,
  VentaCliente,
  MetodoPago,
  ProductoMasVendido
} from '../../interfaces/reportes';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  //private readonly apiUrl = 'http://localhost:8080/api/reportes';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api';


  constructor(private http: HttpClient) {}

  private parametrosFecha(desde: string, hasta: string): HttpParams {
    return new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
  }

  obtenerResumen(
    desde: string,
    hasta: string
  ): Observable<ApiResponse<ResumenReporte>> {

    return this.http.get<ApiResponse<ResumenReporte>>(
      `${this.apiUrl}/resumen`,
      { params: this.parametrosFecha(desde, hasta) }
    );
  }

  obtenerVentasDiarias(
    desde: string,
    hasta: string
  ): Observable<ApiResponse<VentaDiaria[]>> {

    return this.http.get<ApiResponse<VentaDiaria[]>>(
      `${this.apiUrl}/ventas-diarias`,
      { params: this.parametrosFecha(desde, hasta) }
    );
  }

  obtenerVentasPorUsuario(
    desde: string,
    hasta: string
  ): Observable<ApiResponse<VentaUsuario[]>> {

    return this.http.get<ApiResponse<VentaUsuario[]>>(
      `${this.apiUrl}/por-usuario`,
      { params: this.parametrosFecha(desde, hasta) }
    );
  }

  obtenerVentasPorCliente(
    desde: string,
    hasta: string
  ): Observable<ApiResponse<VentaCliente[]>> {

    return this.http.get<ApiResponse<VentaCliente[]>>(
      `${this.apiUrl}/por-cliente`,
      { params: this.parametrosFecha(desde, hasta) }
    );
  }

  obtenerMetodosPago(
    desde: string,
    hasta: string
  ): Observable<ApiResponse<MetodoPago[]>> {

    return this.http.get<ApiResponse<MetodoPago[]>>(
      `${this.apiUrl}/metodos-pago`,
      { params: this.parametrosFecha(desde, hasta) }
    );
  }

  obtenerProductosMasVendidos(
    desde: string,
    hasta: string,
    limite: number = 5
  ): Observable<ApiResponse<ProductoMasVendido[]>> {

    const params = this.parametrosFecha(desde, hasta)
      .set('limite', limite);

    return this.http.get<ApiResponse<ProductoMasVendido[]>>(
      `${this.apiUrl}/productos-periodo`,
      { params }
    );
  }

obtenerDashboard(): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(
    `${this.apiUrl}/dashboard`
  );
}

}