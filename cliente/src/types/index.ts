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


export type Representante = {
    idRepresentante?: number;   // ID único del representante
    nombres: string;            // Nombres del representante
    apellidos: string;          // Apellidos del representante
    dni: string;                // DNI del representante
    cargo: string;              // Cargo del representante
    telefono: string;           // Teléfono del representante
    estado?: boolean;           // Activo (true) o Inactivo (false)
};

export type Cliente = {
    idCliente?: number; 
    tipoCliente: string;  // Persona Natural o Jurídica
    telefono: string;
    correo: string;
    direccion: string;
    estado?: boolean; // Activo (true) o Inactivo (false)
};
  

export type Natural = {
    idNatural?: number;          // ID único del cliente natural
    nombres: string;             // Nombres del cliente natural
    apellidos: string;           // Apellidos del cliente natural
    estado?: boolean;            // Activo (true) o Inactivo (false)
    idCliente: number;           // ID del cliente principal
  };
  

  export type Juridico = {
    idJuridico?: number;         // ID único del cliente jurídico
    razonSocial: string;         // Razón social de la empresa
    ruc: string;                 // RUC del cliente jurídico
    idRepresentante: number;     // ID del representante (referencia al tipo `Representante`)
    estado?: boolean;            // Activo (true) o Inactivo (false)
    idCliente: number;           // ID del cliente principal
  };
  