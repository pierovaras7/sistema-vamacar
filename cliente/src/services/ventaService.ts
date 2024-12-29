import axiosInstance from '@/lib/axiosInstance';
import { Venta } from '@/types';

// Definir la URL base para los trabajadores
const API_URL = '/ventas'; // Cambia la URL según tu API

export const getAllVentas = async (): Promise<Venta[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las ventas');
  }
};

export const saveVenta = async (venta: Venta): Promise<void> => {
    try {
      await axiosInstance.post(API_URL, venta);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        // Extraer los errores del backend
        const validationErrors = error.response.data.errors;
        // Lanzar un nuevo error con los errores de validación
        throw new Error(JSON.stringify(validationErrors)); // O puedes manipular los errores de manera más específica si lo deseas
      } else {
        // Si el error no es de validación, lanzar un error genérico
        throw new Error('Error al registrar la venta.');
      }    
    }
};