import axiosInstance from '@/lib/axiosInstance';
import { Cliente } from '@/types';

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
export const deleteRepresentante = async (id: number): Promise<void> => {
  try {
    console.log("🛠️ [Servicio] ID del representante a eliminar (desactivar):", id);
    
    const response = await axiosInstance.put(`${API_URL}/${id}`, { estado: false });
    
    console.log("✅ [Servicio] Representante desactivado correctamente:", response.data);
  } catch (error: any) {
    if (error.response) {
      console.error("❌ [Servicio] Error en la respuesta del servidor:", error.response.data);
      throw new Error(JSON.stringify(error.response.data.errors || error.response.data));
    } else {
      console.error("❌ [Servicio] Error inesperado al desactivar representante:", error);
      throw new Error('Error al desactivar el representante');
    }
  }
};
