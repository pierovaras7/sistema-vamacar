import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getProducts } from "@/services/productoService";

const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false); // Señal para recargar

  const fetchProductos = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts();
      setProductos(response);
    } catch (error) {
      console.error("Error fetching productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []); // Depender de la señal de recarga

  useEffect(() => {
    fetchProductos();
  }, [reloadFlag]); // Depender de la señal de recarga

  const reloadProductos = () => setReloadFlag((prev) => !prev); // Cambiar el estado para forzar recarga

  return { productos, isLoading, reloadProductos };
};

export default useProductos;

