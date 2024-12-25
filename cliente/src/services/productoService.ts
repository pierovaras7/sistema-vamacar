import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

export const getProducts = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/productos");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener productos.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const createProduct = async (productData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/productos", productData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear el producto.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const updateProduct = async (id: number, productData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/productos/${id}`, productData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar el producto.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const deleteProduct = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/productos/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar el producto.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
