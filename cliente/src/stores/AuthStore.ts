import { create } from "zustand";
import { login, logout as authLogout, checkAuth } from "@/services/authService";
import { User } from "@/types/auth";

// Definir la interfaz para el estado
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (updatedUser: User) => void;
}

// Crear la tienda con Zustand
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  // Función para iniciar sesión
  login: async (username, password) => {
    try {
      const responseLogin = await login(username, password);
      const userData = responseLogin.user;

      // Guardar los datos del usuario en localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");

      // Actualizar el estado global
      set({
        user: userData,
        isAuthenticated: true,
      });
    } catch (error) {
      // Resetear el estado en caso de error
      set({
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Función para cerrar sesión
  logout: () => {
    authLogout();

    // Limpiar los datos del usuario en localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");

    // Actualizar el estado global
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  // Función para verificar autenticación al cargar la página
  checkAuth: () => {
    const user = localStorage.getItem("user");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (user && isAuthenticated) {
      set({
        user: JSON.parse(user),
        isAuthenticated,
      });
    }
  },

   // Función para actualizar los datos del usuario
   updateUser: (updatedUser) => {
    set({ user: updatedUser });  // Actualizar el estado global de Zustand
    localStorage.setItem("user", JSON.stringify(updatedUser));  // Actualizar el localStorage
  },
  
}));

// Verificar la autenticación al iniciar
useAuthStore.getState().checkAuth();

export default useAuthStore;
