import { getCuentasPorPagar } from "@/services/comprasService";
import { useEffect, useState } from "react";

const useCuentasPagar = () => {
  const [cuentasPagar, setCuentasPagar] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCuentasPagar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCuentasPorPagar();
        setCuentasPagar(response);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCuentasPagar();
  }, []);

  return { cuentasPagar, isLoading, error };
};

export default useCuentasPagar;
