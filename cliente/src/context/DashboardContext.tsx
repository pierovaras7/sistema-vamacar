"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Trabajador } from '@/types/auth';
import { getAllTrabajadores } from '@/services/trabajadoresService';

interface DashboardContextType {
  trabajadores: Trabajador[];
  refreshTrabajadores: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

  useEffect(() => {
        refreshTrabajadores();
  }, []);

  const refreshTrabajadores = async () => {
    try {
      const data = await getAllTrabajadores();
      console.log(data);
      setTrabajadores(data);
    } catch (error: any) {
      console.error("Error al actualizar los trabajadores:", error.message);
    }
  };

  const dashboardInfo: DashboardContextType = {
    trabajadores,
    refreshTrabajadores,
  };

  return (
    <DashboardContext.Provider value={dashboardInfo}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de un DashboardProvider');
  }
  return context;
};
