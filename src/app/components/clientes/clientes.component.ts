import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Clientes } from '../../interfaces/clientes';
import { ClientesService } from '../../services/clientes/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {

  clientes: Clientes[] = [];

  cliente: Clientes = this.nuevoCliente();

  editando = false;
  cargando = false;
  mensaje = '';
  error = '';

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.listarClientes();
  }

  nuevoCliente(): Clientes {
    return {
      nombre: '',
      telefono: '',
      email: '',
      direccion: ''
    };
  }

  // LISTAR CLIENTES
  listarClientes(): void {
    this.cargando = true;
    this.error = '';

    this.clientesService.getClientes().subscribe({
      next: (response) => {
        this.clientes = Array.isArray(response.body)
          ? response.body
          : [];

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al consultar clientes:', err);
        this.error = 'No fue posible cargar los clientes.';
        this.cargando = false;
      }
    });
  }

  // GUARDAR O ACTUALIZAR
  guardarCliente(): void {

    if (!this.cliente.nombre.trim()) {
      this.error = 'El nombre del cliente es obligatorio.';
      return;
    }

    this.error = '';
    this.mensaje = '';

    if (this.editando && this.cliente.idCliente) {

      this.clientesService.actualizarCliente(
        this.cliente.idCliente,
        this.cliente
      ).subscribe({
        next: (response) => {
          this.mensaje = response.mensaje ||
            'Cliente actualizado correctamente.';

          this.listarClientes();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.error = 'No fue posible actualizar el cliente.';
        }
      });

    } else {

      this.clientesService.crearCliente(
        this.cliente
      ).subscribe({
        next: (response) => {
          this.mensaje = response.mensaje ||
            'Cliente registrado correctamente.';

          this.listarClientes();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          this.error = 'No fue posible registrar el cliente.';
        }
      });

    }
  }

  // EDITAR CLIENTE
  editarCliente(cliente: Clientes): void {
    this.cliente = { ...cliente };
    this.editando = true;
    this.mensaje = '';
    this.error = '';
  }

  // ELIMINAR CLIENTE
  eliminarCliente(id?: number): void {

    if (!id) {
      return;
    }

    if (!confirm('¿Deseas eliminar este cliente?')) {
      return;
    }

    this.clientesService.eliminarCliente(id).subscribe({
      next: (response) => {
        this.mensaje = response.mensaje ||
          'Cliente eliminado correctamente.';

        this.listarClientes();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.error = 'No fue posible eliminar el cliente.';
      }
    });
  }

  // LIMPIAR FORMULARIO
  limpiarFormulario(): void {
    this.cliente = this.nuevoCliente();
    this.editando = false;
    this.error = '';
  }

}