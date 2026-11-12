
export interface PermisoRol {
  id: number;
  rol: string;

  dashboardVer: boolean;
  puntoVentaVer: boolean;

  ventasVer: boolean;
  ventasCrear: boolean;
  ventasEditar: boolean;
  ventasEliminar: boolean;

  productosVer: boolean;
  productosCrear: boolean;
  productosEditar: boolean;
  productosEliminar: boolean;

  inventarioVer: boolean;
  inventarioCrear: boolean;
  inventarioEditar: boolean;

  clientesVer: boolean;
  clientesCrear: boolean;
  clientesEditar: boolean;
  clientesEliminar: boolean;

  reportesVer: boolean;

  usuariosVer: boolean;
  usuariosCrear: boolean;
  usuariosEditar: boolean;
  usuariosEliminar: boolean;

  configuracionVer: boolean;
  configuracionEditar: boolean;
}
