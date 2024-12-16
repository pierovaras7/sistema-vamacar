// app/unauthorized/page.tsx
import React from 'react';

const Unauthorized = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="mt-4 text-lg text-gray-600">No tienes permisos para acceder a esta página.</p>
      </div>
    </div>
  );
};

export default Unauthorized;
