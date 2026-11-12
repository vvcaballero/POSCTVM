import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { ReportesService } from '../../services/reportes/reportes.service';

import {
  ResumenReporte,
  VentaDiaria,
  VentaUsuario,
  VentaCliente,
  MetodoPago,
  ProductoMasVendido
} from '../../interfaces/reportes';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  desde: string = '';
  hasta: string = '';

  cargando = false;
  error = '';

  resumen: ResumenReporte = {
    cantidadVentas: 0,
    subtotal: 0,
    descuentos: 0,
    totalVentas: 0
  };

  ventasDiarias: VentaDiaria[] = [];
  ventasUsuarios: VentaUsuario[] = [];
  ventasClientes: VentaCliente[] = [];
  metodosPago: MetodoPago[] = [];
  productosMasVendidos: ProductoMasVendido[] = [];

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarReportes();
  }

  // ==========================================
  // FECHAS INICIALES
  // ==========================================

  inicializarFechas(): void {

    const hoy = new Date();

    const primerDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    );

    this.desde = this.formatearFecha(primerDia);
    this.hasta = this.formatearFecha(hoy);
  }

  private formatearFecha(fecha: Date): string {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // ==========================================
  // CARGAR REPORTES
  // ==========================================

  cargarReportes(): void {

    this.error = '';

    if (!this.desde || !this.hasta) {
      this.error = 'Debes seleccionar ambas fechas.';
      return;
    }

    if (this.desde > this.hasta) {
      this.error = 'La fecha inicial no puede ser mayor que la fecha final.';
      return;
    }

    this.cargando = true;

    forkJoin({

      resumen: this.reportesService
        .obtenerResumen(this.desde, this.hasta)
        .pipe(catchError(() => of(null))),

      ventasDiarias: this.reportesService
        .obtenerVentasDiarias(this.desde, this.hasta)
        .pipe(catchError(() => of(null))),

      usuarios: this.reportesService
        .obtenerVentasPorUsuario(this.desde, this.hasta)
        .pipe(catchError(() => of(null))),

      clientes: this.reportesService
        .obtenerVentasPorCliente(this.desde, this.hasta)
        .pipe(catchError(() => of(null))),

      metodosPago: this.reportesService
        .obtenerMetodosPago(this.desde, this.hasta)
        .pipe(catchError(() => of(null))),

      productos: this.reportesService
        .obtenerProductosMasVendidos(this.desde, this.hasta, 5)
        .pipe(catchError(() => of(null)))

    })
    .pipe(
      finalize(() => this.cargando = false)
    )
    .subscribe({

      next: (resultado) => {

        let errores = 0;

        if (resultado.resumen?.mensaje === 'OK') {
          this.resumen = resultado.resumen.body;
        } else {
          errores++;
        }

        if (resultado.ventasDiarias?.mensaje === 'OK') {
          this.ventasDiarias = resultado.ventasDiarias.body || [];
        } else {
          errores++;
        }

        if (resultado.usuarios?.mensaje === 'OK') {
          this.ventasUsuarios = resultado.usuarios.body || [];
        } else {
          errores++;
        }

        if (resultado.clientes?.mensaje === 'OK') {
          this.ventasClientes = resultado.clientes.body || [];
        } else {
          errores++;
        }

        if (resultado.metodosPago?.mensaje === 'OK') {
          this.metodosPago = resultado.metodosPago.body || [];
        } else {
          errores++;
        }

        if (resultado.productos?.mensaje === 'OK') {
          this.productosMasVendidos = resultado.productos.body || [];
        } else {
          errores++;
        }

        if (errores > 0) {
          this.error = `No fue posible cargar correctamente ${errores} sección(es). Revisa la conexión con el backend.`;
        }
      },

      error: () => {
        this.error = 'No se pudieron consultar los reportes. Verifica el servidor.';
      }

    });
  }

  // ==========================================
  // LIMPIAR / RESTABLECER FILTROS
  // ==========================================

  restablecerFechas(): void {
    this.inicializarFechas();
    this.cargarReportes();
  }

  // ==========================================
  // GRÁFICA DE VENTAS DIARIAS
  // ==========================================

  get ventaDiariaMaxima(): number {

    if (this.ventasDiarias.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.ventasDiarias.map(v => Number(v.totalVentas) || 0)
    );
  }

  obtenerAlturaBarra(total: number): number {

    if (this.ventaDiariaMaxima === 0) {
      return 0;
    }

    return Math.max(
      (Number(total) / this.ventaDiariaMaxima) * 100,
      2
    );
  }

  // ==========================================
  // FORMATO DE FECHAS
  // ==========================================

  formatearFechaGrafica(fecha: string): string {

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}`;
  }

  // ==========================================
  // MÉTODOS DE PAGO
  // ==========================================

  nombreMetodoPago(metodo: string): string {

    const nombres: Record<string, string> = {
      EFECTIVO: 'Efectivo',
      TARJETA: 'Tarjeta',
      TRANSFERENCIA: 'Transferencia'
    };

    return nombres[metodo] || metodo;
  }

  // ==========================================
  // TRACK BY
  // ==========================================

  trackByFecha(index: number, item: VentaDiaria): string {
    return item.fecha;
  }

  trackByUsuario(index: number, item: VentaUsuario): number {
    return item.idUsuario;
  }

  trackByCliente(index: number, item: VentaCliente): number {
    return item.idCliente;
  }

  trackByProducto(index: number, item: ProductoMasVendido): number {
    return item.idProducto;
  }
}