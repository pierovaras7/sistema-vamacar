import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  name: string;
  isHydrated: boolean;
  setName: (newName: string) => void;
  setHydrated: (hydrated: boolean) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      isHydrated: false, // Estado inicial para rastrear la hidratación
      setName: (newName) => set({ name: newName }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true); // Marcar como hidratado después de cargar los datos
      },
    }
  )
);

export default useUserStore;
