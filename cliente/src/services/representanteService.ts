import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

export const getRepresentantes = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/representantes");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener representantes.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};


export const getRepresentante = async (idRepresentante: number) => {
    const { data } = await axiosInstance.get(`/representantes/${idRepresentante}`);
    return data;
  };

export const createRepresentante = async (representanteData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/representantes", representanteData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear el representante.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const updateRepresentante = async (id: number, representanteData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/representantes/${id}`, representanteData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar el representante.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const deleteRepresentante = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/representantes/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar el representante.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
