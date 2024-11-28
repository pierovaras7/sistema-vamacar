import axiosInstance from "@/lib/axiosInstance";
import { LoginResponse } from "@/types/auth";
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



