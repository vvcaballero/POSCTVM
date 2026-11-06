import { ProductosService } from './../../services/productos/productos.service';
import { Producto } from './../../interfaces/productos.interface';
import { Component, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {

  productos = signal<Producto[]>([]);

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {

    this.productosService.getProductos().subscribe({

      next: (response) => {

        if (response.mensaje === 'OK') {
          this.productos.set(response.body);
        }

      },

      error: (err) => {
        console.error('Error al obtener productos', err);
      }

    });

  }
}