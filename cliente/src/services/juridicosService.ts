import axiosInstance from '@/lib/axiosInstance';
import { Juridico } from '@/types';

const API_URL = '/juridicos';

// Obtener todos los clientes jurídicos
export const getAllJuridicos = async (): Promise<Juridico[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los clientes jurídicos');
  }
};

// Guardar un nuevo cliente jurídico
export const saveJuridico = async (juridico: Juridico): Promise<void> => {
  try {
    await axiosInstance.post(API_URL, juridico);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      throw new Error(JSON.stringify(validationErrors));
    } else {
      throw new Error('Error al registrar el cliente jurídico');
    }
  }
};

// Obtener un cliente jurídico por ID
export const getJuridicoById = async (id: number): Promise<Juridico> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error al obtener el cliente jurídico con ID ${id}`);
  }
};

// Actualizar un cliente jurídico por ID
export const updateJuridico = async (id: number, juridico: Juridico): Promise<void> => {
  try {
    await axiosInstance.put(`${API_URL}/${id}`, juridico);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      throw new Error(JSON.stringify(validationErrors));
    } else {
      throw new Error('Error al actualizar el cliente jurídico');
    }
  }
};

// Eliminar (desactivar) un cliente jurídico por ID
export const deleteJuridico = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el cliente jurídico');
  }
};


export const getJuridicosByCliente = async (idCliente: number): Promise<Juridico[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/cliente/${idCliente}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error al obtener los clientes naturales para el cliente con ID ${idCliente}`);
  }
};