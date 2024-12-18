"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login, logout as authLogout } from "@/services/authService";
import { LoginResponse, Trabajador, User } from "@/types/auth";

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Estado inicial del contexto
const initialState: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  checkAuth: () => {},
};

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType>(initialState);

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Función para iniciar sesión
  const handleLogin = async (username: string, password: string) => {
    try {
      const responseLogin = await login(username, password);
      const userData = responseLogin.user;
      const trabajadorData = responseLogin.trabajador;
      setUser(userData);
      setIsAuthenticated(true);

      // Guardar usuario y trabajador en localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("trabajador", JSON.stringify(trabajadorData));
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);

    // Eliminar usuario y trabajador de localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("trabajador");
  };

  // Verificar autenticación al cargar el componente
  const handleCheckAuth = () => {
    const storedUser = localStorage.getItem("user");
    const storedTrabajador = localStorage.getItem("trabajador");

    if (storedUser && storedTrabajador) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    handleCheckAuth(); // Verifica la autenticación al cargar el componente
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        checkAuth: handleCheckAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
