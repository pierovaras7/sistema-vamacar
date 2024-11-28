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
    // Si necesitas el token también puedes incluirlo aquí
    // token: string; // Puedes agregar esto si lo devuelves junto con la respuesta
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
};