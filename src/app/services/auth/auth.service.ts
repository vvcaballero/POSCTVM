import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  ResponseDTO
} from '../../interfaces/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  private storageKey = 'posctvm_usuario';

  constructor(private http: HttpClient) {}

  // INICIAR SESIÓN
  login(datos: LoginRequest): Observable<ResponseDTO<LoginResponse>> {

    return this.http.post<ResponseDTO<LoginResponse>>(
      `${this.apiUrl}/login`,
      datos
    ).pipe(
      tap(response => {
        if (response.body && response.body.token) {
          sessionStorage.setItem(
            this.storageKey,
            JSON.stringify(response.body)
          );
        }
      })
    );
  }

  // OBTENER USUARIO AUTENTICADO
  getUsuarioActual(): LoginResponse | null {

    const usuario = sessionStorage.getItem(this.storageKey);

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario) as LoginResponse;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }

  // OBTENER TOKEN
  getToken(): string | null {

    const usuario = this.getUsuarioActual();

    return usuario?.token ?? null;
  }

  // CERRAR SESIÓN
  logout(): void {
    sessionStorage.removeItem(this.storageKey);
  }

}