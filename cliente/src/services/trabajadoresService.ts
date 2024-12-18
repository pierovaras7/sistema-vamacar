import axiosInstance from '@/lib/axiosInstance';
import { Trabajador } from '@/types/auth';

// Definir la URL base para los trabajadores
const API_URL = '/trabajadores'; // Cambia la URL según tu API

export const getAllTrabajadores = async (): Promise<Trabajador[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los trabajadores');
  }
};

export const saveTrabajador = async (trabajador: Trabajador): Promise<void> => {
  try {
    await axiosInstance.post(API_URL, trabajador);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      // Extraer los errores del backend
      const validationErrors = error.response.data.errors;
      // Lanzar un nuevo error con los errores de validación
      throw new Error(JSON.stringify(validationErrors)); // O puedes manipular los errores de manera más específica si lo deseas
    } else {
      // Si el error no es de validación, lanzar un error genérico
      throw new Error('Error al registrar el trabajador');
    }    
  }
};

export const getTrabajadorById = async (id: number): Promise<Trabajador> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el trabajador con id '+ id );
  }
};

export const updateTrabajador = async (id: number, trabajador: Trabajador): Promise<void> => {
  try {
    await axiosInstance.put(`${API_URL}/${id}`, trabajador);
  } catch (error: any) {
 // Comprobar si el error es una respuesta HTTP con un status code 422 (validación fallida)
    if (error.response && error.response.status === 422) {
      // Extraer los errores del backend
      const validationErrors = error.response.data.errors;
      // Lanzar un nuevo error con los errores de validación
      throw new Error(JSON.stringify(validationErrors)); // O puedes manipular los errores de manera más específica si lo deseas
    } else {
      // Si el error no es de validación, lanzar un error genérico
      throw new Error('Error al actualizar el trabajador');
    }  
  }
};



export const deleteTrabajador = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el trabajador');
  }
};
