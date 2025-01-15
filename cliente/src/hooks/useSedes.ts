import { getAllSedes } from "@/services/trabajadoresService";
import { Sede } from "@/types";
import { useEffect, useState } from "react";

const useSedes = () => {
  const [sedes, setSedes] = useState<Sede[]>([]); 
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const getSedes = async () => {
      try {
        const response = await getAllSedes();
        setSedes(response); 
      } catch (error) {

        if (error instanceof Error) {
          setError(error.message); 
        } else {
          setError("Error desconocido al obtener sedes."); 
        }
      } finally {
        setIsLoading(false); 
      }
    };

    getSedes(); 
  }, []); 

  return { sedes, isLoading, error }; 
};

export default useSedes;
