// useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Module, User } from "@/types"; // Ajusta el path según tu proyecto
import { checkAuth, login, logout as LogoutSesion, refreshToken, updateProfile } from "@/services/authService"; // Asegúrate de importar los servicios correctamente

interface AuthState {
  isHydrated: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  modules: Module[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (id: number, perfil: any) => Promise<void>;
  reloadModules: (id: number) => Promise<void>; // Nueva función para recargar los módulos
  setHydrated: (hydrated: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      modules: [],
      isHydrated: false,
      login: async (username, password) => {
        try {
          const { user, isAdmin } = await login(username, password);
          set({
            user,
            isAuthenticated: true,
            isAdmin,
            modules: user.modules,
          });
          console.log("Login exitoso");
        } catch (error) {
          console.error("Error en login:", error);
          throw error;
        }
      },
      logout: async () => {
        await LogoutSesion();
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          modules: [],
        });
      },
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      updateProfile: async (id: number, perfil: any) => {
        try {
          await updateProfile(id, perfil);
          const updatedUser = await checkAuth(id);
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },
      reloadModules: async (id: number) => {
        try {
          const userLogeado = await checkAuth(id); 
          set({
            user: userLogeado,
            modules: userLogeado.modules, 
          });
        } catch (error) {
          console.error("Error al recargar los módulos:", error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    }
  )
);

export default useAuthStore;

