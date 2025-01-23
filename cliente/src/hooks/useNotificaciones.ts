import { useState, useEffect, useCallback } from "react";
import useInventarios from "./useInventarios";
import useCuentasPagar from "./useCuentasPagar";

export type Notificacion = {
  tipo: "STOCK" | "FECHA";
  mensaje: string;
  ruta: string;
};

const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const { inventarios } = useInventarios();
  const { cuentasPagar } = useCuentasPagar();

  const actualizarNotificaciones = useCallback(() => {
    const formatearFecha = (fechaISO: string): string => {
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    };

    const stockMinimoNotificaciones: Notificacion[] = inventarios
      .filter((inventario) => {
        const esMenor =
          parseFloat(inventario.stockActual as unknown as string) <
          parseFloat(inventario.stockMinimo as unknown as string);
        return esMenor;
      })
      .map((inventario) => ({
        tipo: "STOCK",
        mensaje: `El producto: ${inventario.producto?.descripcion} tiene el stock por debajo del mínimo.`,
        ruta: "/inventarios",
      }));

    const cuentasPagarNotificaciones: Notificacion[] = cuentasPagar
      .filter((cuenta) => {
        const hoy = new Date();
        const fechaPago = new Date(cuenta.fechaPago);
        const diferenciaDias = (fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        return diferenciaDias <= 3 && diferenciaDias >= 0;
      })
      .map((cuenta) => ({
        tipo: "FECHA",
        mensaje: `La cuenta con proveedor: ${cuenta.proveedor} tiene la fecha de pago próxima: ${formatearFecha(cuenta.fechaPago)}.`,
        ruta: "/cuentas-por-pagar",
      }));

    setNotificaciones([...stockMinimoNotificaciones, ...cuentasPagarNotificaciones]);
  }, [inventarios, cuentasPagar]);

  useEffect(() => {
    actualizarNotificaciones();
  }, [actualizarNotificaciones]);

  return { notificaciones, actualizarNotificaciones };
};

export default useNotificaciones;
