import axiosInstance from "@/lib/axiosInstance";
import { LoginResponse, PerfilPayload } from "@/types/auth";
import axios from "axios";

export const login = async (username: string, password: string): Promise<any> => {
    try {
      const response : LoginResponse = (await axiosInstance.post('/auth/login', { username, password })).data;
      //const token = response.data.token;
      //localStorage.setItem('token', token);
      return response;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Credenciales incorrectas. Intenta nuevamente.';
        throw new Error(message);
      }
      throw new Error('Ha ocurrido un error inesperado. Intenta nuevamente.');
    }
};

// Función para cerrar sesión
export const logout = async () => {

    try {
      // Realiza la solicitud de logout
      await axiosInstance.post("/auth/logout");
      window.location.href = "/"; // O usa cualquier redirección que prefieras
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

// Función para verificar si el usuario está autenticado
export const checkAuth = async () => {
    try {
      const response = await axiosInstance.get("/auth/user");
      return response.data.user; // Deberías recibir los datos del usuario si está autenticado
    } catch (error) {
      // Si ocurre un error, probablemente no está autenticado
      throw new Error("No autenticado");
    }
  };

  export const updatePerfil = async (id: number, perfil: any): Promise<void> => {
    try {
      await axiosInstance.put(`/auth/perfil/${id}`, perfil); // Reemplaza `/usuarios/${id}` con la ruta correcta de tu API
    } catch (error: any) {
      // Comprobar si el error es una respuesta HTTP con un status code 422 (validación fallida)
      if (error.response && error.response.status === 422) {
        // Extraer los errores del backend (puedes acceder a los errores específicos)
        const validationErrors = error.response.data.errors;
        // Lanzar un nuevo error con los errores de validación
        const errorMessage = validationErrors
          ? Object.values(validationErrors).join(", ") // Convierte los errores en un string
          : "Error de validación desconocido";
        throw new Error(errorMessage); // Puedes manipular los errores de manera más específica si lo deseas
      } else {
        // Si el error no es de validación, lanzar un error genérico
        const errorMessage = error.response?.data?.message || error.message || "Error al actualizar el perfil del usuario";
        throw new Error(errorMessage);
      }
    }
  };
  


