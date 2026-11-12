
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

 // private apiUrl = 'http://localhost:8080/api/usuarios';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api/usuarios';


  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  getUsuario(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, usuario);
  }

  actualizarUsuario(
    id: number,
    usuario: Usuario
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      usuario
    );
  }

  eliminarUsuario(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }
}
