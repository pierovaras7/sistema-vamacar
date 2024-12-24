import { create } from 'zustand';
import { getModules } from '@/services/usersService'; // Asegúrate de ajustar la ruta según sea necesario
import { Module } from '@/types'; // Define este tipo según la estructura de tus módulos

interface DashboardStore {
  modules: Module[];
  isLoading: boolean;
  fetchModules: () => Promise<void>;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  modules: [],
  isLoading: false,

  fetchModules: async () => {
    set({ isLoading: true });
    try {
      const modules = await getModules();
      set({ modules });
    } catch (error) {
      console.error('Error al obtener módulos:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDashboardStore;
