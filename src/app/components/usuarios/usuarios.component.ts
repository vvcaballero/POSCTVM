import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { Usuario } from '../../interfaces/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  usuarios = signal<Usuario[]>([]);

  mostrarFormulario = signal(false);
  modoEdicion = signal(false);

  idUsuarioEditar?: number;

  usuarioFormulario: Usuario = this.nuevoUsuario();

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.listarUsuarios();
  }

  nuevoUsuario(): Usuario {
    return {
      nombre: '',
      username: '',
      password: '',
      rol: 'CAJERO',
      activo: true
    };
  }

  // CONSULTAR TODOS
  listarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (respuesta) => {
        this.usuarios.set(respuesta.body ?? []);
        console.log('Usuarios obtenidos:', respuesta.body);
      },
      error: (error) => {
        console.error('Error al consultar usuarios:', error);
        alert('No se pudieron consultar los usuarios.');
      }
    });
  }

  // ABRIR FORMULARIO PARA NUEVO USUARIO
  nuevoRegistro(): void {
    this.usuarioFormulario = this.nuevoUsuario();
    this.idUsuarioEditar = undefined;

    this.modoEdicion.set(false);
    this.mostrarFormulario.set(true);
  }

  // CARGAR USUARIO PARA EDITAR
  editarUsuario(usuario: Usuario): void {
    this.idUsuarioEditar = usuario.idUsuario;

    this.usuarioFormulario = {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      username: usuario.username,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo
    };

    this.modoEdicion.set(true);
    this.mostrarFormulario.set(true);
  }

  // GUARDAR: REGISTRAR O ACTUALIZAR
  guardarUsuario(): void {

    if (!this.usuarioFormulario.nombre.trim() ||
        !this.usuarioFormulario.username.trim() ||
        !this.usuarioFormulario.rol) {
      alert('Completa los campos obligatorios.');
      return;
    }

    if (!this.modoEdicion() && !this.usuarioFormulario.password) {
      alert('La contraseña es obligatoria para registrar un usuario.');
      return;
    }

    const usuario: Usuario = { ...this.usuarioFormulario };

    if (this.modoEdicion()) {

      // Si no se captura una contraseña nueva, no se envía
      if (!usuario.password) {
        delete usuario.password;
      }

      this.usuariosService.actualizarUsuario(
        this.idUsuarioEditar!,
        usuario
      ).subscribe({
        next: (respuesta) => {
          alert(respuesta.mensaje || 'Usuario actualizado correctamente.');
          this.cancelarFormulario();
          this.listarUsuarios();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          alert('No se pudo actualizar el usuario.');
        }
      });

    } else {

      this.usuariosService.crearUsuario(usuario).subscribe({
        next: (respuesta) => {
          alert(respuesta.mensaje || 'Usuario registrado correctamente.');
          this.cancelarFormulario();
          this.listarUsuarios();
        },
        error: (error) => {
          console.error('Error al registrar usuario:', error);
          alert('No se pudo registrar el usuario.');
        }
      });

    }
  }

  // ELIMINAR LÓGICAMENTE
  eliminarUsuario(usuario: Usuario): void {

    const confirmar = confirm(
      `¿Deseas eliminar al usuario ${usuario.nombre}?`
    );

    if (!confirmar || !usuario.idUsuario) {
      return;
    }

    this.usuariosService.eliminarUsuario(usuario.idUsuario).subscribe({
      next: (respuesta) => {
        alert(respuesta.mensaje || 'Usuario eliminado correctamente.');
        this.listarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        alert('No se pudo eliminar el usuario.');
      }
    });
  }

  // CERRAR FORMULARIO
  cancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.modoEdicion.set(false);
    this.idUsuarioEditar = undefined;
    this.usuarioFormulario = this.nuevoUsuario();
  }

}