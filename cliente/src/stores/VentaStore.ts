import { Cliente, DetailVenta, Sede, Trabajador } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Venta {
  fecha: string;
  metodoPago: string;
  montoPagado: number;
  total: number;
  tipoVenta: string;
  detalles: DetailVenta[];
  cliente?: Cliente | undefined;
  trabajador?: Trabajador;
  sede?: Sede;
}

interface VentaStore {
  ventaTemporal: Venta;
  isHydrated: boolean;
  setVentaTemporal: (venta: Venta) => void;
  actualizarDetalleVenta: (detalles: DetailVenta[]) => void;
  setCliente: (cliente: Cliente | undefined) => void;
  setSede: (sede: Sede | undefined) => void;
  setHydrated: (hydrated: boolean) => void;
  resetVenta: () => void;
}

const generarFechaActual = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const useVentaStore = create<VentaStore>()(
  persist(
    (set) => ({
      ventaTemporal: {
        fecha: generarFechaActual(), // Formato adecuado
        metodoPago: "efectivo",
        montoPagado: 0,
        total: 0,
        tipoVenta: "contado",
        detalles: [],
        cliente: undefined,
        trabajador: undefined,
        sede: undefined,
      },
      isHydrated: false,
      setVentaTemporal: (venta) =>
        set((state) => ({
          ventaTemporal: { ...state.ventaTemporal, ...venta }, 
        })),
      actualizarDetalleVenta: (detalles) =>
        set((state) => ({
          ventaTemporal: { ...state.ventaTemporal, detalles },
        })),
      setCliente: (cliente) =>
        set((state) => ({
          ventaTemporal: { ...state.ventaTemporal, cliente },
        })),
      setSede: (sede) =>
        set((state) => ({
          ventaTemporal: { ...state.ventaTemporal, sede },
        })),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      resetVenta: () =>
        set(() => ({
          ventaTemporal: {
            fecha: generarFechaActual(),
            metodoPago: "",
            montoPagado: 0,
            total: 0,
            tipoVenta: "",
            detalles: [],
            cliente: undefined,
            trabajador: undefined,
            sede: undefined,
          },
        })),
    }),
    {
      name: "venta-storage", // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    }
  )
);

export default useVentaStore;
