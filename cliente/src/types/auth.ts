export type LoginPayload = {
    email: string;
    password: string;
}
  
export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
}

// Tipo para la respuesta de login que incluye el token y los datos del usuario
export type LoginResponse = {
    message: string;
    user: User;
    trabajador: Trabajador; 
}
  
export type User = {
    idUser: number;
    name: string;
    email: string;
    username: string;
    email_verified_at: string | null;
    idTrabajador: number | null;
    estado: number;
    created_at: string;
    updated_at: string;
    trabajador?: Trabajador;
};

export type Trabajador = {
    idTrabajador?: number; 
    nombres: string;
    apellidos: string;
    telefono: string;
    sexo: string;
    direccion: string;
    dni: string;
    area: string;
    fechaNacimiento: string; 
    turno: string;
    salario: number; 
    estado?: boolean; 
};

export interface PerfilPayload {
    username: string;
    password: string;
    password_confirmation: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    sexo: "M" | "F" | "SE" | undefined;
    direccion: string;
    dni: string;
    fechaNacimiento: string;
  }
  