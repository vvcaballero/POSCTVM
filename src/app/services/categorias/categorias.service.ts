
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Categorias } from '../../interfaces/categorias';

export interface ResponseDTO {
  mensaje: string;
  body: Categorias[] | Categorias | any;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private apiUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  // LISTAR CATEGORÍAS
  getCategorias(): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/all`);
  }

  // BUSCAR POR ID
  getCategoria(id: number): Observable<ResponseDTO> {
    return this.http.get<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // REGISTRAR CATEGORÍA
  crearCategoria(categoria: Categorias): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.apiUrl, categoria);
  }

  // ACTUALIZAR CATEGORÍA
  actualizarCategoria(
    id: number,
    categoria: Categorias
  ): Observable<ResponseDTO> {
    return this.http.put<ResponseDTO>(
      `${this.apiUrl}/${id}`,
      categoria
    );
  }

  // ELIMINAR CATEGORÍA
  eliminarCategoria(id: number): Observable<ResponseDTO> {
    return this.http.delete<ResponseDTO>(`${this.apiUrl}/${id}`);
  }

}
