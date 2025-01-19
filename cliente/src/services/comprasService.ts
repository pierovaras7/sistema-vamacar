import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

// Obtener todas las compras
export const getCompras = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/compras");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener las compras.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Crear una nueva compra
export const postCompra = async (compraData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/compras", compraData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear la compra.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Actualizar una compra existente
export const updateCompra = async (id: number, compraData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/compras/${id}`, compraData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar la compra.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Eliminar una compra existente
export const deleteCompra = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/compras/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar la compra.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};


export const getEstados = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/getEstado");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener los estados.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Actualizar el estado de una cuenta por pagar
export const updateEstado = async (
  idCompra: number,
  estado: boolean
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/updateEstado/${idCompra}`, { estado });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar el estado.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};