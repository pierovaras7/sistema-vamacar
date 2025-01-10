import { getModules } from "@/services/usersService";
import { Module } from "@/types";
import { useEffect, useState } from "react";

const useModules = () => {
  const [modules, setModules] = useState<Module[]>([]); // Estado para almacenar los módulos
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await getModules(); 
        setModules(response); 
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false); 
      }
    };

    fetchModules();
  }, []); 

  return { modules, isLoading, error }; 
};

export default useModules;
