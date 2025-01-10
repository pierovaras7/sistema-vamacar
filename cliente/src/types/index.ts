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
    icon: string;
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
    natural?: Natural;
    juridico?: Juridico;
    dniRuc?: string;
};
  

export type Natural = {
    idNatural?: number;
    dni?: string;          // ID único del cliente natural
    nombres?: string;             // Nombres del cliente natural
    apellidos?: string;           // Apellidos del cliente natural
    estado?: boolean;            // Activo (true) o Inactivo (false)
    idCliente?: number;           // ID del cliente principal
  };
  

export type Juridico = {
    idJuridico?: number;         // ID único del cliente jurídico
    razonSocial?: string;         // Razón social de la empresa
    ruc?: string;                 // RUC del cliente jurídico
    representante?: string;     // ID del representante (referencia al tipo `Representante`)
    estado?: boolean;            // Activo (true) o Inactivo (false)
    idCliente?: number;           // ID del cliente principal
};
  

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
    stockActual?: number;
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


// Cuenta X Cobrar
export type CuentaCobrar = {
    idCC?: number;
    cliente: Cliente;
    montoCuenta: number;
    detalles?: DetalleCC[];
}

export type DetalleCC = {
    idDetalleCC?: number;
    motivo: string;
    fecha: string;
    monto: number;
    saldo?: number;
}

export type Inventario = {
    idInventario? : number;
    stockMinimo?: number;
    stockActual?: number;
    producto?: Producto;
    estado?: boolean;
    movs_inventario?:MovInventario[];
}

export type MovInventario = {
    idMovInventario?: number;
    tipo: string;
    descripcion: string;
    fecha: string;
    cantidad: number;
    inventario?: Inventario;
    estado?: boolean;
}