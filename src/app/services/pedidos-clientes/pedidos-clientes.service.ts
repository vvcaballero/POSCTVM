
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PedidoCliente,
  PedidoClienteRequest,
  EstadoPedidoRequest,
  RegistrarProductoPedidoRequest,
  PedidoResponseDTO
} from '../../interfaces/pedidos-clientes';

@Injectable({
  providedIn: 'root'
})
export class PedidosClientesService {

 // private apiUrl = 'http://localhost:8080/api/pedidos-clientes';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api';


  constructor(private http: HttpClient) {}

  listarTodos(): Observable<PedidoResponseDTO<PedidoCliente[]>> {
    return this.http.get<PedidoResponseDTO<PedidoCliente[]>>(
      `${this.apiUrl}/all`
    );
  }

  listarPendientes(): Observable<PedidoResponseDTO<PedidoCliente[]>> {
    return this.http.get<PedidoResponseDTO<PedidoCliente[]>>(
      `${this.apiUrl}/pendientes`
    );
  }

  buscarPorId(id: number): Observable<PedidoResponseDTO<PedidoCliente>> {
    return this.http.get<PedidoResponseDTO<PedidoCliente>>(
      `${this.apiUrl}/${id}`
    );
  }

  registrarPedido(
    pedido: PedidoClienteRequest
  ): Observable<PedidoResponseDTO<PedidoCliente>> {
    return this.http.post<PedidoResponseDTO<PedidoCliente>>(
      this.apiUrl,
      pedido
    );
  }

  actualizarEstado(
    id: number,
    request: EstadoPedidoRequest
  ): Observable<PedidoResponseDTO<PedidoCliente>> {
    return this.http.put<PedidoResponseDTO<PedidoCliente>>(
      `${this.apiUrl}/${id}/estado`,
      request
    );
  }

  convertirProducto(
    idPedido: number,
    idDetalle: number,
    request: RegistrarProductoPedidoRequest
  ): Observable<PedidoResponseDTO<any>> {
    return this.http.post<PedidoResponseDTO<any>>(
      `${this.apiUrl}/${idPedido}/detalles/${idDetalle}/convertir`,
      request
    );
  }
}
