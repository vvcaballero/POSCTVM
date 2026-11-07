import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { LoginRequest } from '../../interfaces/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  usuario: LoginRequest = {
    username: '',
    password: ''
  };

  cargando = false;
  mostrarPassword = false;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {

    this.mensajeError = '';

    if (!this.usuario.username.trim() || !this.usuario.password) {
      this.mensajeError = 'Ingresa tu usuario y contraseña';
      return;
    }

    this.cargando = true;

    this.authService.login({
      username: this.usuario.username.trim(),
      password: this.usuario.password
    }).subscribe({

      next: (response) => {

        this.cargando = false;

        if (response.body) {
          this.router.navigate(['/dashboard']);
        } else {
          this.mensajeError = response.mensaje;
        }

      },

      error: (error) => {

        this.cargando = false;

        if (error.status === 401) {
          this.mensajeError =
            error.error?.mensaje || 'Usuario o contraseña incorrectos';
        } else if (error.status === 0) {
          this.mensajeError =
            'No se pudo conectar con el servidor. Verifica Spring Boot.';
        } else {
          this.mensajeError =
            error.error?.mensaje || 'Ocurrió un error al iniciar sesión';
        }

      }

    });

  }

}