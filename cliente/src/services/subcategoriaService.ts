import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";


type Subcategory = {
  idSubcategoria: number;
  subcategoria: string;
  idCategoria: number;
  estado: boolean;
};

export const getSubcategories = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/subcategorias");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al obtener subcategorías.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const createSubcategory = async (
  subcategoryData: Record<string, any>
): Promise<any> => {
  try {
    const response = await axiosInstance.post("/subcategorias", subcategoryData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Error al crear la subcategoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};


export const updateSubcategory = async (
  id: number,
  subcategoryData: { subcategoria: string; idCategoria: number }
): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      `/subcategorias/${id}`,
      subcategoryData
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        "Error al actualizar la subcategoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const getSubcategoriesByCategory = async (
  idCategoria: number
): Promise<Subcategory[]> => {
  try {
    const response = await axiosInstance.get(
      `/subcategorias/categoria/${idCategoria}`
    );
    // Filtrar subcategorías activas (estado: true)
    return response.data.filter((subcategoria: Subcategory) => subcategoria.estado);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        "Error al obtener subcategorías de la categoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};

export const deleteSubcategory = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`/subcategorias/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        "Error al eliminar la subcategoría.";
      throw new Error(message);
    }
    throw new Error("Ha ocurrido un error inesperado.");
  }
};
  
