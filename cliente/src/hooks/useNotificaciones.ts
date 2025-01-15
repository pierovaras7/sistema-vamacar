import { useState, useEffect } from "react";
import { Inventario } from "@/types";
import useInventarios from "./useInventarios";

export type Notificacion = {
  tipo: "STOCK" | "FECHA";
  mensaje: string;
  ruta: string;
}

const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>();

  // Llamar a useInventario para obtener las notificaciones relacionadas con los inventarios
  const { inventarios } = useInventarios();
  
  useEffect(() => {

    // Si es necesario, aquí podemos agregar más lógica para otras notificaciones fuera de los inventarios.
    const stockMinimoNotificaciones: Notificacion[] = inventarios
    .filter((inventario) => {
      const esMenor = parseFloat(inventario.stockActual as unknown as string) < parseFloat(inventario.stockMinimo as unknown as string);
      return esMenor;
    })
      .map((inventario) => ({
        tipo: "STOCK",
        mensaje: `El producto: ${inventario.producto?.descripcion} tiene el stock por debajo del mínimo.`,
        ruta: '/inventarios',
      }));

    

    // Combinamos las notificaciones de stock con otras, si es necesario
    const todasNotificaciones = [
      ...stockMinimoNotificaciones,
    ];

    setNotificaciones(todasNotificaciones);
  }, [inventarios]);


  return { notificaciones };
};

export default useNotificaciones;
