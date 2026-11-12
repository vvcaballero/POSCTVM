
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

  //private apiUrl = 'http://localhost:8080/api/auth';
  private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api';
  private storageKey = 'posctvm_usuario';

  constructor(private http: HttpClient) {}

  login(
    datos: LoginRequest
  ): Observable<ResponseDTO<LoginResponse>> {
    return this.http.post<ResponseDTO<LoginResponse>>(
      `${this.apiUrl}/login`,
      datos
    ).pipe(
      tap(response => {
        if (response.body) {
          sessionStorage.setItem(
            this.storageKey,
            JSON.stringify(response.body)
          );
        }
      })
    );
  }

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

  getToken(): string | null {
    return this.getUsuarioActual()?.token ?? null;
  }

  logout(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}