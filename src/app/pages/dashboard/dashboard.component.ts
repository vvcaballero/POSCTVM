import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesService } from '../../services/reportes/reportes.service';

interface VentaReciente {
  id?: number;
  fecha?: any;
  fechaVenta?: any;
  fechaCreacion?: any;
  fechaRegistro?: any;
  fechaHora?: any;
  createdAt?: any;
  total: number;
  estado: string;
}

interface ProductoStockBajo {
  id?: number;
  nombre: string;
  stock: number;
}

interface ProductoMasVendido {
  id?: number;
  nombre: string;
  cantidadVendida?: number;
  cantidad?: number;
}

interface MovimientoReciente {
  id?: number;
  producto?: string;
  nombre?: string;
  tipo: string;
  cantidad: number;
  fecha?: any;
  fechaMovimiento?: any;
  fechaCreacion?: any;
  fechaRegistro?: any;
  fechaHora?: any;
  createdAt?: any;
}

interface DashboardData {
  ventasDelDia: {
    cantidadVentas: number;
    totalVentas: number;
  };

  productosRegistrados: number;
  ventasRealizadas: number;

  productosStockBajo: ProductoStockBajo[];
  ultimasVentas: VentaReciente[];
  productosMasVendidos: ProductoMasVendido[];
  movimientosRecientes: MovimientoReciente[];
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

  dashboard: DashboardData = this.crearDashboardVacio();

  constructor(
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  private crearDashboardVacio(): DashboardData {
    return {
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
  }

  cargarDashboard(): void {

    this.cargando = true;
    this.error = '';

    this.reportesService.obtenerDashboard().subscribe({

      next: (response: any) => {

        if (response?.mensaje === 'OK' && response.body) {

          const data = response.body;

          // Ayuda para depurar: muestra en consola cómo llega un registro
          console.log('Ejemplo de venta:', data.ultimasVentas?.[0]);
          console.log('Ejemplo de movimiento:', data.movimientosRecientes?.[0]);

          this.dashboard = {
            ventasDelDia: {
              cantidadVentas: Number(data.ventasDelDia?.cantidadVentas ?? 0),
              totalVentas: Number(data.ventasDelDia?.totalVentas ?? 0)
            },

            productosRegistrados: Number(data.productosRegistrados ?? 0),
            ventasRealizadas: Number(data.ventasRealizadas ?? 0),

            productosStockBajo: Array.isArray(data.productosStockBajo)
              ? data.productosStockBajo
              : [],

            ultimasVentas: Array.isArray(data.ultimasVentas)
              ? data.ultimasVentas
              : [],

            productosMasVendidos: Array.isArray(data.productosMasVendidos)
              ? data.productosMasVendidos
              : [],

            movimientosRecientes: Array.isArray(data.movimientosRecientes)
              ? data.movimientosRecientes
              : []
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

  formatearMoneda(valor: number | string | null | undefined): string {
    return Number(valor || 0).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }

  // Busca la fecha en los nombres de campo más comunes
  obtenerFechaItem(item: any): any {
    return (
      item?.fecha ??
      item?.fechaVenta ??
      item?.fechaMovimiento ??
      item?.fechaCreacion ??
      item?.fechaRegistro ??
      item?.fechaHora ??
      item?.createdAt ??
      null
    );
  }

  formatearFecha(fecha: any): string {

    if (!fecha) {
      return 'Sin fecha';
    }

    let date: Date;

    // Jackson puede enviar LocalDateTime como arreglo: [año, mes, día, hora, min, seg]
    if (Array.isArray(fecha)) {
      const [anio, mes, dia, hora = 0, minuto = 0, segundo = 0] = fecha;
      date = new Date(anio, mes - 1, dia, hora, minuto, segundo);
    } else {
      date = new Date(fecha);
    }

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleString('es-MX', {
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

  obtenerIconoMovimiento(tipo: string): string {

    if (tipo === 'ENTRADA') {
      return 'bi-arrow-down-circle';
    }

    if (tipo === 'SALIDA') {
      return 'bi-arrow-up-circle';
    }

    return 'bi-arrow-repeat';
  }

}