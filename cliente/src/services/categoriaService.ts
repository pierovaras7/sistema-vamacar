import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

export const getCategories = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/categorias");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener categorías.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const createCategory = async (categoryData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/categorias", categoryData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear la categoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const updateCategory = async (id: number, categoryData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/categorias/${id}`, categoryData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar la categoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const deleteCategory = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/categorias/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar la categoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
