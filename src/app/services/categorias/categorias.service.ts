
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Categorias } from '../../interfaces/categorias';

export interface ResponseDTO {
  mensaje: string;
  body: Categorias[] | Categorias | null;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  //private apiUrl = 'http://localhost:8080/api/categorias';
    private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api/categorias';


  constructor(private http: HttpClient) {}

  getCategorias(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  getCategoria(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  crearCategoria(categoria: Categorias): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, categoria);
  }

  actualizarCategoria(
    id: number,
    categoria: Categorias
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      categoria
    );
  }

  eliminarCategoria(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }
}