import axiosInstance from '@/lib/axiosInstance';
import { Natural } from '@/types';

const API_URL = '/naturales';

// Obtener todos los clientes naturales
export const getAllNaturales = async (): Promise<Natural[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los clientes naturales');
  }
};

// Guardar un nuevo cliente natural
export const saveNatural = async (natural: Natural): Promise<void> => {
  try {
    await axiosInstance.post(API_URL, natural);
  } catch (error: any) {
    throw new Error('Error al registrar el cliente natural');
  }
};


// Obtener un cliente natural por ID
export const getNaturalById = async (id: number): Promise<Natural> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error al obtener el cliente natural con ID ${id}`);
  }
};

// Actualizar un cliente natural por ID
export const updateNatural = async (id: number, natural: Natural): Promise<void> => {
  try {
    await axiosInstance.put(`${API_URL}/${id}`, natural);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      throw new Error(JSON.stringify(validationErrors));
    } else {
      throw new Error('Error al actualizar el cliente natural');
    }
  }
};

// Eliminar (desactivar) un cliente natural por ID
export const deleteNatural = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el cliente natural');
  }
};
