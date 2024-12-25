import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

export const getBrands = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/marcas");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener las marcas.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const createBrand = async (brandData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/marcas", brandData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear la marca.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const updateBrand = async (id: number, brandData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/marcas/${id}`, brandData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar la marca.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const deleteBrand = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/marcas/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar la marca.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
