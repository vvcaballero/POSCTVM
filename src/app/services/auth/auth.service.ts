
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, tap } from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  ResponseDTO
} from '../../interfaces/login';


import { RsaEncryptionService } from '../security/rsa-encryption.service';
interface PublicKeyResponse {
  publicKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Desarrollo local
 // private apiUrl = 'http://localhost:8080/api/auth';

  // Producción
   private apiUrl = 'https://ventas-pos-production-19f004a6.up.railway.app/api/auth';

  private storageKey = 'posctvm_usuario';

constructor(
  private http: HttpClient,
  private rsaEncryptionService: RsaEncryptionService
) {}

  login(
    datos: LoginRequest
  ): Observable<ResponseDTO<LoginResponse>> {

    // 1. Obtener clave pública
    return this.http.get<PublicKeyResponse>(
      `${this.apiUrl}/public-key`
    ).pipe(

      // 2. Cifrar password
      switchMap(response =>
        from(
          this.rsaEncryptionService.encryptPassword(
            datos.password,
            response.publicKey
          )
        )
      ),

      // 3. Enviar usuario y password cifrado
      switchMap(encryptedPassword => {

        const request: LoginRequest = {
          username: datos.username,
          password: encryptedPassword
        };

        return this.http.post<ResponseDTO<LoginResponse>>(
          `${this.apiUrl}/login`,
          request
        );
      }),

      // 4. Guardar respuesta del login
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

    if (!usuario) return null;

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
