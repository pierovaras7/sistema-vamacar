"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, logout, checkAuth } from '@/services/authService';
import { LoginResponse, User } from '@/types/auth';

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Estado inicial del contexto
const initialState = {
  user: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {},
  logout: () => {},
  checkAuth: () => {},
};

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType>(initialState);

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode; // Especificamos que children es de tipo ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Función para iniciar sesión
  const handleLogin = async (username: string, password: string) => {
    try {
      const responseLogin = await login(username, password); // Llamada a login desde AuthService
      setUser(responseLogin.user); // Guardar usuario en el estado
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(responseLogin.user)); // Guardar usuario en localStorage
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      throw error; // Lanzar error hacia el componente
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    logout(); // Usamos la función del AuthService
    setUser(null);
    setIsAuthenticated(false);
    console.log('DESLOGEANDO DESDE CONTEXT');
  };

// Verificar autenticación al cargar el componente
const handleCheckAuth = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Establecer el usuario en el estado
      setIsAuthenticated(true);
    }
  } catch (error) {
    console.error("Error al verificar la autenticación:", error);
    setUser(null);
    setIsAuthenticated(false);
  }
};


  useEffect(() => {
    handleCheckAuth(); // Al cargar, verificamos si el usuario está autenticado
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login: handleLogin, logout: handleLogout, checkAuth: handleCheckAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
