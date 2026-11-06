import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Clientes } from '../../interfaces/clientes';

export interface ResponseDTO {
  mensaje: string;
  body: Clientes[] | Clientes | any;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private apiUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  // LISTAR CLIENTES
  getClientes(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  // BUSCAR CLIENTE POR ID
  getCliente(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // REGISTRAR CLIENTE
  crearCliente(cliente: Clientes): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, cliente);
  }

  // ACTUALIZAR CLIENTE
  actualizarCliente(
    id: number,
    cliente: Clientes
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      cliente
    );
  }

  // ELIMINAR CLIENTE
  eliminarCliente(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

}