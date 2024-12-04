import React, { ReactNode } from 'react';
import { TrabajadoresProvider } from './entitiesProviders/TrabajadorContext';


export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <TrabajadoresProvider>
            {children}
    </TrabajadoresProvider>
  );
};
