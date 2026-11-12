import { UsuariosService } from './../../services/usuarios/usuarios.service';
import { Usuario } from './../../interfaces/usuarios.interface';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
})

export class UsuariosComponent {
  usuarios = signal<Usuario[]>([]); // signal para la lista de usuarios

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error al obtener usuarios', err),
    });
  }
}
