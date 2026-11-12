
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Clientes } from '../../interfaces/clientes';

export interface ResponseDTO {
  mensaje: string;
  body: Clientes[] | Clientes | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

 // private apiUrl = 'http://localhost:8080/api/clientes';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api';


  constructor(private http: HttpClient) {}

  getClientes(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  getCliente(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  crearCliente(cliente: Clientes): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, cliente);
  }

  actualizarCliente(
    id: number,
    cliente: Clientes
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      cliente
    );
  }

  eliminarCliente(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }
}