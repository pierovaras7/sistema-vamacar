import axiosInstance from '@/lib/axiosInstance';
import { CuentaCobrar, DetalleCC, Inventario, MovInventario } from '@/types';

// Definir la URL base para los trabajadores
const API_URL = '/inventarios'; // Cambia la URL según tu API

export const getInventarios = async (): Promise<Inventario[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los inventarios.');
  }
};



export const registrarMovimientoInventario = async (movimiento: MovInventario, id?: number): Promise<MovInventario> => {
  try {
    const response = await axiosInstance.post(`${API_URL}/registrarMovInventario/${id}`, movimiento);
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.response?.data?.error || 'Error al registrar un movimiento en el Inventario.');
  }
};


