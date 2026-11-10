import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesService } from '../../services/reportes/reportes.service';

interface DashboardData {
  ventasDelDia: {
    cantidadVentas: number;
    totalVentas: number;
  };

  productosRegistrados: number;
  ventasRealizadas: number;

  productosStockBajo: any[];
  ultimasVentas: any[];
  productosMasVendidos: any[];
  movimientosRecientes: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  cargando = false;
  error = '';

  dashboard: DashboardData = {
    ventasDelDia: {
      cantidadVentas: 0,
      totalVentas: 0
    },
    productosRegistrados: 0,
    ventasRealizadas: 0,
    productosStockBajo: [],
    ultimasVentas: [],
    productosMasVendidos: [],
    movimientosRecientes: []
  };

  constructor(
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {

    this.cargando = true;
    this.error = '';

    this.reportesService.obtenerDashboard().subscribe({

      next: (response: any) => {

        if (response?.mensaje === 'OK' && response.body) {

          const data = response.body;

          this.dashboard = {
            ventasDelDia: {
              cantidadVentas: Number(
                data.ventasDelDia?.cantidadVentas ?? 0
              ),
              totalVentas: Number(
                data.ventasDelDia?.totalVentas ?? 0
              )
            },

            productosRegistrados: Number(
              data.productosRegistrados ?? 0
            ),

            ventasRealizadas: Number(
              data.ventasRealizadas ?? 0
            ),

            productosStockBajo:
              data.productosStockBajo ?? [],

            ultimasVentas:
              data.ultimasVentas ?? [],

            productosMasVendidos:
              data.productosMasVendidos ?? [],

            movimientosRecientes:
              data.movimientosRecientes ?? []
          };

        } else {
          this.error = response?.mensaje ||
            'No se pudo obtener la información del Dashboard.';
        }

        this.cargando = false;
      },

      error: (err) => {

        console.error('Error al cargar Dashboard:', err);

        this.error =
          'No se pudo conectar con el servidor. Verifica que Spring Boot esté ejecutándose.';

        this.cargando = false;
      }

    });
  }

  actualizarDashboard(): void {
    this.cargarDashboard();
  }

  get totalVentasHoy(): number {
    return this.dashboard.ventasDelDia.totalVentas;
  }

  get cantidadVentasHoy(): number {
    return this.dashboard.ventasDelDia.cantidadVentas;
  }

  formatearMoneda(valor: number): string {
    return Number(valor || 0).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return 'Sin fecha';
    }

    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerClaseEstado(estado: string): string {

    if (estado === 'PAGADA') {
      return 'estado-pagada';
    }

    if (estado === 'CANCELADA') {
      return 'estado-cancelada';
    }

    return 'estado-pendiente';
  }

  obtenerClaseMovimiento(tipo: string): string {

    if (tipo === 'ENTRADA') {
      return 'movimiento-entrada';
    }

    if (tipo === 'SALIDA') {
      return 'movimiento-salida';
    }

    return 'movimiento-ajuste';
  }

  obtenerNombreMovimiento(tipo: string): string {

    const nombres: Record<string, string> = {
      ENTRADA: 'Entrada',
      SALIDA: 'Salida',
      AJUSTE: 'Ajuste'
    };

    return nombres[tipo] || tipo;
  }

}