import { MovInventario } from "@/types";
import { EyeIcon } from "@heroicons/react/16/solid";
import React, { useState } from "react";




const MovimientosInventario= ({
  data,
  codigo,
}: {
  data?: MovInventario[];
  codigo?: string;
})  => {
  const [visible, setVisible] = useState(false);

  const handleOpenModal = () => setVisible(true);

  const handleCloseModal = () => setVisible(false);

  return (
    <>
      <button
        className="flex items-center justify-center bg-blue-500 text-white rounded w-6 h-6 md:w-10 md:h-10"
        onClick={handleOpenModal}
      >
        <EyeIcon className="h-7 w-7 text-white" />
        </button>
      { visible &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full mx-4 md:w-1/2 p-6">
            <h2 className="text-xl font-semibold mb-4">Ver movimientos del Inventario del producto {codigo}</h2>
            {/* {error && <div className="text-red-500 mb-4">{error}</div>} */}
            <div
            >
              <div className="space-y-4">
              {data && data.length > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border text-center border-gray-200 px-4 py-2 text-gray-700">Tipo</th>
                      <th className="border text-center border-gray-200 px-4 py-2  text-gray-700">Descripcion</th>
                      <th className="border text-center border-gray-200 px-4 py-2  text-gray-700">Fecha</th>
                      <th className="border text-center border-gray-200 px-4 py-2  text-gray-700">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data
                      .map((movimiento, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-200 px-4 py-2 text-gray-800">
                          {movimiento.tipo}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-800">
                            {movimiento.descripcion}
                          </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-800">{movimiento.fecha}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-800">{movimiento.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-700">No hay movimientos para este inventario.</div>
              )}
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 text-gray-700 rounded px-4 py-2 hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
              
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default MovimientosInventario;
