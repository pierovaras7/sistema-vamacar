import axiosInstance from '@/lib/axiosInstance';
import { CuentaCobrar, DetalleCC } from '@/types';

// Definir la URL base para los trabajadores
const API_URL = '/cuentascobrar'; // Cambia la URL según tu API

export const getCuentasCobrar = async (): Promise<CuentaCobrar[]> => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las cuentas por cobrar.');
  }
};

export const createCuentaCobrar = async (cuentaCobrar: any): Promise<void> => {
  try{
    await axiosInstance.post(API_URL, cuentaCobrar);
  } catch (error: any){
    throw new Error( error.response?.data?.error||'Error al obtener las cuentas por cobrar.');
  }
}

export const registrarDetalleCuentasCobrar = async (detalle: DetalleCC, id: number): Promise<DetalleCC> => {
  try {
    const response = await axiosInstance.post(`${API_URL}/registrarDetalleCC/${id}`, detalle);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error|| 'Error al registrar el detalle en cuentas por cobrar.');
  }
};


