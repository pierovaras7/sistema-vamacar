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
    user: User
}
  
export type User = {
    idUser: number;
    name: string;
    email: string;
    username: string;
    email_verified_at: string | null;
    trabajador: Trabajador;
    estado: number;
    created_at: string;
    updated_at: string;
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
