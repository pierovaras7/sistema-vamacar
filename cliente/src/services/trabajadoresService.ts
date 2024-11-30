import axiosInstance from "@/lib/axiosInstance";
import { Trabajador } from "@/types/auth";
import axios from "axios";

// Función para obtener todos los trabajadores
export const getAllTrabajadores = async (): Promise<Trabajador[]> => {
  try {
    const response = await axiosInstance.get("/trabajadores");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener los trabajadores.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Función para obtener un trabajador por ID
export const getTrabajadorById = async (id: number): Promise<Trabajador> => {
  try {
    const response = await axiosInstance.get(`/trabajadores/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        "Error al obtener los datos del trabajador.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Función para crear un nuevo trabajador
export const createTrabajador = async (
  trabajador: Trabajador
): Promise<Trabajador> => {
  try {
    const response = await axiosInstance.post("/trabajadores", trabajador);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear el trabajador.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Función para actualizar un trabajador existente
export const updateTrabajador = async (
  id: number,
  trabajador: Trabajador
): Promise<Trabajador> => {
  try {
    const response = await axiosInstance.put(`/trabajadores/${id}`, trabajador);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar el trabajador.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Función para eliminar un trabajador
export const deleteTrabajador = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/trabajadores/${id}`);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al eliminar el trabajador.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
