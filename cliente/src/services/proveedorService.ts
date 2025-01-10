// services/proveedores.ts
import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

export const getProveedores = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/proveedores");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener proveedores.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const createProveedor = async (proveedorData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/proveedores", proveedorData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear el proveedor.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const updateProveedor = async (id: number, proveedorData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/proveedores/${id}`, proveedorData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar el proveedor.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const deleteProveedor = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/proveedores/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar el proveedor.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
