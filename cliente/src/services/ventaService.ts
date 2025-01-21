import axiosInstance from '@/lib/axiosInstance';
import { Cliente, Venta } from '@/types';

// Definir la URL base para los trabajadores
const API_URL = '/ventas'; // Cambia la URL según tu API


export const getAllVentas = async (fechaInicio?: string, fechaFin?: string): Promise<Venta[]> => {
  try {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    const response = await axiosInstance.get(API_URL, {params});
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las ventas');
  }
};

export const findCliente = async (valor: string, tipo?: string): Promise<Cliente> => {
  try {
    const response = await axiosInstance.get(`/findCliente/${valor}/${tipo}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el cliente');
  }
};

export const saveVenta = async (venta: Venta): Promise<Venta> => {
    try {
      const response = await axiosInstance.post(API_URL, venta);
      return response.data.venta;
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



export const anularVenta = async (id?: number): Promise<void> => {
  try {
    if(id)
      await axiosInstance.post(`${API_URL}/anular/${id}`);
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      // Extraer los errores del backend
      const validationErrors = error.response.data.errors;
      // Lanzar un nuevo error con los errores de validación
      throw new Error(JSON.stringify(validationErrors)); // O puedes manipular los errores de manera más específica si lo deseas
    } else {
      // Si el error no es de validación, lanzar un error genérico
      throw new Error('Error al anular la venta.');
    }    
  }
};