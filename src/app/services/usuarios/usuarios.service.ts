import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../../interfaces/usuarios';

export interface ResponseDTO {
  mensaje: string;
  body: any;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  // CONSULTAR TODOS
  getUsuarios(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  // CONSULTAR POR ID
  getUsuario(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // REGISTRAR
  crearUsuario(usuario: Usuario): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, usuario);
  }

  // ACTUALIZAR
  actualizarUsuario(id: number, usuario: Usuario): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(`${this.apiUrl}/${id}`, usuario);
  }

  // ELIMINAR LÓGICAMENTE
  eliminarUsuario(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

}