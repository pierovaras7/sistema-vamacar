import { getInventarios } from "@/services/inventariosService";
import { Inventario } from "@/types";
import { useEffect, useState } from "react";

const useInventarios = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventarios = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getInventarios();
        setInventarios(response);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInventarios();
  }, []);

  return { inventarios, isLoading, error};
};

export default useInventarios;

