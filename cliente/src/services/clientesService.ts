import axiosInstance from '@/lib/axiosInstance';
import { Cliente } from '@/types';
import { deleteNatural } from './naturalesService';
import { deleteJuridico } from './juridicosService';

const API_URL = '/clientes';

// Obtener todos los clientes
export const getAllClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los clientes');
  }
};

// Guardar un nuevo cliente
export const saveCliente = async (cliente: Cliente): Promise<{ idCliente: number }> => {
  try {
    const response = await axiosInstance.post(API_URL, cliente);
    
    // Asumiendo que el backend retorna el cliente con su id (como { idCliente: number })
    return { idCliente: response.data.idCliente }; 
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      throw new Error(JSON.stringify(validationErrors));
    } else {
      throw new Error('Error al registrar el cliente');
    }
  }
};


// Obtener un cliente por ID
export const getClienteById = async (id: number): Promise<Cliente> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error al obtener el cliente con ID ${id}`);
  }
};

// Actualizar un cliente por ID
export const updateCliente = async (id: number, cliente: Cliente): Promise<void> => {
  try {
    await axiosInstance.put(`${API_URL}/${id}`, cliente);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      throw new Error(JSON.stringify(validationErrors));
    } else {
      throw new Error('Error al actualizar el cliente');
    }
  }
};

// Eliminar (desactivar) un cliente por ID
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el representante');
  }
};


export const deleteClienteConDependencias = async (id: number, tipo: 'natural' | 'juridico'): Promise<void> => {
  try {
    if (tipo === 'natural') {
      await deleteNatural(id);
    } else if (tipo === 'juridico') {
      await deleteJuridico(id);
    }

    // Finalmente, eliminar de la tabla principal
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el cliente con dependencias');
  }
};