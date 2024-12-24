// stores/authStore.ts
import { create } from "zustand";
import { login, logout as authLogout, checkAuth } from "@/services/authService";
import { User, Module } from "@/types";

// Definir la interfaz para el estado
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  modules: Module[]; // Aquí añadimos los módulos del usuario
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (updatedUser: User) => void;
}

// Crear la tienda con Zustand
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  modules: [], // Iniciar los módulos como un arreglo vacío

  login: async (username, password) => {
    try {
      const responseLogin = await login(username, password);
      const userData = responseLogin.user;
      const modules = userData.modules || []; // Suponiendo que la respuesta tiene los módulos
      const isAdminResponse = responseLogin.isAdmin;
      // Guardar los datos del usuario y los módulos en localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("isAdmin", isAdminResponse);
      localStorage.setItem("modules", JSON.stringify(modules));

      // Actualizar el estado global
      set({
        user: userData,
        isAuthenticated: true,
        isAdmin: isAdminResponse,
        modules: modules,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        modules: [],
      });
      throw error;
    }
  },

  logout: () => {
    authLogout();

    // Limpiar los datos del usuario y los módulos en localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("modules");

    // Actualizar el estado global
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      modules: [],
    });
  },

  checkAuth: () => {
    const user = localStorage.getItem("user");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const modules = JSON.parse(localStorage.getItem("modules") || "[]");

    if (user && isAuthenticated) {
      set({
        user: JSON.parse(user),
        isAuthenticated,
        isAdmin,
        modules,
      });
    }
  },

  updateUser: (updatedUser) => {
    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
  },
}));

// Verificar la autenticación al iniciar
useAuthStore.getState().checkAuth();

export default useAuthStore;
