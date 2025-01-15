import axiosInstance from "@/lib/axiosInstance";
import { LoginResponse } from "@/types";
import axios from "axios";


export const login = async (username: string, password: string): Promise<any> => {
    try {
      const response : LoginResponse = (await axiosInstance.post('/login', { username, password })).data;
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

export const logout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

export const checkAuth = async (id: number) => {
    try {
      const response = await axiosInstance.get(`/getUser/${id}`);
      return response.data.user; 
    } catch (error) {
      throw new Error("No autenticado");
    }
  };

  export const refreshToken = async () => {
      try {
        const response = await axiosInstance.get('/refresh');
        return response.data.user;
      } catch (error: any) {
          console.error('Error al refrescar el token:', error.response.data);
      }
  };


  export const updateProfile = async (id: number, perfil: any): Promise<void> => {
    try {
      await axiosInstance.put(`/updateProfile/${id}`, perfil); 
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        if (error.response && error.response.status === 422) {
          const validationErrors = error.response.data.errors;
          throw new Error(JSON.stringify(validationErrors)); 
        } else {
          throw new Error('Error al actualizar el perfil del usuario.');
        }   
    }
  };
  
}


