import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";

// Obtener todas las compras
export const getCompras = async (fechaInicio?: string, fechaFin?: string): Promise<any> => {
  try {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    const response = await axiosInstance.get("/compras",{params});
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener las compras.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const exportCompras = async (fechaInicio?: string, fechaFin?: string): Promise<any> => {
  try {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    console.log(params);  // Para depuración, muestra los parámetros en la consola

    // Realiza la solicitud GET usando axiosInstance con los parámetros
    const response = await axiosInstance.get('exportarcompras', { params, responseType: 'blob' });

    // Verifica la respuesta del servidor
    if (response.status === 200) {
      const blob = response.data;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'compras.xlsx';  // Nombre del archivo Excel
      link.click();  // Inicia la descarga
    } else {
      throw new Error('Hubo un problema al exportar las compras');
    }

  } catch (error) {
    console.log(error);
    throw new Error('Error al exportar las compras');
  }
};

// Crear una nueva compra
export const postCompra = async (compraData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.post("/compras", compraData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear la compra.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Actualizar una compra existente
export const updateCompra = async (id: number, compraData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/compras/${id}`, compraData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar la compra.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Eliminar una compra existente
export const anularCompra = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/compras/anular/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al anular la compra.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};


export const getEstados = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/getEstado");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener los estados.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

// Actualizar el estado de una cuenta por pagar
export const updateEstado = async (
  idCompra: number,
  estado: boolean
): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/updateEstado/${idCompra}`, { estado });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al actualizar el estado.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};


export const getCuentasPorPagar = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/cpp");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener las cuentas por pagar.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};


