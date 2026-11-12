import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Categorias } from '../../interfaces/categorias';
import { CategoriasService } from '../../services/categorias/categorias.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {

  categorias: Categorias[] = [];

  categoria: Categorias = this.nuevaCategoria();

  editando = false;
  cargando = false;
  mensaje = '';
  error = '';

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.listarCategorias();
  }

  nuevaCategoria(): Categorias {
    return {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }

  listarCategorias(): void {
    this.cargando = true;
    this.error = '';

    this.categoriasService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = Array.isArray(response.body)
          ? response.body
          : [];

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al consultar categorías:', err);
        this.error = 'No fue posible cargar las categorías.';
        this.cargando = false;
      }
    });
  }

  guardarCategoria(): void {
    if (!this.categoria.nombre.trim()) {
      this.error = 'El nombre de la categoría es obligatorio.';
      return;
    }

    this.error = '';
    this.mensaje = '';

    if (this.editando && this.categoria.idCategoria) {
      this.categoriasService.actualizarCategoria(
        this.categoria.idCategoria,
        this.categoria
      ).subscribe({
        next: (response) => {
          this.mensaje = response.mensaje || 'Categoría actualizada correctamente.';
          this.listarCategorias();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.error = 'No fue posible actualizar la categoría.';
        }
      });

    } else {
      this.categoriasService.crearCategoria(
        this.categoria
      ).subscribe({
        next: (response) => {
          this.mensaje = response.mensaje || 'Categoría registrada correctamente.';
          this.listarCategorias();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          this.error = 'No fue posible registrar la categoría.';
        }
      });
    }
  }

  editarCategoria(categoria: Categorias): void {
    this.categoria = { ...categoria };
    this.editando = true;
    this.mensaje = '';
    this.error = '';
  }

  eliminarCategoria(id?: number): void {
    if (!id) {
      return;
    }

    if (!confirm('¿Deseas desactivar esta categoría?')) {
      return;
    }

    this.categoriasService.eliminarCategoria(id).subscribe({
      next: (response) => {
        this.mensaje = response.mensaje || 'Categoría desactivada correctamente.';
        this.listarCategorias();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.error = 'No fue posible desactivar la categoría.';
      }
    });
  }

  limpiarFormulario(): void {
    this.categoria = this.nuevaCategoria();
    this.editando = false;
    this.error = '';
  }
}