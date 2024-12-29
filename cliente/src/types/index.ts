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
    sede?: Sede;
};

// ACCESO

export type Module = {
    idModule : number;
    name: string;
    slug: string;
}

// PRODUCTO

export type Producto = {
    idProducto: number;
    descripcion: string;
    codigo: string;
    uni_medida: string;
    precioCosto: number;
    precioMinVenta: number;
    precioMaxVenta: number;
    precioXMayor: number;
    idSubcategoria: number;
    idMarca: number;
    estado: boolean;
  };

export type DetailVenta = {
    idDetalleVenta: number,
    producto: Producto,
    precio: number,
    cantidad: number,
    subtotal: number
}

export type Sede = {
    idSede?: number;
    direccion: string;
    telefono: string;
    estado?: boolean;
}

export type Venta = {
    idVenta?: number;
    fecha: string; // Usualmente en formato 'YYYY-MM-DD' o 'YYYY-MM-DD HH:MM:SS'
    total?: number;
    montoPagado?: number;
    tipoVenta: string; // Podría ser 'contado', 'crédito', etc.
    metodoPago: string; // Por ejemplo, 'efectivo', 'tarjeta', etc.
    trabajador?: Trabajador;
    sede?: Sede;
    cliente?: Cliente;
    estado?: boolean; // Estado de la venta (activada/desactivada)
    detalles?: DetailVenta[];
};

export type Cliente = {
    idCliente: number;
    nombres: string;
}