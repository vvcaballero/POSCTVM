
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

import { Producto } from '../../interfaces/productos';
import { Categorias } from '../../interfaces/categorias';

import { ProductosService } from '../../services/productos/productos.service';
import { CategoriasService } from '../../services/categorias/categorias.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {

  productos = signal<Producto[]>([]);
  categorias = signal<Categorias[]>([]);

  busqueda = signal('');

  productosFiltrados = computed(() => {
    const texto = this.normalizar(this.busqueda());

    if (!texto) {
      return this.productos();
    }

    return this.productos().filter(producto => {
      const categoria = this.obtenerNombreCategoria(producto.idCategoria);

      const valores = [
        producto.idProducto,
        producto.codigo,
        producto.nombre,
        producto.descripcion,
        categoria,
        producto.precioCompra,
        producto.precioVenta,
        producto.stock,
        producto.stockMinimo,
        producto.activo ? 'activo' : 'inactivo'
      ];

      return valores.some(valor =>
        this.normalizar(String(valor ?? '')).includes(texto)
      );
    });
  });

  mostrarFormulario = signal(false);
  editando = signal(false);

  producto: Producto = this.productoVacio();

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.listarProductos();
    this.listarCategorias();
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  productoVacio(): Producto {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      idCategoria: 0,
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMinimo: 0,
      activo: true
    };
  }

  listarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: response => {
        if (response.mensaje === 'OK' && Array.isArray(response.body)) {
          this.productos.set(response.body);
        }
      },
      error: err => {
        console.error('Error al obtener productos', err);
      }
    });
  }

  listarCategorias(): void {
    this.categoriasService.getCategorias().subscribe({
      next: response => {
        if (response.mensaje === 'OK' && Array.isArray(response.body)) {
          this.categorias.set(response.body);
        }
      },
      error: err => {
        console.error('Error al obtener categorías', err);
      }
    });
  }

  nuevoProducto(): void {
    this.producto = this.productoVacio();
    this.editando.set(false);
    this.mostrarFormulario.set(true);
  }

  editarProducto(producto: Producto): void {
    this.producto = { ...producto };
    this.editando.set(true);
    this.mostrarFormulario.set(true);
  }

  guardarProducto(): void {

    if (
      !this.producto.codigo.trim() ||
      !this.producto.nombre.trim() ||
      !this.producto.idCategoria
    ) {
      alert('Completa los campos obligatorios.');
      return;
    }

    if (this.editando() && this.producto.idProducto) {

      this.productosService.actualizarProducto(
        this.producto.idProducto,
        this.producto
      ).subscribe({
        next: response => {
          alert(response.mensaje);
          this.cancelarFormulario();
          this.listarProductos();
        },
        error: err => {
          console.error('Error al actualizar producto', err);
          alert('No fue posible actualizar el producto.');
        }
      });

    } else {

      this.productosService.crearProducto(this.producto).subscribe({
        next: response => {
          alert(response.mensaje);
          this.cancelarFormulario();
          this.listarProductos();
        },
        error: err => {
          console.error('Error al registrar producto', err);
          alert('No fue posible registrar el producto.');
        }
      });

    }
  }

  eliminarProducto(id: number): void {

    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    this.productosService.eliminarProducto(id).subscribe({
      next: response => {
        alert(response.mensaje);
        this.listarProductos();
      },
      error: err => {
        console.error('Error al eliminar producto', err);
        alert('No fue posible eliminar el producto.');
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.editando.set(false);
    this.producto = this.productoVacio();
  }

  obtenerNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias().find(
      c => c.idCategoria === idCategoria
    );

    return categoria ? categoria.nombre : 'Sin categoría';
  }


esAdmin(): boolean {
  return this.authService.getUsuarioActual()?.rol?.toUpperCase() === 'ADMIN';
}

  
}
