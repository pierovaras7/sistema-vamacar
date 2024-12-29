import axiosInstance from '@/lib/axiosInstance';
import { Representante } from '@/types';

// Definir la URL base para los representantes
const API_URL = '/representantes'; // Cambia la URL según tu API

export const getAllRepresentantes = async (): Promise<Representante[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los representantes');
  }
};

export const saveRepresentante = async (representante: Representante): Promise<void> => {
  try {
    console.log(representante); // Verifica si los datos están correctos antes de enviarlos
    await axiosInstance.post(API_URL, representante);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      throw new Error(JSON.stringify(validationErrors)); 
    } else {
      throw new Error('Error al registrar el representante');
    }
  }
};


export const getRepresentanteById = async (id: number): Promise<Representante> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el representante con id ' + id);
  }
};

export const updateRepresentante = async (id: number, representante: Representante): Promise<void> => {
  try {
    // Imprime los datos para verificar antes de enviarlos
    console.log("Enviando datos para actualizar:", representante);

    // Envía los datos al backend
    const response = await axiosInstance.put(`${API_URL}/${id}`, representante);

    // Imprime la respuesta del servidor
    console.log("Respuesta de la actualización:", response.data);

  } catch (error: any) {
    // Comprobar si el error es una respuesta HTTP con un status code 422 (validación fallida)
    if (error.response && error.response.status === 422) {
      // Extraer los errores del backend
      const validationErrors = error.response.data.errors;
      // Lanzar un nuevo error con los errores de validación
      throw new Error(JSON.stringify(validationErrors));
    } else {
      // Si el error no es de validación, lanzar un error genérico
      console.error("Error al actualizar:", error);
      throw new Error('Error al actualizar el representante');
    }
  }
};

export const deleteRepresentante = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el representante');
  }
};
