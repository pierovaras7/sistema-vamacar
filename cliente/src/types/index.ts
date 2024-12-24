// LOGIN Y REGISTER

export type LoginPayload = {
    email: string;
    password: string;
}
  
export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
}

export type LoginResponse = {
    message: string;
    user: User;
    trabajador: Trabajador; 
}
  
export type User = {
    idUser: number;
    name: string;
    username: string;
    password?: string;
    estado?: number;
    trabajador?: Trabajador;
    modules?: Module[];
};

// PROFILE

export type PerfilPayload = {
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


// TRABAJADOR

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
    crearCuenta?: boolean;
};

// ACCESO

export type Module = {
    idModule : number;
    name: string;
    slug: string;
}