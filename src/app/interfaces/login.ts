export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  idUsuario: number;
  nombre: string;
  username: string;
  rol: string;
  token: string;
}

export interface ResponseDTO<T> {
  mensaje: string;
  body: T;
}