export interface Usuario {
  idUsuario?: number;
  nombre: string;
  username: string;
  password?: string;
  rol: string;
  activo?: boolean;
}