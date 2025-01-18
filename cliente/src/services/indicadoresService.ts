import axiosInstance from '@/lib/axiosInstance';

// URL base de la API
const API_URL = '/'; // Ajusta esta URL si es necesario

// Obtener ingresos por ventas
export const getIngresoVentas = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get(`${API_URL}ingreso-ventas`);
    return response.data.ingresoVentas;
  } catch (error) {
    throw new Error('Error al obtener el ingreso por ventas');
  }
};

// Obtener ingresos por compras
export const getIngresoCompras = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get(`${API_URL}ingreso-compras`);
    return response.data.ingresoCompras;
  } catch (error) {
    throw new Error('Error al obtener el ingreso por compras');
  }
};

// Obtener ventas vs compras en los últimos 5 meses
export const getVentasVsComprasUltimos5Meses = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}ventas-vs-compras-ultimos-5-meses`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener ventas vs compras en los últimos 5 meses');
  }
};

// Obtener los 5 productos más vendidos
export const getProductosMasVendidos = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}productos-mas-vendidos`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los productos más vendidos');
  }
};

// Obtener las 5 marcas más vendidas
export const getMarcasMasVendidas = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}marcas-mas-vendidas`);
    return response.data.marcasMasVendidas;
  } catch (error) {
    throw new Error('Error al obtener las marcas más vendidas');
  }
};

// Obtener el total de cuentas por cobrar
export const getCuentasPorCobrar = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get(`${API_URL}cuentas-por-cobrar`);
    return response.data.cuentasPorCobrar;
  } catch (error) {
    throw new Error('Error al obtener cuentas por cobrar');
  }
};

// Obtener el total de cuentas por pagar
export const getCuentasPorPagar = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get(`${API_URL}cuentas-por-pagar`);
    return response.data.cuentasPorPagar;
  } catch (error) {
    throw new Error('Error al obtener cuentas por pagar');
  }
};
